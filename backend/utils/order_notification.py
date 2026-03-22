from utils.invoice import generate_invoice_pro
from utils.email import send_email
from datetime import datetime
import os

def send_invoice_after_payment(order, user):
    filename = f"invoice_order_{order.id}.pdf"

    # Generate invoice
    generate_invoice_pro(order, user, filename)

    product_summary = ", ".join(
        f"{item.product.name} (x{item.quantity})"
        for item in order.items
    )

    # Send email with attachment
    send_email(
        to_email=user.email,
        subject=f"Invoice for Order #{order.id} | NGAU Bazaar",
        body=f"""
Dear {user.username},

Your payment for Order #{order.id} was successful.

Order Summary:
- Status: PAID
- Items: {product_summary}
- Invoice Date: {datetime.now().strftime('%d %b %Y')}

Thank you for shopping with NGAU Bazaar!

— NGAU Bazaar Team
""",
        attachment_path=filename
    )

    # Optional cleanup (comment out if you want to keep invoices)
    if os.path.exists(filename):
        os.remove(filename)
