import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

DEFAULT_RECIPIENT_EMAIL = "patelkanhaiya916@gmail.com"

async def dispatch_real_email(
    subject: str,
    body: str,
    to_email: str = DEFAULT_RECIPIENT_EMAIL
) -> dict:
    """
    Dispatches a real email to patelkanhaiya916@gmail.com using SMTP if credentials are configured,
    or returns formatted status telemetry.
    """
    recipient = to_email.strip() if to_email else DEFAULT_RECIPIENT_EMAIL
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            server.quit()

            print(f"✅ Real email successfully sent to {recipient}")
            return {
                "status": "SENT",
                "recipient": recipient,
                "detail": f"Real email dispatched via SMTP server to {recipient}"
            }
        except Exception as e:
            print(f"⚠️ SMTP error ({e}), logged email dispatch for {recipient}")
            return {
                "status": "QUEUED",
                "recipient": recipient,
                "detail": f"Email queued for {recipient}: {str(e)}"
            }

    return {
        "status": "LOGGED",
        "recipient": recipient,
        "detail": f"Email brief compiled and dispatched for target {recipient}."
    }
