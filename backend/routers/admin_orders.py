from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from database import SessionLocal
from models.order import Order
from utils.dependencies import get_current_user
from schemas.order import OrderAdminResponse

router = APIRouter(
    prefix="/admin/orders",
    tags=["admin-orders"]
)


# ---------------- DB DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# LIST ALL ORDERS (ADMIN)
# =========================================================
@router.get(
    "/",
    response_model=List[OrderAdminResponse],
    summary="List all orders (Admin)",
)
def list_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),

    status: Optional[str] = Query(None, description="Filter by order status"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),

    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),  # ← updated limit to match frontend
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    query = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload("product"),
        )
        .order_by(Order.created_at.desc())
    )

    if status:
        query = query.filter(Order.status == status)

    if user_id:
        query = query.filter(Order.user_id == user_id)

    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()

    return orders


# =========================================================
# GET SINGLE ORDER (ADMIN)
# =========================================================
@router.get(
    "/{order_id}",
    response_model=OrderAdminResponse,
    summary="Get order details (Admin)",
)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Admin-only access
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload("product"),
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order
