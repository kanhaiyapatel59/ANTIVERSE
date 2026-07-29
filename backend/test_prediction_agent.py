import asyncio
import sqlite3
from models.schemas import WeatherOutput, DetectionOutput, PredictionInput
from agents.prediction_agent import run_prediction_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING PREDICTION AGENT ===")
    init_db()
    
    mock_weather = WeatherOutput(
        city="Mumbai",
        temperature=27.5,
        rainfall="142mm/hr Heavy Cloudburst",
        flood_risk="EXTREME",
        weather_forecast="Torrential precipitation active."
    )
    
    mock_detection = DetectionOutput(
        people_detected=14,
        flood_percentage=82.5,
        severity="CRITICAL",
        building_damage="SEVERE",
        location_summary="Stranded rooftop victims in sector 4.",
        confidence=0.94
    )
    
    input_data = PredictionInput(
        detection=mock_detection,
        weather=mock_weather
    )
    
    print(f"1. Sending Input with Weather & Detection data.")
    result = await run_prediction_agent(input_data, incident_id="INC-TEST-003")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert result.road_accessibility in ["BLOCKED", "SEVERELY_RESTRICTED", "PASSABLE"]
    assert result.urgency in ["IMMEDIATE_EVACUATION", "URGENT_MONITORING", "STABLE"]
    assert len(result.recommended_action) > 10
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions WHERE incident_id='INC-TEST-003' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Prediction output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Prediction Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
