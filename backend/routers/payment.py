import hmac
import hashlib
import base64
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models.order import Order
from database import get_db
import requests

router = APIRouter(prefix="/payments", tags=["payments"])

# v2 Sandbox Credentials
ESEWA_MERCHANT_ID = "EPAYTEST"
ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q" 

# Frontend URLs
FRONTEND_SUCCESS = "http://localhost:3000/orders?payment=success"
FRONTEND_FAIL = "http://localhost:3000/checkout?payment=failed"

# Backend Callback (FastAPI)
CALLBACK_SUCCESS = "http://localhost:8000/payments/esewa/success"
CALLBACK_FAIL = "http://localhost:8000/payments/esewa/failure"

def generate_esewa_signature(secret_key, message):
    """Generates HMAC-SHA256 signature encoded in Base64."""
    key = secret_key.encode('utf-8')
    message = message.encode('utf-8')
    hmac_sha256 = hmac.new(key, message, hashlib.sha256).digest()
    return base64.b64encode(hmac_sha256).decode('utf-8')

# ---------------- INITIATE PAYMENT ----------------
@router.post("/esewa/initiate/{order_id}")
def initiate_esewa(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    # Math must be exact for v2 verification
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax_amt = float(subtotal) * 0.13
    delivery_charge = 100.0
    total_amt = float(subtotal) + tax_amt + delivery_charge

    # Format message: total_amount,transaction_uuid,product_code
    # Use order_id as the transaction_uuid
    signature_message = f"total_amount={total_amt},transaction_uuid={order.id},product_code={ESEWA_MERCHANT_ID}"
    signature = generate_esewa_signature(ESEWA_SECRET_KEY, signature_message)

    return {
        "action": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        "fields": {
            "amount": str(subtotal),
            "tax_amount": str(tax_amt),
            "total_amount": str(total_amt),
            "transaction_uuid": order.id,
            "product_code": ESEWA_MERCHANT_ID,
            "product_service_charge": "0",
            "product_delivery_charge": str(delivery_charge),
            "success_url": CALLBACK_SUCCESS,
            "failure_url": CALLBACK_FAIL,
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature
        }
    }

# ---------------- SUCCESS CALLBACK ----------------
@router.get("/esewa/success")
def esewa_success(data: str, db: Session = Depends(get_db)):
    """eSewa v2 sends a single Base64 encoded 'data' parameter."""
    try:
        # Decode response data
        decoded_bytes = base64.b64decode(data)
        decoded_json = json.loads(decoded_bytes.decode('utf-8'))
        
        oid = decoded_json.get("transaction_uuid")
        status = decoded_json.get("status")
        
        if status != "COMPLETE":
            return RedirectResponse(url=f"{FRONTEND_FAIL}&reason=incomplete")

        # 1. Update Database
        order = db.query(Order).filter(Order.id == oid).first()
        if order:
            order.status = "paid"
            order.payment_status = "PAID"
            order.payment_ref = decoded_json.get("transaction_code")
            order.payment_method = "ESEWA"
            order.paid_at = datetime.utcnow()
            db.commit()

        return RedirectResponse(url=FRONTEND_SUCCESS)
        
    except Exception as e:
        print(f"Verification Error: {e}")
        return RedirectResponse(url=f"{FRONTEND_FAIL}&reason=internal_error")