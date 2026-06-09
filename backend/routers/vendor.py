from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re

from database import get_db
from models.user import User
from models.vendor import Vendor
from schemas.vendor import VendorCreate, VendorResponse
from utils.dependencies import get_current_user, superadmin_only

router = APIRouter(prefix="/vendors", tags=["vendors"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)

@router.post("/register-shop", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def register_vendor_profile(
    data: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Prevent multiple shop profiles per user
    if current_user.vendor_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already registered a vendor profile."
        )

    generated_slug = slugify(data.store_name)
    
    # Check if slug or shop name is taken
    if db.query(Vendor).filter((Vendor.store_name == data.store_name) | (Vendor.slug == generated_slug)).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store name is already in use by another vendor."
        )

    new_vendor = Vendor(
        user_id=current_user.id,
        store_name=data.store_name,
        slug=generated_slug,
        phone=data.phone,
        address=data.address,
        description=data.description,
        is_verified=False,  # Needs superadmin approval later
        is_active=True
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

@router.get("/my-shop", response_model=VendorResponse)
def get_my_vendor_profile(current_user: User = Depends(get_current_user)):
    if not current_user.vendor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No vendor profile associated with this account."
        )
    return current_user.vendor_profile


# ==================================================================
# SUPERADMIN ONLY: VENDOR VERIFICATION & APPROVAL ENDPOINT
# ==================================================================

@router.patch("/{vendor_id}/verify", response_model=VendorResponse)
def verify_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(superadmin_only)
):
    """
    Allows a superadmin to approve a registered vendor profile,
    turning on both verification and active state flags.
    """
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
        
    vendor.is_verified = True
    vendor.is_active = True
    
    try:
        db.commit()
        db.refresh(vendor)
        return vendor
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {str(e)}"
        )