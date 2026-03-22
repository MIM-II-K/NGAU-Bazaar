# utils/flash_deal_cleanup.py
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.product import Product

def reset_expired_flash_deals(db: Session):
    """
    Finds all products with is_flash_deal=True and deal_expiry < now,
    then resets them so they appear in the inventory scout again.
    """
    now = datetime.now(timezone.utc)
    expired_products = db.query(Product).filter(
        Product.is_flash_deal == True,
        Product.deal_expiry < now
    ).all()

    for product in expired_products:
        product.is_flash_deal = False
        product.discount_price = None
        product.deal_expiry = None

    if expired_products:
        db.commit()
    
    return len(expired_products)