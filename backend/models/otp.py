from sqlalchemy import Column, Integer, String, DateTime, Boolean, Index
from sqlalchemy.sql import func
from database import Base

class PhoneOTP(Base):
    __tablename__ = "phone_otps"

    id = Column(Integer, primary_key=True)
    phone_number = Column(String, index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    ip_address = Column(String, nullable=False)


    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_phone_otp_active", "phone_number", "otp_code", "is_used"),
    )