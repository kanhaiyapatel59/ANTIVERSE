import asyncio
import sqlite3
import os
from models.schemas import DetectionInput
from agents.detection_agent import run_detection_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING DETECTION AGENT ===")
    init_db()
    
    input_data = DetectionInput(
        image_url="rooftop_flooding",
        location="Submerged Sector 4"
    )
    print(f"1. Sending Input: {input_data}")
    
    result = await run_detection_agent(input_data, incident_id="INC-TEST-002")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert result.people_detected > 0
    assert 0.0 <= result.flood_percentage <= 100.0
    assert result.severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert result.building_damage in ["SEVERE", "MODERATE", "MINIMAL"]
    assert result.confidence > 0.5
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM detections WHERE incident_id='INC-TEST-002' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Detection output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Detection Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
