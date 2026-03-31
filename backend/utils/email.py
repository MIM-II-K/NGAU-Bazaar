import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

# Fetch from Environment
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_email(to_email, subject, body, attachment_path=None):
    print(f"Attempting to send email to: {to_email} via {EMAIL_HOST}")
    
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            part = MIMEApplication(f.read(), Name=os.path.basename(attachment_path))
            part["Content-Disposition"] = f'attachment; filename="{os.path.basename(attachment_path)}"'
            msg.attach(part)

    try:
        # Use a timeout to prevent the 'Network Unreachable' from hanging your whole API
        # Many cloud providers prefer Port 465 (SMTP_SSL) or 587 (starttls)
        if EMAIL_PORT == 465:
            server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, timeout=10)
        else:
            server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10)
            server.starttls()  # Upgrade to secure connection
        
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()
        print("Email sent successfully!")
        
    except smtplib.SMTPConnectError:
        print("Error: Could not connect to the SMTP server. Check Port/Host.")
        raise Exception("SMTP Connection failed")
    except Exception as e:
        print(f"Detailed Email Error: {e}")
        raise e