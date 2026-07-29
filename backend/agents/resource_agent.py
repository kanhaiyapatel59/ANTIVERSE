import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import ResourceInput, ResourceOutput
from tools.resource_tool import allocate_emergency_resources
from prompts.resource_prompts import RESOURCE_SYSTEM_PROMPT, build_resource_prompt
from database.db import get_db_connection, log_activity

async def run_resource_agent(input_data: ResourceInput, incident_id: str = None) -> ResourceOutput:
    """
    Independent Resource Agent execution function.
    1. Computes shelter assignment & inventory allocations for humans and livestock.
    2. Runs Groq LPU LLM synthesis for logistics briefing.
    3. Persists record to SQLite database and logs telemetry.
    """
    count = input_data.people_count
    animals = getattr(input_data, "animals_count", 0) or 0
    loc = input_data.location.strip()

    # Step 1: Logistics & Shelter Solver
    res = await allocate_emergency_resources(count, loc, animals_count=animals)

    shelter = res.get("nearest_shelter", "St. Xavier Emergency Relief Camp")
    beds = res.get("beds_available", 180)
    food = res.get("food_rations", "50 MRE Rations")
    medicine = res.get("medicine_kits", "15 Medical Kits")
    fuel = res.get("fuel_liters", "350 Liters Fuel")
    boats = res.get("rescue_boats", 3)
    water = res.get("drinking_water_liters", 500)
    feed = res.get("livestock_feed_kg", 0)
    occupancy = res.get("shelter_occupancy_pct", 45.0)

    logistics_text = ""

    # Step 2: Groq LPU Synthesis
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_resource_prompt(count, loc, res)
            response = await llm.ainvoke([("system", RESOURCE_SYSTEM_PROMPT), ("user", prompt)])
            logistics_text = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM invocation failed ({e}), trying Gemini fallback...")

    # Step 3: Gemini Fallback
    if not logistics_text:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_resource_prompt(count, loc, res)
                response = await llm.ainvoke([("system", RESOURCE_SYSTEM_PROMPT), ("user", prompt)])
                logistics_text = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation failed ({e}), using deterministic briefing...")

    # Step 4: Rule Fallback
    if not logistics_text:
        logistics_text = f"Allocated shelter {shelter} ({beds} beds, {occupancy}% capacity) for {count} victims and {animals} livestock at {loc}. Dispatched {water}L clean water, {food}, {medicine}, {fuel}, and {boats} rescue motorboats."

    output = ResourceOutput(
        nearest_shelter=shelter,
        beds_available=beds,
        food_rations=food,
        medicine_kits=medicine,
        fuel_liters=fuel,
        rescue_boats=boats,
        drinking_water_liters=water,
        livestock_feed_kg=feed,
        shelter_occupancy_pct=occupancy,
        timestamp=datetime.utcnow().isoformat()
    )

    # Step 5: Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO resources (incident_id, nearest_shelter, beds, food, medicine, fuel, boats, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (incident_id, output.nearest_shelter, output.beds_available, output.food_rations, output.medicine_kits, output.fuel_liters, output.rescue_boats, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="ResourceAgent",
            action="RESOURCE_LOGISTICS_ALLOCATED",
            status="SUCCESS",
            details=f"Shelter: {output.nearest_shelter} | Beds: {output.beds_available} | Water: {output.drinking_water_liters}L | Feed: {output.livestock_feed_kg}kg",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist resource output to DB: {db_err}")

    return output
