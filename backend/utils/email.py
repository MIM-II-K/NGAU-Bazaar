import smtplib
import os
import socket
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from jinja2 import Environment, FileSystemLoader

# Resolve templates directory paths cleanly
TEMPLATE_DIR = Path(__file__).parent.parent / "templates" / "email"
os.makedirs(TEMPLATE_DIR, exist_ok=True)
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

def render_email_template(template_name: str, context: dict) -> str:
    """Compiles dynamic Jinja context arrays down to plain HTML text string."""
    try:
        template = jinja_env.get_template(template_name)
        return template.render(**context)
    except Exception as e:
        print(f"❌ Template compilation failure: {e}")
        raise e

def send_email(to_email: str, subject: str, body_html: str, attachment_path=None):
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")

    # 1. Build the Message
    msg = MIMEMultipart()
    msg["From"] = f"NGAU Bazaar <{EMAIL_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body_html, "html"))

    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            part = MIMEApplication(f.read(), Name=os.path.basename(attachment_path))
            part["Content-Disposition"] = f'attachment; filename="{os.path.basename(attachment_path)}"'
            msg.attach(part)

    # 2. The Connection Logic
    server = None
    try:
        print(f"Connecting to {EMAIL_HOST}:{EMAIL_PORT}...")
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=15)
        server.ehlo() 
        
        if server.has_extn("STARTTLS"):
            server.starttls()
            server.ehlo() 
        
        print("Logging in...")
        server.login(EMAIL_USER, EMAIL_PASS)
        
        print("Sending message...")
        server.send_message(msg)
        print("✅ Email sent successfully!")

    except socket.timeout:
        print("❌ Error: The connection to the mail server timed out.")
        raise Exception("SMTP Timeout")
    except socket.error as e:
        print(f"❌ Network Error (Errno 101/111): {e}")
        raise Exception(f"Network unreachable: Check if Render allows outbound on {EMAIL_PORT}")
    except Exception as e:
        print(f"❌ Unexpected SMTP Error: {e}")
        raise e
    finally:
        if server:
            try:
                server.quit()
            except:
                pass