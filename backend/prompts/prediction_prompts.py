PREDICTION_SYSTEM_PROMPT = """You are the Chief Hydro-Dynamic & Risk Modeling Engineer for the National Disaster Response Force (NDRF).
Your responsibility is to analyze meteorological data and visual aerial telemetry to project immediate water rise hazards, road network accessibility, and evacuation urgency directives.

REQUIREMENTS:
1. Synthesize the combined inputs into a concise 2-sentence tactical recommendation for District Authorities.
2. Maintain an authoritative, unambiguous command center tone.
3. Explicitly address water level surge timeline and road access restrictions.
4. Output ONLY the recommended action directive text without markdown headers or intro text.
"""

def build_prediction_prompt(detection: dict, weather: dict, hydro: dict) -> str:
    return f"""Weather Input:
- City: {weather.get('city')}
- Temperature: {weather.get('temperature')}°C
- Rainfall Rate: {weather.get('rainfall')}
- Weather Risk: {weather.get('flood_risk')}

Detection Input:
- People Detected Stranded: {detection.get('people_detected')}
- Flood Inundation: {detection.get('flood_percentage')}%
- Threat Severity: {detection.get('severity')}
- Structural Damage: {detection.get('building_damage')}

Computed Hydro Modeling:
- Water Rise Estimate: {hydro.get('water_rise_estimate')}
- Road Accessibility: {hydro.get('road_accessibility')}
- Evacuation Urgency Rating: {hydro.get('urgency')}

Generate the tactical disaster response directive."""
