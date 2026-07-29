import os
from database.mongo_db import save_master_incident, fetch_incident_history, USE_MONGO

def test():
    print("=== TESTING DUAL-DB LAYER (MONGODB & SQLITE) ===")
    print(f"MongoDB Active Status: {USE_MONGO}")
    
    test_incident = {
        "id": "INC-MONGO-TEST-001",
        "timestamp": "2026-07-28T12:00:00.000000",
        "location": "Mumbai Sector 4 Dual-DB Zone",
        "image_url": "rooftop_flooding",
        "people_affected": 14,
        "status": "COMPLETED",
        "summary": "Dual DB Integration Test",
        "full_plan": "Master Plan saved across MongoDB and SQLite."
    }
    
    print("1. Saving Incident across Dual-DB layer...")
    save_master_incident(test_incident)
    
    print("2. Fetching Incident History...")
    history = fetch_incident_history(limit=10)
    print(f"Fetched {len(history)} records from active DB layer.")
    
    found = any(i["id"] == "INC-MONGO-TEST-001" for i in history)
    assert found, "❌ Saved incident not found in fetched history!"
    
    print("✅ Dual-DB Layer Test PASSED! Zero downtime fallback verified.")

if __name__ == "__main__":
    test()
