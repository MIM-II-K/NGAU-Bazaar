from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Schema for user login (accepts email or username)."""
    email_or_username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (what we return to client)."""
    id: int
    email: EmailStr
    username: str
    role: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = Field(
        default = None,
        min_length=6,
        description="New password (optional, must be at least 6 characters if provided)"
    )


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str

    model_config = ConfigDict(from_attributes=True)


class TokenPayload(BaseModel):
    """Schema for decoded JWT payload."""
    user_id: int
    role: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)