from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional
from models.user import User
from utils.auth import decode_access_token


class OptionalOAuth2PasswordBearer(OAuth2PasswordBearer):
    """
    Custom OAuth2PasswordBearer that allows for optional authentication.
    
    If no token is provided, it returns None instead of raising an error.
    This is useful for endpoints that can be accessed by both authenticated and unauthenticated users.
    """
    async def __call__(self, request: Request) -> Optional[str]:
        return await super().__call__(request) if request.headers.get("Authorization") else None
    
# OAuth2 scheme - points to user login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
oauth2_scheme_optional = OptionalOAuth2PasswordBearer(tokenUrl="/users/login")


def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    
    Validates the JWT token and returns the user object.
    Raises 401 if token is invalid or user doesn't exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
    
    return user


def admin_only(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to restrict access to admin users only.
    
    Requires the user to be authenticated and have admin role.
    Raises 403 if user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def get_optional_current_user(
    token: str = Depends(oauth2_scheme_optional), 
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
            
        user_id = payload.get("user_id")
        if user_id is None:
            return None
            
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None