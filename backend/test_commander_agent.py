import asyncio
import sqlite3
from agents.commander_agent import run_commander_agent
from database.db import DB_PATH, init_db

async def test():
    print("=== TESTING LANGGRAPH COMMANDER AGENT ===")
    init_db()
    
    print("1. Triggering LangGraph Multi-Agent Orchestration...")
    result = await run_commander_agent(
        location="Mumbai Sector 4 Coastal Zone",
        image_url="rooftop_flooding",
        people_count=14
    )
    
    print(f"2. Orchestration Finished. Incident ID: {result['incident_id']}")
    print(f"Status: {result['status']}")
    print(f"Logs:\n" + "\n".join(f"  - {log}" for log in result["logs"]))
    print(f"\n3. Master Disaster Plan:\n{result['master_plan']}")
    
    # Assert all 6 agents were populated into shared state
    assert result["weather"] is not None, "❌ Weather agent output missing!"
    assert result["detection"] is not None, "❌ Detection agent output missing!"
    assert result["prediction"] is not None, "❌ Prediction agent output missing!"
    assert result["route"] is not None, "❌ Route agent output missing!"
    assert result["resources"] is not None, "❌ Resource agent output missing!"
    assert result["communication"] is not None, "❌ Communication agent output missing!"
    assert len(result["master_plan"]) > 30, "❌ Master plan synthesis empty!"
    
    # Assert database insertion in incidents table
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id=? ORDER BY timestamp DESC LIMIT 1", (result["incident_id"],))
    row = cursor.fetchone()
    conn.close()
    
    assert row is not None, "❌ Master Incident record was not persisted in database!"
    print(f"\n4. SQLite DB Incident Record Verified: ID {row[0]} | Location: {row[2]} | Status: {row[5]}")
    print("✅ LangGraph Commander Agent Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
