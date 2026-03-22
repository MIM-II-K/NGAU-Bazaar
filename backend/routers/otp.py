from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from database import SessionLocal
from models.otp import PhoneOTP
from models.user import User
from utils.otp import generate_otp, otp_expiry_time
from utils.phone import normalize_nepali_phone
from schemas.otp import SendOTPRequest, VerifyOTPRequest

router = APIRouter(prefix="/otp", tags=["otp"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

OTP_LIMIT = 5  # per 15 minutes

# ---------------- SEND OTP ----------------
@router.post("/send")
def send_otp(
    data: SendOTPRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    phone = normalize_nepali_phone(data.phone_number)
    ip = request.client.host
    now = datetime.now(timezone.utc)

    # Rate limit
    recent_count = db.query(PhoneOTP).filter(
        PhoneOTP.phone_number == phone,
        PhoneOTP.ip_address == ip,
        PhoneOTP.created_at >= now - timedelta(minutes=15)
    ).count()

    if recent_count >= OTP_LIMIT:
        raise HTTPException(429, "Too many OTP requests")

    otp = generate_otp()

    db.add(
        PhoneOTP(
            phone_number=phone,
            otp_code=otp,
            ip_address=ip,
            expires_at=otp_expiry_time(),
        )
    )
    db.commit()

    print(f"OTP for {phone}: {otp}")  # replace with SMS

    return {"message": "OTP sent"}

# ---------------- VERIFY OTP ----------------
@router.post("/verify")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    phone = normalize_nepali_phone(data.phone_number)

    otp_record = (
        db.query(PhoneOTP)
        .filter(
            PhoneOTP.phone_number == phone,
            PhoneOTP.otp_code == data.otp,
            PhoneOTP.is_used == False,
            PhoneOTP.expires_at > datetime.now(timezone.utc),
        )
        .order_by(PhoneOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(400, "Invalid or expired OTP")

    otp_record.is_used = True

    user = db.query(User).filter(User.phone_number == phone).first()

    if not user:
        user = User(
            phone_number=phone,
            username=f"user_{phone[-6:]}",
            is_phone_verified=True,
        )
        db.add(user)
    else:
        user.is_phone_verified = True

    db.commit()
    db.refresh(user)

    return {
        "message": "OTP verified",
        "user_id": user.id,
        "needs_password": user.hashed_password is None
    }