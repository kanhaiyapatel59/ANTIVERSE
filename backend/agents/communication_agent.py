import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import CommunicationInput, CommunicationOutput
from tools.communication_tool import generate_channel_communications
from prompts.communication_prompts import COMMUNICATION_SYSTEM_PROMPT, build_communication_prompt
from database.db import get_db_connection, log_activity

async def run_communication_agent(input_data: CommunicationInput, incident_id: str = None) -> CommunicationOutput:
    """
    Independent Communication Agent execution function.
    1. Consumes telemetry from all previous agents.
    2. Generates format-specific outputs (SMS, Email, Broadcast, Authority Report, Hindi Alert, PA Script, CAP JSON).
    3. Synthesizes via Groq LPU / Gemini.
    4. Persists record to SQLite database and logs activity telemetry.
    """
    loc = input_data.location.strip()
    wea = input_data.weather.model_dump() if input_data.weather else {}
    det = input_data.detection.model_dump() if input_data.detection else {}
    pred = input_data.prediction.model_dump() if input_data.prediction else {}
    route = input_data.route.model_dump() if input_data.route else {}
    resource = input_data.resource.model_dump() if input_data.resource else {}

    # Step 1: Channel Formatting Engine
    comm_data = await generate_channel_communications(loc, wea, det, pred, route, resource)

    report = comm_data.get("incident_report", "")
    sms = comm_data.get("sms_alert", "")
    whatsapp = comm_data.get("whatsapp_alert", "")
    telegram = comm_data.get("telegram_alert", "")
    twitter = comm_data.get("twitter_alert", "")
    email = comm_data.get("email_alert", "")
    broadcast = comm_data.get("emergency_broadcast", "")
    authority = comm_data.get("authority_report", "")
    hindi = comm_data.get("hindi_alert", "")
    pa_script = comm_data.get("pa_audio_script", "")
    ham_radio = comm_data.get("ham_radio_script", "")
    govt_webhook = comm_data.get("government_webhook_payload", {})
    regional_alerts = comm_data.get("regional_language_alerts", {})
    cap_json = comm_data.get("cap_json_payload", {})

    # Step 2: Groq LLM (5s timeout)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_communication_prompt(loc, comm_data)
            response = await asyncio.wait_for(llm.ainvoke([("system", COMMUNICATION_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
            refined = response.content.strip()
            if len(refined) > 30:
                report = refined
        except Exception as e:
            print(f"⚠️ Groq LLM invocation timed out or failed ({e}), trying Gemini fallback...")

    # Step 3: Gemini Fallback (5s timeout)
    if report == comm_data.get("incident_report", ""):
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_communication_prompt(loc, comm_data)
                response = await asyncio.wait_for(llm.ainvoke([("system", COMMUNICATION_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
                refined = response.content.strip()
                if len(refined) > 30:
                    report = refined
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation timed out or failed ({e}), using deterministic reports...")

    output = CommunicationOutput(
        incident_report=report,
        sms_alert=sms,
        whatsapp_alert=whatsapp,
        telegram_alert=telegram,
        twitter_alert=twitter,
        email_alert=email,
        emergency_broadcast=broadcast,
        authority_report=authority,
        hindi_alert=hindi,
        pa_audio_script=pa_script,
        ham_radio_script=ham_radio,
        government_webhook_payload=govt_webhook,
        regional_language_alerts=regional_alerts,
        cap_json_payload=cap_json,
        timestamp=datetime.utcnow().isoformat()
    )

    # Step 4: Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO communications (incident_id, report, sms_alert, email_alert, emergency_broadcast, authority_report, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (incident_id, output.incident_report, output.sms_alert, output.email_alert, output.emergency_broadcast, output.authority_report, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="CommunicationAgent",
            action="MULTI_CHANNEL_DISPATCH_SENT",
            status="SUCCESS",
            details=f"SMS, Email, Broadcast, Hindi Alert & CAP Payload generated for {loc}",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist communication output to DB: {db_err}")

    return output
