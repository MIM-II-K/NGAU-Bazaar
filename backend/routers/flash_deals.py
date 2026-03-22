import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone
from database import get_db
import models
import schemas
from schemas.product import FlashDealUpdate

router = APIRouter(
    prefix="/flash-deals",
    tags=["Flash Deals"]
)

@router.get("/", response_model=List[schemas.ProductResponse])
def get_active_flash_deals(db: Session = Depends(get_db)):
    """
    Fetches active flash deals.
    Filters: is_flash_deal=True, not expired, and quantity > 0.
    """
    now = datetime.now(timezone.utc)
    deals = db.query(models.Product).filter(
        models.Product.is_flash_deal == True,
        models.Product.deal_expiry > now,
        models.Product.quantity > 0 
    ).all()
    return deals

@router.get("/top-pick", response_model=schemas.ProductResponse)
def get_featured_deal(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    deal = db.query(models.Product).filter(
        models.Product.is_flash_deal == True,
        models.Product.deal_expiry > now
    ).order_by(models.Product.discount_price.asc()).first()
    
    if not deal:
        raise HTTPException(status_code=404, detail="No active flash deals found")
    return deal

@router.patch("/update/{product_id}", response_model=schemas.ProductResponse)
def update_flash_deal_status(
    product_id: int, 
    deal_data: FlashDealUpdate, 
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Business Logic: Prevent deals longer than 5 days
    max_allowed_date = datetime.now(timezone.utc) + timedelta(days=5)
    
    if deal_data.deal_expiry:
        max_allowed_date = datetime.now(timezone.utc) + timedelta(days=5)
        if deal_data.deal_expiry > max_allowed_date:
            raise HTTPException(
                status_code=400, 
                detail="Flash deals must be set for 5 days or less."
            )

    update_data = deal_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

@router.patch("/remove/{product_id}", response_model=schemas.ProductResponse)
def remove_flash_deal(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Remove flash deal status but keep the product
    product.is_flash_deal = False
    product.discount_price = None
    product.deal_expiry = None

    db.commit()
    db.refresh(product)
    return product

