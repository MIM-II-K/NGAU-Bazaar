import secrets
from datetime import datetime, timedelta, timezone

OTP_EXPIRY_MINUTES = 5

def generate_otp() -> str:
    return f"{secrets.randbelow(900000) + 100000}"

def otp_expiry_time():
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)