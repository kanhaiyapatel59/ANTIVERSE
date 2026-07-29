import asyncio
import time
import random
from typing import Dict, Any
from agents.commander_agent import run_commander_agent

class AutonomousDisasterMonitor:
    """
    Industry-Grade Autonomous Background Monitoring Event Loop.
    Continuously monitors IoT water level telemetry & cloudburst radars.
    Autonomously triggers the LangGraph Multi-Agent Commander Graph when disaster thresholds are crossed.
    """
    def __init__(self):
        self.is_running = False
        self.trigger_threshold_meters = 2.0
        self.last_trigger_time = 0
        self.sensor_logs = []

    async def start_autonomous_loop(self, callback=None):
        self.is_running = True
        print("🤖 [AUTONOMOUS AGENT MONITOR] Starting background IoT sensor monitoring loop...")
        
        while self.is_running:
            # Simulate real-time IoT water gauge reading (e.g. Meenachil River Basin / Mumbai Coast)
            water_rise_rate = round(random.uniform(0.8, 3.5), 2)
            rainfall_intensity = round(random.uniform(40.0, 160.0), 1)

            reading = {
                "timestamp": time.strftime("%H:%M:%S"),
                "water_rise_meters": water_rise_rate,
                "rainfall_mm_hr": rainfall_intensity,
                "sector": "Mumbai Sector 4 Coastal Zone",
                "triggered": False
            }

            # Autonomous Trigger Condition: Water rise > 2.0m OR Rain > 100mm/hr
            current_time = time.time()
            if (water_rise_rate >= self.trigger_threshold_meters or rainfall_intensity >= 100.0) and (current_time - self.last_trigger_time > 30):
                reading["triggered"] = True
                self.last_trigger_time = current_time
                print(f"🚨 [AUTONOMOUS TRIGGER] Emergency Threshold Crossed! Water Rise: +{water_rise_rate}m | Rain: {rainfall_intensity}mm/hr")
                print("⚡ [AUTONOMOUS EXECUTION] Launching LangGraph Multi-Agent Commander Pipeline...")

                # Autonomously execute master commander pipeline
                try:
                    result = await run_commander_agent(
                        location=reading["sector"],
                        image_url="rooftop_flooding",
                        people_count=14
                    )
                    reading["execution_result"] = {
                        "incident_id": result.get("incident_id"),
                        "master_plan": result.get("master_plan")[:150] + "..."
                    }
                    if callback:
                        await callback(reading)
                except Exception as err:
                    print(f"⚠️ Autonomous Execution Warning: {err}")

            self.sensor_logs.append(reading)
            if len(self.sensor_logs) > 50:
                self.sensor_logs.pop(0)

            # Poll interval (5 seconds)
            await asyncio.sleep(5)

    def stop(self):
        self.is_running = False
        print("🛑 [AUTONOMOUS AGENT MONITOR] Background monitoring loop stopped.")

# Global instance
autonomous_monitor_instance = AutonomousDisasterMonitor()
