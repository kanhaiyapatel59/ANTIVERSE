import random
from datetime import datetime
from tools.email_dispatcher import dispatch_real_email

TARGET_PATEL_EMAIL = "patelkanhaiya916@gmail.com"

async def generate_channel_communications(location: str, weather: dict, detection: dict, prediction: dict, route: dict, resource: dict) -> dict:
    """
    Multi-channel emergency alert formatting engine.
    Produces SMS, Email, Emergency Broadcast, WhatsApp Group Alert, Hindi Alert,
    PA Loudspeaker Script, and Common Alerting Protocol (CAP v1.2) JSON payload.
    """
    loc = location or "Target Disaster Sector"

    people = detection.get("people_detected", 14) if detection else 14
    animals = detection.get("animals_detected", 0) if detection else 0
    severity = detection.get("severity", "CRITICAL") if detection else "CRITICAL"
    rainfall = weather.get("rainfall", "Heavy Cloudburst") if weather else "Heavy Cloudburst"
    water_rise = prediction.get("water_rise_estimate", "+1.8m in 3h") if prediction else "+1.8m in 3h"
    urgency = prediction.get("urgency", "IMMEDIATE_EVACUATION") if prediction else "IMMEDIATE_EVACUATION"
    team = route.get("best_rescue_team", "NDRF Battalion 8 - Alpha Force") if route else "NDRF Battalion 8"
    eta = route.get("eta", "15 mins") if route else "15 mins"
    shelter = resource.get("nearest_shelter", "St. Xavier Relief Camp") if resource else "St. Xavier Relief Camp"
    beds = resource.get("beds_available", 28) if resource else 28
    boats = resource.get("rescue_boats", 3) if resource else 3

    # 1. SMS Alert (< 160 chars)
    sms_text = f"🚨 ALERT [{severity}]: Flood surge in {loc}. Water rise {water_rise}. Dispatched {team} (ETA {eta}). Evacuate to {shelter}. Reply HELP."

    # 2. WhatsApp NDRF Group Alert
    whatsapp_text = f"""🚨 *NDRF EMERGENCY DISPATCH GROUP* 🚨
LOCATION: {loc.upper()}
SEVERITY: {severity}

SITUATIONAL ASSESSMENT:
• Stranded Casualties: {people} Humans | {animals} Livestock
• Weather Telemetry: {rainfall}
• Hydro Surge Projection: {water_rise}

TACTICAL DISPATCH DIRECTIVE:
• Dispatched Force: {team} (ETA: {eta})
• Assigned Relief Shelter: {shelter} ({beds} beds reserved)
• Deployed Rescue Boats: {boats} Units

IMMEDIATE COMMAND CENTER DISPATCH ACTIVE."""

    # 3. Formal Email Alert for patelkanhaiya916@gmail.com & NDRF Command HQ
    email_subject = f"🚨 EMERGENCY DISPATCH BRIEFING: {loc.upper()} [{severity}]"
    email_text = f"""TO: {TARGET_PATEL_EMAIL}
SUBJECT: {email_subject}

DISTRICT COLLECTOR & NDRF COMMAND HEADQUARTERS,
ATTENTION: {TARGET_PATEL_EMAIL}

1. SITUATIONAL ASSESSMENT:
   - Location: {loc}
   - Assessed Severity: {severity}
   - Weather Telemetry: {rainfall}
   - Victims Stranded: {people} humans & {animals} animals detected via drone recon
   - Hydro Surge Projection: {water_rise} | Urgency: {urgency}

2. TACTICAL DISPATCH DIRECTIVE:
   - Assigned Unit: {team}
   - Estimated Arrival: {eta}
   - Primary Shelter: {shelter} ({beds} beds reserved)
   - Allocated Rescue Boats: {boats} Motorized Units

3. ACTION REQUIRED:
   Command center on high alert. Standby for secondary status updates.

LOGISTICS CONTROL ROOM // SATELLITE DISPATCH
TARGET RECIPIENT: {TARGET_PATEL_EMAIL}
TIMESTAMP: {datetime.utcnow().isoformat()}"""

    # Dispatch real email asynchronously
    email_status = await dispatch_real_email(email_subject, email_text, TARGET_PATEL_EMAIL)

    # 4. Emergency Broadcast
    broadcast_text = f"📢 EMERGENCY BROADCAST WARNING: Severe flash flooding active in {loc}. Water levels projected to rise {water_rise}. All residents must immediately move to high ground or proceed to {shelter}. Emergency rescue team ({team}) deployed. Stay off flooded roadways!"

    # 5. Hindi Regional Alert
    hindi_alert = f"🚨 आपातकालीन चेतावनी [{severity}]: {loc} में तीव्र बाढ़ की स्थिति। जल स्तर में {water_rise} की वृद्धि। बचाव दल {team} (ETA {eta}) तैनात। तुरंत उच्च स्थान या {shelter} की ओर जाएं।"

    # 6. Ground PA System Script
    pa_script = f"Attention all residents of {loc}. This is an urgent emergency announcement from NDRF Command. Flood waters are rising at {water_rise}. Please remain calm and evacuate to {shelter} immediately. Rescue boats and rescue force {team} are arriving in {eta}. Move children, elderly, and animals to upper floors now."

    # 7. Executive Briefing
    authority_text = f"EXECUTIVE BRIEFING: Incident at {loc} rated {severity}. {people} victims & {animals} animals detected with {rainfall} active. Hydro modeling predicts {water_rise}. Dispatched {team} (ETA {eta}) to escort evacuees to {shelter} with {boats} rescue boats and {beds} beds assigned."

    # 8. Full Incident Report
    incident_report = f"COMPREHENSIVE DISASTER RESPONSE PLAN FOR {loc.upper()}\n\n" \
                      f"• TARGET RECIPIENT: {TARGET_PATEL_EMAIL}\n" \
                      f"• METEOROLOGY: {rainfall}\n" \
                      f"• AERIAL RECON: {people} human victims & {animals} animals detected, threat level {severity}.\n" \
                      f"• HYDRO MODELING: Surge estimate {water_rise}, urgency {urgency}.\n" \
                      f"• TACTICAL ROUTE: Dispatched {team} with ETA {eta}.\n" \
                      f"• LOGISTICS: Reserved {shelter} with {beds} beds and {boats} boats."

    # 9. CAP JSON Payload
    cap_json = {
        "identifier": f"CAP-DISASTER-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "sender": "NDRF_COMMAND_CENTER@gov.in",
        "recipient": TARGET_PATEL_EMAIL,
        "sent": datetime.utcnow().isoformat(),
        "status": "Actual",
        "msgType": "Alert",
        "scope": "Public",
        "info": {
            "category": "Met",
            "event": "Flash Flood & Inundation Hazard",
            "urgency": "Immediate" if urgency == "IMMEDIATE_EVACUATION" else "Expected",
            "severity": severity.title(),
            "certainty": "Observed",
            "headline": f"Flash Flood Hazard Warning for {loc}",
            "description": broadcast_text,
            "instruction": f"Evacuate immediately to {shelter}.",
            "area": {
                "areaDesc": loc
            }
        }
    }

    return {
        "incident_report": incident_report,
        "sms_alert": sms_text,
        "whatsapp_alert": whatsapp_text,
        "email_alert": email_text,
        "target_email": TARGET_PATEL_EMAIL,
        "email_status": email_status,
        "emergency_broadcast": broadcast_text,
        "hindi_alert": hindi_alert,
        "pa_audio_script": pa_script,
        "authority_report": authority_text,
        "cap_json_payload": cap_json
    }
