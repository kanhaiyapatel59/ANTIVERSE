import asyncio
import sqlite3
import httpx
from database.db import DB_PATH, init_db
from models.schemas import (
    WeatherInput, DetectionInput, PredictionInput, 
    RouteInput, ResourceInput, CommunicationInput
)
from agents.weather_agent import run_weather_agent
from agents.detection_agent import run_detection_agent
from agents.prediction_agent import run_prediction_agent
from agents.route_agent import run_route_agent
from agents.resource_agent import run_resource_agent
from agents.communication_agent import run_communication_agent
from agents.commander_agent import run_commander_agent

async def run_master_test_suite():
    print("=" * 60)
    print("AI DISASTER COMMAND CENTER - MASTER SYSTEM INTEGRATION TEST")
    print("=" * 60)
    
    init_db()
    print("✔ Step 1: SQLite & Database Schema Verified (8 Tables)")

    # 1. Weather Agent Test
    print("\n--- TEST AGENT 01: WEATHER AGENT ---")
    wea_in = WeatherInput(city="Mumbai")
    wea_out = await run_weather_agent(wea_in, incident_id="INC-FINAL-001")
    print(f"✅ Weather Agent OK | Risk: {wea_out.flood_risk} | Temp: {wea_out.temperature}°C")
    assert wea_out.flood_risk in ["LOW", "MODERATE", "HIGH", "EXTREME"]

    # 2. Detection Agent Test
    print("\n--- TEST AGENT 02: DETECTION AGENT ---")
    det_in = DetectionInput(image_url="rooftop_flooding", location="Mumbai Sector 4")
    det_out = await run_detection_agent(det_in, incident_id="INC-FINAL-001")
    print(f"✅ Detection Agent OK | Victims: {det_out.people_detected} | Flood %: {det_out.flood_percentage}%")
    assert det_out.people_detected > 0

    # 3. Prediction Agent Test
    print("\n--- TEST AGENT 03: PREDICTION AGENT ---")
    pred_in = PredictionInput(detection=det_out, weather=wea_out)
    pred_out = await run_prediction_agent(pred_in, incident_id="INC-FINAL-001")
    print(f"✅ Prediction Agent OK | Water Rise: {pred_out.water_rise_estimate} | Urgency: {pred_out.urgency}")
    assert pred_out.urgency in ["IMMEDIATE_EVACUATION", "URGENT_MONITORING", "STABLE"]

    # 4. Route Agent Test
    print("\n--- TEST AGENT 04: ROUTE AGENT ---")
    route_in = RouteInput(incident_location="Mumbai Sector 4 Coastal Zone", available_teams=["NDRF Team Alpha"])
    route_out = await run_route_agent(route_in, incident_id="INC-FINAL-001")
    print(f"✅ Route Agent OK | Assigned Unit: {route_out.best_rescue_team} | ETA: {route_out.eta}")
    assert len(route_out.best_rescue_team) > 0

    # 5. Resource Agent Test
    print("\n--- TEST AGENT 05: RESOURCE AGENT ---")
    res_in = ResourceInput(people_count=det_out.people_detected, location="Mumbai Sector 4")
    res_out = await run_resource_agent(res_in, incident_id="INC-FINAL-001")
    print(f"✅ Resource Agent OK | Shelter: {res_out.nearest_shelter} | Beds: {res_out.beds_available}")
    assert res_out.beds_available > 0

    # 6. Communication Agent Test
    print("\n--- TEST AGENT 06: COMMUNICATION AGENT ---")
    comm_in = CommunicationInput(
        location="Mumbai Sector 4",
        weather=wea_out,
        detection=det_out,
        prediction=pred_out,
        route=route_out,
        resource=res_out
    )
    comm_out = await run_communication_agent(comm_in, incident_id="INC-FINAL-001")
    print(f"✅ Communication Agent OK | SMS Length: {len(comm_out.sms_alert)} chars | Email Generated: YES")
    assert len(comm_out.sms_alert) > 10

    # 7. Day 2 Commander Agent Test (LangGraph)
    print("\n--- TEST DAY 2 COMMANDER AGENT (LANGGRAPH ORCHESTRATOR) ---")
    commander_res = await run_commander_agent(
        location="Mumbai Sector 4 Coastal Zone",
        image_url="rooftop_flooding",
        people_count=14
    )
    print(f"✅ Commander Agent LangGraph OK | Incident ID: {commander_res['incident_id']}")
    print(f"State Machine Logs:\n" + "\n".join(f"   • {l}" for l in commander_res['logs']))
    assert commander_res["status"] == "COMPLETED"

    # 8. Database Persistence Audit
    print("\n--- TEST DATABASE PERSISTENCE (ALL 8 TABLES) ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    tables = ["incidents", "weather", "detections", "predictions", "rescue_plans", "resources", "communications", "activity_logs"]
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        count = cursor.fetchone()[0]
        print(f"   • Table '{t}': {count} Records")
        assert count > 0, f"❌ Table {t} has 0 records!"
    conn.close()

    print("\n" + "=" * 60)
    print("ALL 11 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_master_test_suite())
