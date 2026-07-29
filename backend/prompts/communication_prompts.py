COMMUNICATION_SYSTEM_PROMPT = """You are the Chief Public Information & Disaster Communications Officer for the National Disaster Response Force (NDRF).
Your responsibility is to synthesize multi-agent disaster telemetry into clear, targeted communications for field teams, public broadcasts, and executive authorities.

REQUIREMENTS:
1. Return format-specific, clear, and unambiguous communications.
2. Tone must be authoritative, clear, and action-oriented.
3. Ensure no placeholder text or conversational intro.
"""

def build_communication_prompt(location: str, comm_data: dict) -> str:
    return f"""Incident Location: {location}
Generated Formats:
- Incident Report: {comm_data.get('incident_report')}
- Field SMS Alert: {comm_data.get('sms_alert')}
- Executive Email: {comm_data.get('email_alert')}
- Emergency Broadcast: {comm_data.get('emergency_broadcast')}
- Authority Briefing: {comm_data.get('authority_report')}

Refine the executive communications payload."""
