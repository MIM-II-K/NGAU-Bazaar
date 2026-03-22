from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import SessionLocal
from models.user import User
from utils.auth import hash_password, create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])


# -------------------------------------------------
# DB DEPENDENCY
# -------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------
# SCHEMA
# -------------------------------------------------
class SetPasswordRequest(BaseModel):
    user_id: int
    password: str = Field(..., min_length=6, description="Minimum 6 characters")


# -------------------------------------------------
# SET PASSWORD (AFTER OTP VERIFIED)
# -------------------------------------------------
@router.post(
    "/set-password",
    status_code=status.HTTP_200_OK,
)
def set_password(
    data: SetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == data.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_phone_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not verified",
        )

    if user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password already set",
        )

    user.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }