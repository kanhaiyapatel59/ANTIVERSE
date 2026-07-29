import os
import re
import urllib.parse
import webbrowser
from database.db import log_activity

async def send_whatsapp_group_message(group_identifier: str, message_text: str) -> dict:
    """
    100% Automated WhatsApp Group Dispatcher targeting group 'NDRF' or custom Group Invite Link.
    Extracts group ID from invite link (https://chat.whatsapp.com/ID) to send automatically via pywhatkit/API.
    """
    target = group_identifier.strip() if group_identifier else "NDRF"
    formatted_msg = f"🚨 *GROUP: NDRF DISPATCH FORCE* 🚨\n\n{message_text}\n\n[Automated NDRF AI Command Center Alert]"

    # Extract group code if an invite link was provided (e.g. https://chat.whatsapp.com/L1234567890)
    group_id = None
    if "chat.whatsapp.com/" in target:
        match = re.search(r"chat\.whatsapp\.com/([a-zA-Z0-9_-]+)", target)
        if match:
            group_id = match.group(1)

    # Strategy 1: If pywhatkit is installed and group_id is available, send 100% automatically via pywhatkit
    if group_id:
        try:
            import pywhatkit as pwk
            print(f"🤖 Auto-sending to WhatsApp Group ID '{group_id}' via pywhatkit...")
            pwk.sendwhatmsg_to_group_instantly(group_id, formatted_msg, wait_time=7, tab_close=True)
            log_activity(
                agent_name="CommunicationAgent",
                action="WHATSAPP_AUTO_DISPATCH",
                status="SUCCESS",
                details=f"Automated 0-click dispatch sent to WhatsApp Group ID '{group_id}'"
            )
            return {
                "status": "SUCCESS",
                "mode": "AUTOMATED_PYWHATKIT",
                "target_group": group_id,
                "details": f"Message automatically typed and sent to WhatsApp Group ID '{group_id}'"
            }
        except Exception as err:
            print(f"⚠️ PyWhatKit execution note: {err}")

    # Strategy 2: UltraMsg / Green API / Custom WhatsApp Webhook (if ENV API key provided)
    instance_id = os.getenv("WHATSAPP_INSTANCE_ID", "")
    api_token = os.getenv("WHATSAPP_API_TOKEN", "")
    if instance_id and api_token:
        try:
            import requests
            apiUrl = f"https://api.ultramsg.com/{instance_id}/messages/chat"
            payload = {
                "token": api_token,
                "to": target if "@g.us" in target else f"{target}@g.us",
                "body": formatted_msg
            }
            res = requests.post(apiUrl, data=payload)
            return {
                "status": "SUCCESS",
                "mode": "WHATSAPP_GATEWAY_API",
                "target_group": target,
                "response": res.json()
            }
        except Exception as err:
            print(f"⚠️ WhatsApp API gateway note: {err}")

    # Strategy 3: Direct Web Deep Link fallback
    if group_id:
        url = f"https://chat.whatsapp.com/{group_id}"
    elif target.startswith("+") or target.isdigit():
        clean_num = target.replace("+", "").replace(" ", "").replace("-", "")
        url = f"https://api.whatsapp.com/send?phone={clean_num}&text={urllib.parse.quote(formatted_msg)}"
    else:
        url = f"https://wa.me/?text={urllib.parse.quote(formatted_msg)}"

    try:
        webbrowser.open(url)
        log_activity(
            agent_name="CommunicationAgent",
            action="WHATSAPP_GROUP_DISPATCH",
            status="SUCCESS",
            details=f"Dispatched WhatsApp message for group '{target}'"
        )
        return {
            "status": "SUCCESS",
            "mode": "DEEP_LINK",
            "target_group": target,
            "url": url,
            "details": f"Launched WhatsApp targeting group '{target}'"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "error": str(e)
        }
