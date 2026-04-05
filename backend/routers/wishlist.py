from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.wishlist import Wishlist
from models.product import Product
from utils.dependencies import get_current_user
from database import SessionLocal
from schemas.product import ProductResponse

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

def get_db():

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[ProductResponse])
def get_user_wishlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Join with Product to get full product details for the frontend cards
    items = db.query(Product).join(Wishlist).filter(Wishlist.user_id == user.id).all()
    
    # Ensure is_in_wishlist is True for all these items so the heart stays filled
    for item in items:
        item.is_in_wishlist = True
        
    return items

@router.post("/toggle/{product_id}")
def toggle_wishlist(product_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Check if exists
    item = db.query(Wishlist).filter_by(user_id=user.id, product_id=product_id).first()
    
    if item:
        db.delete(item)
        db.commit()
        return {"status": "removed"}
    
    new_item = Wishlist(user_id=user.id, product_id=product_id)
    db.add(new_item)
    db.commit()
    return {"status": "added"}