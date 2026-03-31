from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from models.order import Order, OrderItem
from database import SessionLocal
from utils.dependencies import get_current_user
from utils.invoice import generate_invoice_pro
from utils.email import send_email
from datetime import datetime
import os

router = APIRouter(prefix="/invoices", tags=["invoices"])

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{order_id}")
def download_invoice(
    order_id: str, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    """
    Retrieves and generates a PDF invoice for a specific order.
    Access is restricted to the order owner or administrators.
    """
    # Fetch order with related user and product data
    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Security Check: Only the owner of the order or an admin can download
    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this invoice")

    # Business Logic: Invoices are typically only available once payment is confirmed
    if order.status not in ["paid", "shipped", "delivered"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Invoice not available for order status: {order.status}"
        )

    # Define file path
    filename = f"invoice_order_{order.id}.pdf"
    
    try:
        # Generate the PDF using your utility function
        # We pass order.user to ensure the invoice has the correct billing details
        generate_invoice_pro(order, order.user, filename)

        if not os.path.exists(filename):
            raise HTTPException(status_code=500, detail="Failed to generate invoice file")

        # Return the file as a downloadable response
        return FileResponse(
            path=filename,
            media_type="application/pdf",
            filename=f"NGAU-Bazaar-Invoice-{order.id[:8]}.pdf"
        )
        
    except Exception as e:
        # Log the error in a real production environment
        print(f"Error generating invoice: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during PDF generation")

@router.post("/{order_id}/send-email")
def resend_invoice_email(
    order_id: str, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    """
    Manually triggers an email resend of the invoice to the user.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order or (user.role != "admin" and order.user_id != user.id):
        raise HTTPException(status_code=404, detail="Order not found or unauthorized")

    if order.status not in ["paid", "shipped", "delivered"]:
        raise HTTPException(status_code=400, detail="Order must be paid to send an invoice")

    filename = f"invoice_order_{order.id}.pdf"
    generate_invoice_pro(order, order.user, filename)

    send_email(
        to_email=order.user.email,
        subject=f"Your Invoice for Order #{order.id[:8]}",
        body=f"Hello {order.user.username}, please find your requested invoice attached.",
        attachment_path=filename
    )

    return {"message": "Invoice email sent successfully"}