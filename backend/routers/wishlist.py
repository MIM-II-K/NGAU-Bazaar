from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.wishlist import Wishlist
from models.product import Product
from utils.dependencies import get_current_user
from database import SessionLocal

router = APIRouter(prefix="/wishlist", tags=["wishlist"])

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