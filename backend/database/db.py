import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "disaster_command.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Incidents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        location TEXT NOT NULL,
        image_url TEXT,
        people_affected INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        summary TEXT,
        full_plan TEXT
    )
    """)

    # 2. Weather Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weather (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        city TEXT NOT NULL,
        temperature REAL,
        rainfall TEXT,
        flood_risk TEXT,
        forecast TEXT,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 3. Detections Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        people_detected INTEGER,
        flood_percentage REAL,
        severity TEXT,
        building_damage TEXT,
        location_summary TEXT,
        confidence REAL,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 4. Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        water_rise_estimate TEXT,
        road_accessibility TEXT,
        urgency TEXT,
        recommended_action TEXT,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 5. Rescue Plans (Route Agent) Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rescue_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        best_team TEXT,
        best_route TEXT,
        eta TEXT,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 6. Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        nearest_shelter TEXT,
        beds INTEGER,
        food TEXT,
        medicine TEXT,
        fuel TEXT,
        boats INTEGER,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 7. Communications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS communications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        report TEXT,
        sms_alert TEXT,
        email_alert TEXT,
        emergency_broadcast TEXT,
        authority_report TEXT,
        timestamp TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # 8. Activity Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT,
        agent_name TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully with all 8 tables.")

def log_activity(agent_name: str, action: str, status: str, details: str = "", incident_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (incident_id, agent_name, action, status, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (incident_id, agent_name, action, status, details, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def get_recent_activities(limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_all_incidents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY timestamp DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

if __name__ == "__main__":
    init_db()
