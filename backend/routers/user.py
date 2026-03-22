from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import or_
import os

from schemas.user import (
    UserResponse,
    UserCreate,
    Token,
    UserLogin,
    UserUpdate,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from models.user import User
from utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_password_reset_token,
    decode_password_reset_token,
)
from utils.dependencies import get_db, get_current_user, admin_only
from utils.email import send_email

router = APIRouter(prefix="/users", tags=["users"])

# ------------------------------------------------------------------
# ADMIN: GET ALL USERS
# ------------------------------------------------------------------

@router.get("/all", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only),
):
    return db.query(User).all()

# ------------------------------------------------------------------
# REGISTER
# ------------------------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        role="user",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# ------------------------------------------------------------------
# LOGIN
# ------------------------------------------------------------------

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        or_(
            User.email == credentials.email_or_username,
            User.username == credentials.email_or_username,
        )
    ).first()

    if not db_user or not verify_password(
        credentials.password, db_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=db_user.id,
        role=db_user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ------------------------------------------------------------------
# CURRENT USER
# ------------------------------------------------------------------

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user

# ------------------------------------------------------------------
# UPDATE PROFILE
# ------------------------------------------------------------------

@router.put("/me", response_model=UserResponse)
def update_current_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if (
        db.query(User)
        .filter(User.email == data.email, User.id != current_user.id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use",
        )

    if (
        db.query(User)
        .filter(User.username == data.username, User.id != current_user.id)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    current_user.username = data.username
    current_user.email = data.email

    if data.password:
        current_user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(current_user)

    return current_user

# ------------------------------------------------------------------
# GET USER BY ID
# ------------------------------------------------------------------

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user

# ------------------------------------------------------------------
# FORGOT PASSWORD
# ------------------------------------------------------------------

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(User.email == data.email).first()

    # Always return success (prevent email enumeration)
    if user:
        token = create_password_reset_token(user_id=user.id)
        frontend_url = os.getenv(
            "FRONTEND_URL", "http://localhost:3000"
        )

        reset_link = f"{frontend_url}/reset-password?token={token}"

        send_email(
            to_email=user.email,
            subject="Reset your password",
            body=f"""
Hello {user.username},

Click the link below to reset your password.
This link expires in 15 minutes.

{reset_link}

If you did not request this, you can safely ignore this email.
""",
        )

    return {
        "message": "A password reset link has been sent to your email."
    }

# ------------------------------------------------------------------
# RESET PASSWORD
# ------------------------------------------------------------------

@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):

    user_id = decode_password_reset_token(data.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {
        "message": "Password reset successful. You can now log in with your new password."
    }
