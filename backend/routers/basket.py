from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, String, cast
from database import get_db
from models.product import Product
from models.category import Category
from decimal import Decimal
from typing import List, Dict

router = APIRouter(prefix="/smart-basket", tags=["Smart Basket"])

# Production Strategy: Define how much of the budget goes to what
CATEGORY_PRIORITY = {
    "Fruits": 0.40,
    "Vegetables": 0.25,
    "Snacks": 0.25,
    "Pantry": 0.10
}

@router.get("/generate")
def generate_weekly_basket(
    family_size: int = Query(..., ge=1, le=10),
    budget: float = Query(..., ge=500), # Minimum budget in NPR
    db: Session = Depends(get_db)
):
    basket_items = []
    total_calculated_price = Decimal("0.00")
    
    # 1. Fetch all categories to map names to IDs
    categories = db.query(Category).all()
    
    for cat_name, weight in CATEGORY_PRIORITY.items():
        cat_budget = Decimal(str(budget)) * Decimal(str(weight))
        
        # Find category by name (Matches your Category model)
        target_cat = next(
            (c for c in categories if c.name.lower() in cat_name.lower() or cat_name.lower() in c.name.lower()), 
            None
        )

        # 2. Fetch products in this category with stock
        products = db.query(Product).options(joinedload(Product.images)).filter(
            Product.category_id == target_cat.id,
            Product.stock > 0
        ).order_by(func.random()).limit(5).all()

        cat_spent = Decimal("0.00")
        for p in products:
            # Simple scaling logic: Family of 4 needs ~2x a Family of 2 for most items
            qty = 1 if family_size <= 2 else 2
            item_cost = p.price * qty

            if (cat_spent + item_cost) <= cat_budget:
                basket_items.append({
                    "product_id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "qty": qty,
                    "unit": p.unit,
                    "subtotal": float(item_cost),
                    "image": p.images[0].url if p.images else None
                })
                cat_spent += item_cost
                total_calculated_price += item_cost

    return {
        "status": "success",
        "meta": {
            "family_size": family_size,
            "target_budget": budget,
            "actual_total": float(total_calculated_price)
        },
        "items": basket_items
    }