import asyncio
import sqlite3
from models.schemas import CommunicationInput, WeatherOutput, DetectionOutput, PredictionOutput, RouteOutput, ResourceOutput
from agents.communication_agent import run_communication_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING COMMUNICATION AGENT ===")
    init_db()
    
    input_data = CommunicationInput(
        location="Mumbai Sector 4",
        weather=WeatherOutput(city="Mumbai", temperature=27.5, rainfall="142mm/hr", flood_risk="EXTREME", weather_forecast="Cloudburst active."),
        detection=DetectionOutput(people_detected=14, flood_percentage=82.5, severity="CRITICAL", building_damage="SEVERE", location_summary="Rooftop victims stranded.", confidence=0.94),
        prediction=PredictionOutput(water_rise_estimate="+3.4m in 3h", road_accessibility="BLOCKED", urgency="IMMEDIATE_EVACUATION", recommended_action="Airborne evac directive."),
        route=RouteOutput(best_rescue_team="NDRF Battalion 8", best_route="Highway 44 Bypass", eta="17 mins"),
        resource=ResourceOutput(nearest_shelter="St. Xavier Relief Camp", beds_available=28, food_rations="70 MREs", medicine_kits="21 Trauma Kits", fuel_liters="490L", rescue_boats=3)
    )
    
    print(f"1. Sending Input with All Prior Agent Data.")
    result = await run_communication_agent(input_data, incident_id="INC-TEST-006")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert len(result.sms_alert) > 10
    assert len(result.email_alert) > 20
    assert len(result.emergency_broadcast) > 20
    assert len(result.authority_report) > 20
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM communications WHERE incident_id='INC-TEST-006' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Communication output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Communication Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
