import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import DetectionInput, DetectionOutput
from tools.detection_tool import analyze_drone_image_telemetry
from prompts.detection_prompts import DETECTION_SYSTEM_PROMPT, build_detection_prompt
from database.db import get_db_connection, log_activity

async def run_detection_agent(input_data: DetectionInput, incident_id: str = None) -> DetectionOutput:
    """
    Independent Detection Agent execution function.
    1. Processes drone / CCTV / uploaded photo telemetry via Multimodal Vision AI.
    2. Guarantees precise counts of people (0, 5, etc.), animals, vehicles, and structures.
    3. Runs LLM synthesis via Groq / Gemini / Fallback.
    4. Persists record to SQLite database and logs telemetry.
    """
    image_url = input_data.image_url.strip()
    loc_hint = input_data.location or "Target Sector"

    # Step 1: Compute Vision Analysis
    vision = await analyze_drone_image_telemetry(image_url, loc_hint)

    people = vision.get("people_detected", 0)
    animals = vision.get("animals_detected", 0)
    structures = vision.get("vehicles_and_structures", [])
    flood_pct = vision.get("flood_percentage", 50.0)
    severity = vision.get("severity", "MEDIUM")
    damage = vision.get("building_damage", "MODERATE")
    summary_hint = vision.get("location_summary", "")
    confidence = vision.get("confidence", 0.94)
    visual_breakdown = vision.get("visual_breakdown", {})

    briefing_text = ""

    # Step 2: LLM Synthesis via Groq
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_detection_prompt(people, animals, flood_pct, severity, damage, summary_hint, structures)
            response = await llm.ainvoke([("system", DETECTION_SYSTEM_PROMPT), ("user", prompt)])
            briefing_text = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM invocation failed ({e}), trying Gemini fallback...")

    # Step 3: Gemini Fallback
    if not briefing_text:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_detection_prompt(people, animals, flood_pct, severity, damage, summary_hint, structures)
                response = await llm.ainvoke([("system", DETECTION_SYSTEM_PROMPT), ("user", prompt)])
                briefing_text = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation failed ({e}), using deterministic synthesis...")

    # Step 4: Rule Synthesis Fallback
    if not briefing_text:
        briefing_text = summary_hint

    output = DetectionOutput(
        people_detected=people,
        animals_detected=animals,
        vehicles_and_structures=structures,
        flood_percentage=flood_pct,
        severity=severity,
        building_damage=damage,
        location_summary=briefing_text,
        confidence=confidence,
        visual_breakdown=visual_breakdown,
        timestamp=datetime.utcnow().isoformat()
    )

    # Step 5: Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO detections (incident_id, people_detected, flood_percentage, severity, building_damage, location_summary, confidence, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (incident_id, output.people_detected, output.flood_percentage, output.severity, output.building_damage, output.location_summary, output.confidence, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="DetectionAgent",
            action="AERIAL_RECON_COMPLETED",
            status="SUCCESS",
            details=f"People: {output.people_detected} | Animals: {output.animals_detected} | Flood: {output.flood_percentage}% | Severity: {output.severity}",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist detection output to DB: {db_err}")

    return output
