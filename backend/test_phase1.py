import sqlite3
import os
import sys

def test_phase1():
    print("=== PHASE 1 VERIFICATION SCRIPT ===")
    
    # 1. Check DB File existence & schema
    db_path = os.path.join(os.path.dirname(__file__), "disaster_command.db")
    if not os.path.exists(db_path):
        print("❌ FAIL: disaster_command.db not found!")
        sys.exit(1)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()

    expected_tables = [
        "incidents", "weather", "detections", "predictions", 
        "rescue_plans", "resources", "communications", "activity_logs"
    ]
    
    missing = [t for t in expected_tables if t not in tables]
    if missing:
        print(f"❌ FAIL: Missing database tables: {missing}")
        sys.exit(1)
    
    print(f"✅ DB Verification SUCCESS: All {len(expected_tables)} tables present: {tables}")
    print("✅ Phase 1 Backend Structure Initialized.")

if __name__ == "__main__":
    test_phase1()
