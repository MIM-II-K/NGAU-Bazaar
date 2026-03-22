from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas.user import UserResponse, UserLogin, Token
from models.user import User
from utils.auth import verify_password, create_access_token
from utils.dependencies import get_db, admin_only

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=Token)
def admin_login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint.
    
    Similar to user login but explicitly for admin authentication.
    Returns JWT token only if user has admin role.
    """
    # Find user by email or username
    from sqlalchemy import or_
    
    db_user = db.query(User).filter(
        or_(
            User.email == credentials.email_or_username,
            User.username == credentials.email_or_username
        )
    ).first()

    # Validate credentials
    if not db_user or not verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user has admin role
    if db_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    # Create access token
    token = create_access_token(
        user_id=db_user.id,
        role=db_user.role
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_admin_profile(admin: User = Depends(admin_only)):
    """
    Get current admin's profile.
    
    Protected route - requires admin role.
    """
    return admin


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only)
):
    """
    Get all users (admin only).
    
    Supports pagination with skip and limit parameters.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only)
):
    """
    Get a specific user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only)
):
    """
    Update a user's role (admin only).
    
    Allowed roles: 'user', 'admin'
    """
    if new_role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Allowed values: 'user', 'admin'"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = new_role
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User role updated to {new_role}",
        "user_id": user_id,
        "new_role": new_role
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only)
):
    """
    Delete a user (admin only).
    
    Admins cannot delete themselves.
    """
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }


# Example: Protect any other admin route
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only)
):
    """
    Get dashboard statistics (admin only).
    
    Example of how to protect any admin route.
    """
    total_users = db.query(User).count()
    admin_count = db.query(User).filter(User.role == "admin").count()
    user_count = db.query(User).filter(User.role == "user").count()
    
    return {
        "total_users": total_users,
        "admin_count": admin_count,
        "user_count": user_count
    }