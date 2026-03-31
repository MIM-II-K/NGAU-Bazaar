from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderItemHistoryResponse, OrderResponse, OrderCreate, OrderHistoryResponse, OrderAdminResponse, OrderItemAdminResponse
from database import SessionLocal
from utils.dependencies import get_current_user, admin_only
from utils.email import send_email
from fastapi.responses import FileResponse
from utils.invoice import generate_invoice_pro
from utils.order_notification import send_invoice_after_payment
from datetime import datetime
from decimal import Decimal
import os

router = APIRouter(prefix="/orders", tags=["orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- GET ALL ORDERS (ADMIN) ----------------
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
        items = []
        for i in order.items:
            img_url = ""
            if i.product and i.product.images:
                img_url = i.product.images[0].url

            items.append(OrderItemAdminResponse(
                id=i.id,
                product_id=i.product_id,
                product_name=i.product.name if i.product else "Unknown",
                product_image=img_url,
                price=i.price,
                quantity=i.quantity,
                unit=i.product.unit if i.product else "pc"
            ))
            
        # FIX: Added the missing shipping fields here
        result.append(OrderAdminResponse(
            id=order.id,
            user_id=order.user_id,
            username=order.user.username if order.user else "Deleted User",
            email=order.user.email if order.user else "N/A",
            status=order.status,
            created_at=order.created_at,
            # --- Missing Fields Start ---
            full_name=order.full_name or "N/A",
            phone=order.phone or "N/A",
            province=order.province or "N/A",
            district=order.district or "N/A",
            address=order.address or "N/A",
            postal_code=order.postal_code,
            notes=order.notes,
            # --- Missing Fields End ---
            items=items
        ))

    return result
# ---------------- ADMIN: VIEW SINGLE ORDER ----------------
@router.get("/admin/{order_id}", response_model=OrderAdminResponse)
def get_admin_order_detail(
    order_id: str,
    db: Session = Depends(get_db),
    user=Depends(admin_only)
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderItem.product).joinedload(Product.images)
        )
        .filter(Order.id == order_id, Order.is_cart == False)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderAdminResponse(
        id=order.id,
        user_id=order.user_id,
        username=order.user.username if order.user else "",
        email=order.user.email if order.user else "",
        status=order.status,
        created_at=order.created_at,

        full_name=order.full_name,
        phone=order.phone,
        province=order.province,
        district=order.district,
        address=order.address,
        postal_code=order.postal_code,
        notes=order.notes,

        items=[
            OrderItemAdminResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                # Extract only the first URL string
                product_image=item.product.images[0].url if item.product.images else "",
                price=item.price,
                quantity=item.quantity,
                unit=item.product.unit
            )
            for item in order.items
        ]
    )

# ---------------- PAY ORDER ----------------
@router.post("/{order_id}/pay")
def pay_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == str(order_id))
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order already processed")

    # Update status
    order.status = "paid"
    db.commit()
    db.refresh(order)

    if not order.invoice_sent:
        def send_invoice():
            try:
                # Generate invoice PDF
                filename = f"invoice_order_{order.id}.pdf"
                generate_invoice_pro(order, user, filename)

                # Prepare order summary
                product_summary = ",".join(
                    f"{item.product.name} (x{item.quantity})" for item in order.items
                )

                # Send email with attachment
                send_email(
                    to_email=user.email,
                    subject=f"Invoice for Order #{order.id} | NGAU Bazaar",
                    body=f"""
Dear {user.username},

Thank you for shopping with NGAU Bazaar.

Your order has been successfully processed. Please find your invoice attached.

Order Summary:
- Order ID: {order.id}
- Order Status: {order.status}
- Items Purchased: {product_summary}
- Invoice Date: {datetime.now().strftime('%d %b %Y')}

For support, contact support@ngau-bazaar.com.

Warm regards,
NGAU Bazaar Team
""",
                    attachment_path=filename
                )

                # Mark invoice as sent
                order.invoice_sent = True
                db.commit()

                # Optional: remove local invoice file if not needed
                if os.path.exists(filename):
                    os.remove(filename)

            except Exception as e:
                print("Error sending invoice:", e)

        # Add background task
        background_tasks.add_task(send_invoice)

    return {
        "message": "Payment successful, invoice will be sent to your email shortly.",
        "order_id": order.id,
        "status": order.status
    }



