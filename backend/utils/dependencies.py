from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from database import SessionLocal
from models.user import User
from models.vendor import Vendor
from utils.auth import decode_access_token
from constants.roles import Role


# =========================================
# OPTIONAL AUTH SCHEME
# =========================================

class OptionalOAuth2PasswordBearer(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> Optional[str]:
        return (
            await super().__call__(request)
            if request.headers.get("Authorization")
            else None
        )


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)

oauth2_scheme_optional = OptionalOAuth2PasswordBearer(
    tokenUrl="/users/login"
)


# =========================================
# DATABASE
# =========================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================
# CURRENT USER
# =========================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

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


# =========================================
# OPTIONAL CURRENT USER
# =========================================

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

        return db.query(User).filter(
            User.id == user_id
        ).first()

    except Exception:
        return None


# =========================================
# ROLE-BASED ACCESS CONTROL
# =========================================

def require_roles(allowed_roles: list):
    """
    Generic RBAC dependency.

    Example:
        Depends(require_roles(["SUPERADMIN"]))
        Depends(require_roles(["VENDOR"]))
        Depends(require_roles(["SUPERADMIN", "VENDOR"]))
    """

    def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )

        return current_user

    return role_checker


# =========================================
# SHORTCUTS
# =========================================

def superadmin_only(
    current_user: User = Depends(
        require_roles(["SUPERADMIN", "admin"])
    )
):
    return current_user


def vendor_only(
    current_user: User = Depends(
        require_roles(["VENDOR"])
    )
):
    return current_user


def vendor_or_superadmin(
    current_user: User = Depends(
        require_roles([Role.VENDOR, Role.SUPERADMIN])
    )
):
    return current_user

# =========================================
# VENDOR PROFILE RESOLVER & SHIELD
# =========================================

def get_current_vendor(
    current_user: User = Depends(get_current_user)
    ) -> Vendor:
    """
    Ensures the user has an authorized vendor profile, and returns the 
    Vendor record instance directly to your endpoints for data isolation.
    """
    # 1. Enforce Role-Based access via your existing structure
    if current_user.role != Role.VENDOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Account is not registered as a vendor."
        )

    # 2. Safety check: Does the database profile record actually exist?
    vendor = current_user.vendor_profile
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile missing. Please register your shop details."
        )

    # 3. Superadmin Verification Shield
    if not vendor.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your shop profile is awaiting admin approval and verification."
        )

    # 4. Emergency Kill-Switch / Suspension Shield
    if not vendor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your vendor profile has been temporarily deactivated."
        )

    return vendor

# =========================================
# UNIFIED MANAGEMENT SECURITY CONTEXT
# =========================================

class ProductManagerContext:
    def __init__(self, user: User, vendor: Optional[Vendor] = None, is_admin: bool = False):
        self.user = user
        self.vendor = vendor
        self.is_admin = is_admin


def get_product_manager_context(
    current_user: User = Depends(get_current_user)
) -> ProductManagerContext:
    """
    Dependency allowing absolute control for SUPERADMIN,
    and scoped ownership control for verified, active VENDORs.
    """
    if current_user.role in ["SUPERADMIN", "admin"]:
        return ProductManagerContext(user=current_user, is_admin=True)

    if current_user.role == "VENDOR":
        vendor = current_user.vendor_profile
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor profile records not found.")
        if not vendor.is_verified:
            raise HTTPException(status_code=403, detail="Your shop profile is awaiting admin approval and verification.")
        if not vendor.is_active:
            raise HTTPException(status_code=403, detail="Your vendor profile has been temporarily deactivated.")
        
        return ProductManagerContext(user=current_user, vendor=vendor, is_admin=False)

    raise HTTPException(status_code=403, detail="Permission denied")