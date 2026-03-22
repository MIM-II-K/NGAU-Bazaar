from pydantic import BaseModel, Field

class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)

class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str = Field(..., min_length=6, max_length=6)