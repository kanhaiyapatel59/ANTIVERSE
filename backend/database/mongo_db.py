import os
import sqlite3
import json
from datetime import datetime
from database.db import get_db_connection, get_all_incidents as get_sqlite_incidents, get_recent_activities as get_sqlite_activities

MONGODB_URI = os.getenv("MONGODB_URI", "")
USE_MONGO = False

try:
    if MONGODB_URI and MONGODB_URI.startswith("mongodb"):
        import pymongo
        mongo_client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Ping server
        mongo_client.admin.command('ping')
        mongo_db = mongo_client["disaster_command_center"]
        USE_MONGO = True
        print("✅ MongoDB connected successfully! Active Collections: incidents, weather, detections, predictions, rescue_plans, resources, communications, activity_logs")
except Exception as e:
    print(f"ℹ️ MongoDB connection not active ({e}). Defaulting to SQLite engine for 100% demo uptime.")

def save_master_incident(incident_data: dict):
    """
    Saves master incident to MongoDB if active, and always syncs to SQLite.
    """
    if USE_MONGO:
        try:
            mongo_db["incidents"].update_one(
                {"id": incident_data["id"]},
                {"$set": incident_data},
                upsert=True
            )
        except Exception as mongo_err:
            print(f"⚠️ MongoDB write error ({mongo_err}), falling back to SQLite.")

    # SQLite persistence (incidents table has no animals_affected column — omitted intentionally)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO incidents (id, timestamp, location, image_url, people_affected, status, summary, full_plan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident_data["id"],
            incident_data.get("timestamp", datetime.utcnow().isoformat()),
            incident_data["location"],
            incident_data.get("image_url", ""),
            incident_data.get("people_affected", 0),
            incident_data.get("status", "COMPLETED"),
            incident_data.get("summary", ""),
            incident_data.get("full_plan", "")
        ))
        conn.commit()
        conn.close()
    except Exception as db_err:
        print(f"⚠️ SQLite incident write error: {db_err}")


def fetch_incident_history(limit: int = 50) -> list:
    """
    Fetches incident history from MongoDB if active, or SQLite.
    """
    if USE_MONGO:
        try:
            cursor = mongo_db["incidents"].find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
            return list(cursor)
        except Exception as mongo_err:
            print(f"⚠️ MongoDB fetch error ({mongo_err}), reading from SQLite.")

    return get_sqlite_incidents()
