COMMANDER_SYSTEM_PROMPT = """You are the Supreme Commander of the National Disaster Management Authority (NDMA) & NDRF Joint Operations Room.
You have received autonomous intelligence outputs from 6 specialized AI agents: Weather, Aerial Detection, Hydro Surge Prediction, Tactical Routing, Resource Optimization, and Emergency Communications.

Your sole responsibility is to synthesize these outputs into ONE authoritative, structured MASTER DISASTER RESPONSE PLAN.

STRUCTURE YOUR PLAN EXACTLY AS FOLLOWS:
1. EXECUTIVE SITUATIONAL DIRECTIVE (Summary of threat level, victim count, and weather)
2. IMMEDIATE ACTION UNITS (Assigned rescue team, transit corridor, and ETA)
3. LOGISTICS & SHELTER COMMAND (Shelter assignment, beds, rations, medical, and boats)
4. PUBLIC ALERT & DISPATCH MATRIX (SMS, Broadcast & Authority notice confirmation)

Tone must be military-grade, clear, and unambiguous. Output ONLY the response plan without meta-comments.
"""

def build_commander_prompt(incident_id: str, location: str, state_dict: dict) -> str:
    weather = state_dict.get("weather") or {}
    detection = state_dict.get("detection") or {}
    prediction = state_dict.get("prediction") or {}
    route = state_dict.get("route") or {}
    resource = state_dict.get("resources") or {}
    comm = state_dict.get("communication") or {}

    return f"""INCIDENT ID: {incident_id}
LOCATION: {location}

1. WEATHER TELEMETRY (Agent 1):
- Temperature: {weather.get('temperature')}°C | Rain: {weather.get('rainfall')} | Risk: {weather.get('flood_risk')}
- Forecast: {weather.get('weather_forecast')}

2. AERIAL RECON TELEMETRY (Agent 2):
- Victims Stranded: {detection.get('people_detected')} | Flood Coverage: {detection.get('flood_percentage')}%
- Severity: {detection.get('severity')} | Building Damage: {detection.get('building_damage')}

3. HYDRO SURGE PREDICTION (Agent 3):
- Water Rise: {prediction.get('water_rise_estimate')} | Roads: {prediction.get('road_accessibility')}
- Urgency: {prediction.get('urgency')} | Action: {prediction.get('recommended_action')}

4. TACTICAL DISPATCH ROUTE (Agent 4):
- Assigned Team: {route.get('best_rescue_team')} | ETA: {route.get('eta')}
- Route Corridor: {route.get('best_route')}

5. LOGISTICS ALLOCATION (Agent 5):
- Shelter: {resource.get('nearest_shelter')} ({resource.get('beds_available')} beds)
- Rations: {resource.get('food_rations')} | Medicine: {resource.get('medicine_kits')}
- Fuel: {resource.get('fuel_liters')} | Boats Deployed: {resource.get('rescue_boats')}

6. COMMUNICATIONS DISPATCH (Agent 6):
- Field SMS: {comm.get('sms_alert')}
- Broadcast Notice: {comm.get('emergency_broadcast')}

Generate the Master Disaster Response Plan."""
