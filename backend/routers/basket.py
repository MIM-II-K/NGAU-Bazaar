from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models.product import Product
from models.category import Category
from decimal import Decimal

router = APIRouter(prefix="/smart-basket", tags=["Smart Basket"])

CATEGORY_PRIORITY = {
    "Pantry": 0.40,
    "Vegetables": 0.25,
    "Fruits": 0.15,
    "Drinks": 0.10,
    "Snacks": 0.10
}


@router.get("/generate")
def generate_weekly_basket(
    family_size: int = Query(..., ge=1, le=10),
    budget: float = Query(..., ge=500),
    db: Session = Depends(get_db)
):

    basket_items = []
    total_calculated_price = Decimal("0.00")

    categories = db.query(Category).all()

    for cat_name, weight in CATEGORY_PRIORITY.items():

        cat_budget = Decimal(str(budget)) * Decimal(str(weight))

        target_cat = next(
            (
                c for c in categories
                if cat_name.lower() in c.name.lower()
                or c.name.lower() in cat_name.lower()
            ),
            None
        )

        if not target_cat:
            print(f"DEBUG: Category '{cat_name}' not found.")
            continue

        products = (
            db.query(Product)
            .options(joinedload(Product.images))
            .filter(
                Product.category_id == target_cat.id,
                Product.stock > 0
            )
            .order_by(func.random())
            .limit(5)
            .all()
        )

        cat_spent = Decimal("0.00")

        for p in products:

            qty = 1 if family_size <= 2 else 2

            item_cost = Decimal(str(p.price)) * qty

            if (cat_spent + item_cost) <= cat_budget:

                image_url = None

                if p.images and len(p.images) > 0:
                    image_url = p.images[0].url

                basket_items.append({
                    "product_id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "qty": qty,
                    "unit": p.unit,
                    "subtotal": float(item_cost),
                    "image": image_url
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