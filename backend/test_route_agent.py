import asyncio
import sqlite3
from models.schemas import RouteInput
from agents.route_agent import run_route_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING ROUTE AGENT ===")
    init_db()
    
    input_data = RouteInput(
        incident_location="Mumbai Sector 4 Coastal Zone",
        available_teams=["NDRF Team Alpha", "Fire Battalion 4", "District Rescue Squad 2"]
    )
    
    print(f"1. Sending Input: {input_data}")
    result = await run_route_agent(input_data, incident_id="INC-TEST-004")
    print(f"2. Received Output:\n{result.model_dump_json(indent=2)}")
    
    # Assert output structure
    assert len(result.best_rescue_team) > 3
    assert len(result.best_route) > 10
    assert "mins" in result.eta
    
    # Assert database insertion
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rescue_plans WHERE incident_id='INC-TEST-004' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Route output was not persisted in database!"
    print(f"3. DB Record Verified: {row}")
    print("✅ Route Agent Backend Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
