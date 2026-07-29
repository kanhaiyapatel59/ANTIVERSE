import asyncio
import sqlite3
import os
import sys
from models.schemas import WeatherInput
from agents.weather_agent import run_weather_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING WEATHER AGENT ===")
    init_db()
    
    input_data = WeatherInput(city="Mumbai")
    print(f"1. Sending Input: {input_data}")
    
    result = await run_weather_agent(input_data, incident_id="INC-TEST-001")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert result.city.lower() == "mumbai"
    assert isinstance(result.temperature, float)
    assert result.flood_risk in ["LOW", "MODERATE", "HIGH", "EXTREME"]
    assert len(result.weather_forecast) > 10
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM weather WHERE city='Mumbai' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Weather output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Weather Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
