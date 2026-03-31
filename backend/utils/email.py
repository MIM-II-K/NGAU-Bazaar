import smtplib
import os
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

def send_email(to_email, subject, body_html, attachment_path=None):
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
        
        # We set a 15-second timeout. 
        # 'Network unreachable' often happens if the DNS resolution hangs.
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=15)
        
        # Identify ourselves to the server
        server.ehlo() 
        
        # Secure the connection
        if server.has_extn("STARTTLS"):
            server.starttls()
            server.ehlo() # Re-identify after encryption
        
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
        # This is where 'Network unreachable' is caught.
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