import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import PredictionInput, PredictionOutput
from tools.prediction_tool import compute_hydro_predictions
from prompts.prediction_prompts import PREDICTION_SYSTEM_PROMPT, build_prediction_prompt
from database.db import get_db_connection, log_activity

async def run_prediction_agent(input_data: PredictionInput, incident_id: str = None) -> PredictionOutput:
    """
    Independent Prediction Agent execution function.
    1. Combines Detection and Weather agent outputs.
    2. Solves hydro-dynamic water surge, flow velocity, landslide scores, & road accessibility heuristics.
    3. Synthesizes strategic directive via Groq / Gemini.
    4. Persists record to SQLite database and logs telemetry.
    """
    det_dict = input_data.detection.model_dump()
    wea_dict = input_data.weather.model_dump()

    # Step 1: Hydro-Dynamic Solver
    hydro = await compute_hydro_predictions(det_dict, wea_dict)

    water_rise = hydro.get("water_rise_estimate", "+1.5m in 3h")
    road_acc = hydro.get("road_accessibility", "SEVERELY_RESTRICTED")
    urgency = hydro.get("urgency", "URGENT_MONITORING")
    heuristic_action = hydro.get("recommended_action", "")
    velocity = hydro.get("surge_velocity_ms", 1.8)
    tti = hydro.get("time_to_peak_hours", 3.5)
    landslide_score = hydro.get("landslide_score", 65)
    sec_hazards = hydro.get("secondary_hazards", [])
    risk_scenarios = hydro.get("risk_scenarios", {})

    action_directive = ""

    # Step 2: Groq LLM (5s timeout)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_prediction_prompt(det_dict, wea_dict, hydro)
            response = await asyncio.wait_for(llm.ainvoke([("system", PREDICTION_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
            action_directive = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM invocation timed out or failed ({e}), trying Gemini fallback...")

    # Step 3: Gemini Fallback (5s timeout)
    if not action_directive:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_prediction_prompt(det_dict, wea_dict, hydro)
                response = await asyncio.wait_for(llm.ainvoke([("system", PREDICTION_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
                action_directive = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation timed out or failed ({e}), using deterministic action...")

    # Step 4: Rule Fallback
    if not action_directive:
        action_directive = heuristic_action

    output = PredictionOutput(
        water_rise_estimate=water_rise,
        road_accessibility=road_acc,
        urgency=urgency,
        recommended_action=action_directive,
        surge_velocity_ms=velocity,
        time_to_peak_hours=tti,
        landslide_score=landslide_score,
        secondary_hazards=sec_hazards,
        risk_scenarios=risk_scenarios,
        timestamp=datetime.utcnow().isoformat()
    )

    # Step 5: Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO predictions (incident_id, water_rise_estimate, road_accessibility, urgency, recommended_action, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (incident_id, output.water_rise_estimate, output.road_accessibility, output.urgency, output.recommended_action, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="PredictionAgent",
            action="PREDICTIVE_MODELING_COMPLETED",
            status="SUCCESS",
            details=f"Rise: {output.water_rise_estimate} | Surge: {output.surge_velocity_ms}m/s | Landslide Risk: {output.landslide_score}/100",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist prediction output to DB: {db_err}")

    return output
