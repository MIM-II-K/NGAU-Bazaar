from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import (
    OrderItemHistoryResponse, OrderResponse, OrderCreate, 
    OrderHistoryResponse, OrderAdminResponse, OrderItemAdminResponse
)
from database import SessionLocal
from utils.dependencies import get_current_user, admin_only
from utils.email import send_email
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/orders", tags=["orders"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- ADMIN: GET ALL ORDERS ----------------
@router.get("/admin", response_model=list[OrderAdminResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    user=Depends(admin_only),
    status: str | None = None,
    page: int = 1,
    limit: int = 50
):
    offset = (page - 1) * limit
    query = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.images) 
        )
        .filter(Order.is_cart == False)
        .order_by(Order.created_at.desc())
    )

    if status:
        query = query.filter(Order.status == status)

    orders = query.offset(offset).limit(limit).all()
    
    result = []
    for order in orders:
        items = [
            OrderItemAdminResponse(
                id=i.id,
                product_id=i.product_id,
                product_name=i.product.name if i.product else "Unknown",
                product_image=i.product.images[0].url if i.product and i.product.images else "",
                price=i.price,
                quantity=i.quantity,
                unit=i.product.unit if i.product else "pc"
            ) for i in order.items
        ]
        
        result.append(OrderAdminResponse(
            id=order.id,
            user_id=order.user_id,
            username=order.user.username if order.user else "Deleted User",
            email=order.user.email if order.user else "N/A",
            status=order.status,
            created_at=order.created_at,
            full_name=order.full_name or "N/A",
            phone=order.phone or "N/A",
            province=order.province or "N/A",
            district=order.district or "N/A",
            address=order.address or "N/A",
            postal_code=order.postal_code,
            notes=order.notes,
            items=items
        ))
    return result

# ---------------- ADMIN: UPDATE STATUS ----------------
@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(admin_only)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    allowed_status = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if status not in allowed_status:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed_status}")

    transitions = {
        "pending": ["paid", "cancelled"],
        "paid": ["shipped", "cancelled"],
        "shipped": ["delivered"],
        "delivered": [],
        "cancelled": []
    }

    if status not in transitions[order.status]:
        raise HTTPException(status_code=400, detail=f"Cannot change status from {order.status} to {status}")

    order.status = status
    db.commit()

    if status in ["shipped", "delivered"]:
        send_email(
            to_email=order.user.email,
            subject=f"Your Order #{order.id} is now {status}",
            body=f"Hello {order.user.username}, your order status is now {status}."
        )

    return {"message": "Status updated", "order_id": order.id, "new_status": order.status}

# ---------------- USER: PAY ORDER ----------------
@router.post("/{order_id}/pay")
def pay_order(
    order_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order already processed")

    order.status = "paid"
    db.commit()

    return {"message": "Payment successful", "order_id": order.id, "status": order.status}

# ---------------- USER: ORDER HISTORY ----------------
@router.get("/history", response_model=list[OrderHistoryResponse])
def get_order_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [
        OrderHistoryResponse(
            id=order.id,
            status=order.status,
            items=[
                OrderItemHistoryResponse(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=item.product.name if item.product else "Unknown",
                    quantity=item.quantity or 0,
                    price=Decimal(item.price or 0)
                ) for item in order.items
            ]
        ) for order in orders
    ]

# ---------------- USER: VIEW DETAIL ----------------
@router.get("/{order_id}")
def get_order_detail(order_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id, Order.user_id == user.id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "status": order.status,
        "items": [
            {
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price),
                "subtotal": float(item.quantity * item.price)
            } for item in order.items
        ],
        "total": float(sum(item.quantity * item.price for item in order.items))
    }