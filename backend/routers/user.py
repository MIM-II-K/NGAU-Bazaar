from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_
import os
from supabase import create_client, Client
import uuid

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

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
avatar_bucket = os.getenv("AVATAR_BUCKET", "profiles")

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
@router.put("/me") # Remove response_model to send the token back too
async def update_current_user(
    username: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        current_user.username = username
        current_user.email = email

        current_user.phone = phone.strip() if phone and phone.strip() else None
        current_user.bio = bio.strip() if bio and bio.strip() else None
        
        if password:
            current_user.hashed_password = hash_password(password)

        if profile_image:
            file_ext = profile_image.filename.split(".")[-1]
            file_path = f"avatars/{current_user.id}_{uuid.uuid4()}.{file_ext}"
            content = await profile_image.read()
            
            # FIX: Uploading with correct content-type helps prevent 500 errors
            supabase.storage.from_(avatar_bucket).upload(
                path=file_path, 
                file=content,
                file_options={
                    "content-type": profile_image.content_type,
                    "x-upsert": "true"}  # Ensure it overwrites existing file
            )

            public_url = supabase.storage.from_("profiles").get_public_url(file_path)
            current_user.profile_image_url = public_url

        db.commit()
        db.refresh(current_user)

        # Generate fresh token to keep the session in sync (Fixes 401)
        new_token = create_access_token(user_id=current_user.id, role=current_user.role)

        return {
            "user": current_user, 
            "access_token": new_token,
            "token_type": "bearer"
        }
    except Exception as e:
        db.rollback()
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
# DELETE OWN ACCOUNT
# ------------------------------------------------------------------
@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_self(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Optional: Delete their avatar from Supabase if it exists
        if current_user.profile_image_url:
            # Extract file path from URL logic here if needed
            pass
            
        db.delete(current_user)
        db.commit()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete account")
    
# ------------------------------------------------------------------
# FORGOT PASSWORD


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks, # Run email sending in background
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()

    # Always return success to prevent email enumeration (Security Best Practice)
    if user:
        token = create_password_reset_token(user_id=user.id)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173") # Default Vite port
        reset_link = f"{frontend_url}/reset-password?token={token}"

        # Create a professional HTML body
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello <strong>{user.username}</strong>,</p>
            <p>We received a request to reset your password for your <strong>NGAU Bazaar</strong> account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                   Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link will expire in 15 minutes.</p>
            <p style="color: #999; font-size: 0.8em; border-top: 1px solid #eee; pt: 20px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
        """

        # Use background tasks so the API response isn't delayed by the SMTP server
        background_tasks.add_task(
            send_email,
            to_email=user.email,
            subject="Reset Your NGAU Bazaar Password",
            body=html_content
        )

    return {
        "message": "If an account exists with that email, a reset link has been sent."
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