@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # ✅ Check admin role using `role` field
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    # Fetch the order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Allowed statuses
    allowed_status = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if status not in allowed_status:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {allowed_status}"
        )

    # Enforce valid status transitions
    transitions = {
        "pending": ["paid", "cancelled"],
        "paid": ["shipped", "cancelled"],
        "shipped": ["delivered"],
        "delivered": [],
        "cancelled": []
    }

    if status not in transitions[order.status]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {order.status} to {status}"
        )

    # Update status
    order.status = status
    db.commit()
    db.refresh(order)

    # Send email if shipped or delivered
    if status in ["shipped", "delivered"]:
        send_email(
            to_email=order.user.email,
            subject=f"Your Order #{order.id} is now {status}",
            body=f"""
Hello {order.user.username},

Your Order #{order.id} status has been updated.

New status: {status}

Thank you for shopping with NGAU Bazaar!
"""
        )

    return {
        "message": "Order status updated",
        "order_id": order.id,
        "new_status": order.status
    }



# ---------------- GET MY ORDERS ----------------
@router.get("/my", response_model=list[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):

    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user.id)
        .all()
    )

@router.get("/history", response_model=list[OrderHistoryResponse])
def get_order_history(db: Session = Depends(get_db), user=Depends(get_current_user)):

    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == user.id)
        .order_by(Order.id.desc())
        .all()
    )

    result = []
    for order in orders:
        items = [
            OrderItemHistoryResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "Unknown Product",
                quantity=item.quantity or 0,
                price=Decimal(item.price or 0)
            )
            for item in order.items
        ]
        result.append(OrderHistoryResponse(
            id=order.id,
            status=order.status,
            items=items
        ))

    return result

# ---------------- VIEW SINGLE ORDER (USER) ----------------
@router.get("/{order_id}")
def get_order_detail(order_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):

    order = (
        db.query(Order)
        .options(joinedload(Order.items)
        .joinedload(OrderItem.product))
        .filter(Order.id == order_id, Order.user_id == user.id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    total = sum(item.quantity * item.price for item in order.items)

    return {
        "id": order.id,
        "status": order.status,
        "items": [
            {
                "product_id": item.product_id,
                "product_name":item.product.name,
                "quantity": item.quantity,
                "price": float(item.price),
                "subtotal": float(item.quantity * item.price)
            }
            for item in order.items
        ],
        "total": float(total)
    }

@router.get("/{order_id}/invoice")
def download_invoice(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)) \
              .filter(Order.id == order_id, Order.user_id == user.id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ["paid", "shipped", "delivered"]:
        raise HTTPException(status_code=400, detail="Invoice not available yet")

    filename = f"invoice_order_{order.id}.pdf"

    generate_invoice_pro(order, user, filename)
    product_summary = ",".join(
        f"{item.product.name} (x{item.quantity})"
        for item in order.items
    )

    send_email(
        to_email=user.email,
        subject=f"Invoice for Order #{order.id} | NGAU Bazaar",
        body=f"""
Dear {user.username},

Thank you for shopping with NGAU Bazaar.

We’re pleased to inform you that your order has been successfully processed.
Please find your invoice attached to this email for your records.

Order Summary
- Order ID: {order.id}
- Order Status: {order.status}
- Items Purchased: {product_summary}
- Invoice Date: {datetime.now().strftime('%d %b %Y')}

If you have any questions regarding this invoice, payment, or delivery,
please contact us at support@ngau-bazaar.com.

Warm regards,
NGAU Bazaar Team
""",
    attachment_path=filename
)

    return FileResponse(
        path=filename,
        media_type="application/pdf",
        filename=filename
    )
