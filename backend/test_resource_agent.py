import asyncio
import sqlite3
from models.schemas import ResourceInput
from agents.resource_agent import run_resource_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING RESOURCE AGENT ===")
    init_db()
    
    input_data = ResourceInput(
        people_count=14,
        location="Mumbai Sector 4"
    )
    
    print(f"1. Sending Input: {input_data}")
    result = await run_resource_agent(input_data, incident_id="INC-TEST-005")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert len(result.nearest_shelter) > 5
    assert result.beds_available > 0
    assert result.rescue_boats >= 2
    assert "MRE" in result.food_rations
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources WHERE incident_id='INC-TEST-005' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Resource output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Resource Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
