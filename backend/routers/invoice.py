from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from models.order import Order, OrderItem
from database import SessionLocal
from utils.dependencies import get_current_user
from utils.invoice import generate_invoice_pro
from utils.email import send_email, render_email_template
from datetime import datetime
import os

router = APIRouter(prefix="/invoices", tags=["invoices"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def execute_email_worker(recipient_email: str, subject: str, body_html: str, asset_filepath: str):
    """Safely runs delivery worker thread and drops isolated assets when done."""
    try:
        send_email(
            to_email=recipient_email,
            subject=subject,
            body_html=body_html,
            attachment_path=asset_filepath
        )
    finally:
        if asset_filepath and os.path.exists(asset_filepath):
            try:
                os.remove(asset_filepath)
                print(f"🗑️ Cleaned up ephemeral attachment: {asset_filepath}")
            except Exception as e:
                print(f"Failed to clear temp file {asset_filepath}: {e}")

@router.get("/{order_id}")
def download_invoice(
    order_id: str, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
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

    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this invoice")

    if order.status not in ["paid", "shipped", "delivered"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Invoice not available for order status: {order.status}"
        )

    filename = f"invoice_order_{order.id}.pdf"
    
    try:
        generate_invoice_pro(order, order.user, filename)

        if not os.path.exists(filename):
            raise HTTPException(status_code=500, detail="Failed to generate invoice file")

        return FileResponse(
            path=filename,
            media_type="application/pdf",
            filename=f"NGAU-Bazaar-Invoice-{order.id[:8]}.pdf"
        )
    except Exception as e:
        print(f"Error generating invoice: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during PDF generation")


@router.post("/{order_id}/send-email")
def resend_invoice_email(
    order_id: str, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    """
    Triggers an asynchronous email resend of compiled premium HTML invoice summaries.
    """
    # Force eager loading inside the safe scope boundary of our main router thread request
    order = (
        db.query(Order)
        .options(
            joinedload(Order.user),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .filter(Order.id == order_id)
        .first()
    )
    
    if not order or (user.role != "admin" and order.user_id != user.id):
        raise HTTPException(status_code=404, detail="Order not found or unauthorized")

    if order.status not in ["paid", "shipped", "delivered"]:
        raise HTTPException(status_code=400, detail="Order must be paid to send an invoice")

    # Generate distinct ephemeral filename to prevent asset collisions across overlapping threads
    temp_filename = f"temp_invoice_{order.id}_{int(datetime.now().timestamp())}.pdf"
    generate_invoice_pro(order, order.user, temp_filename)

    # Compile the Jinja context parameters inside the safe timeline loop
    email_context = {
        "username": order.user.username,
        "order_id": order.id,
        "items": order.items,
        "current_year": datetime.now().year
    }
    
    # Render the structured HTML 
    compiled_body = render_email_template("invoice_order.html", email_context)
    email_subject = f"Invoice #{order.id[:8]} - NGAU Bazaar"
    recipient_address = order.user.email

    # Offload to the background worker execution flow
    background_tasks.add_task(
        execute_email_worker,
        recipient_email=recipient_address,
        subject=email_subject,
        body_html=compiled_body,
        asset_filepath=temp_filename
    )

    return {"message": "Invoice email delivery added to background worker queue"}