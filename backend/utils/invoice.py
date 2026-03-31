import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from decimal import Decimal

# --- CONSTANTS ---
COMPANY_NAME = "NGAU Bazaar"
COMPANY_ADDRESS = "Dholimara, Jalpa, Palpa, Nepal"
SUPPORT_EMAIL = "support@ngau-bazaar.com"
RETURN_POLICY = "Returns accepted within 7 days of delivery. Contact support for assistance."

# --- FONT REGISTRATION ---
try:
    pdfmetrics.registerFont(TTFont('NotoSans', 'NotoSans-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('NotoSans-Bold', 'NotoSans-Bold.ttf'))
    FONT_NAME = "NotoSans"
    BOLD_FONT = "NotoSans-Bold"
except:
    print("Warning: Font files not found. Using Helvetica.")
    FONT_NAME = "Helvetica"
    BOLD_FONT = "Helvetica-Bold"

def generate_invoice_pro(order, user, filename=None):
    if not filename:
        filename = f"invoice_{order.id}.pdf"

    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    brand_color = colors.HexColor("#004AAD")
    
    # Custom Styles
    styles.add(ParagraphStyle(name='ModernTitle', fontName=BOLD_FONT, fontSize=26, textColor=brand_color, spaceAfter=2))
    styles.add(ParagraphStyle(name='MutedText', fontName=FONT_NAME, fontSize=9, textColor=colors.grey, leading=12))
    styles.add(ParagraphStyle(name='NormalDeva', fontName=FONT_NAME, fontSize=10, leading=14))

    elements = []

    # ---------------- HEADER ----------------
    # Use dynamic PAN/Reg from order if available, otherwise fallback to default
    pan = getattr(order, 'business_pan', '612345678')
    reg = getattr(order, 'business_reg_no', 'REG-12345-PALPA')

    header_left = [
        Paragraph(COMPANY_NAME, styles['ModernTitle']),
        Paragraph(f"PAN: {pan} | Reg: {reg}", styles['MutedText']),
        Paragraph(COMPANY_ADDRESS, styles['MutedText'])
    ]

    header_data = [[
        header_left,
        [
            Paragraph("<b>INVOICE</b>", styles['ModernTitle']),
            Paragraph(
                f"Invoice No: INV-{order.id[:8].upper()}<br/>"
                f"Order ID: {order.id}<br/>"
                f"Date: {order.created_at.strftime('%b %d, %Y') if order.created_at else datetime.now().strftime('%b %d, %Y')}",
                styles['MutedText']
            )
        ]
    ]]

    elements.append(Table(header_data, colWidths=[320, 195]))
    elements.append(Spacer(1, 30))

    # ---------------- BILLING INFO ----------------
    # Use shipping fields from order if available, else user profile
    bill_to_name = getattr(order, 'full_name', user.username) or user.username
    bill_to_address = getattr(order, 'address', 'N/A')
    
    bill_data = [
        [Paragraph("<b>BILL TO</b>", styles["MutedText"]), Paragraph("<b>PAYMENT STATUS</b>", styles["MutedText"])],
        [
            Paragraph(f"<b>{bill_to_name}</b><br/>{user.email}<br/>{bill_to_address}", styles["NormalDeva"]),
            Paragraph(f"<b>{order.status.upper()}</b><br/>{getattr(order, 'payment_method', 'N/A')}", styles["NormalDeva"])
        ]
    ]

    bill_table = Table(bill_data, colWidths=[320, 195])
    bill_table.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.8, colors.lightgrey),
        ("INNERGRID", (0,0), (-1,-1), 0.4, colors.lightgrey),
        ("BACKGROUND", (0,0), (-1,0), colors.whitesmoke),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
    ]))
    elements.append(bill_table)
    elements.append(Spacer(1, 35))

    # ---------------- ITEMS TABLE ----------------
    currency = "Rs." 
    data = [[ 'Description', 'Qty', 'Price', 'Subtotal']]

    subtotal_acc = Decimal("0.00")
    for item in order.items:
        # Safe conversion to Decimal for financial accuracy
        item_price = Decimal(str(item.price))
        item_qty = int(item.quantity)
        line_total = item_qty * item_price
        subtotal_acc += line_total
        
        data.append([
            Paragraph(getattr(item.product, 'name', 'Product'), styles['NormalDeva']),
            str(item_qty),
            f"{currency} {item_price:,.2f}",
            f"{currency} {line_total:,.2f}"
        ])

    table = Table(data, colWidths=[300, 40, 85, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), brand_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), BOLD_FONT),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('GRID', (0,0), (-1, -1), 0.1, colors.lightgrey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F2F5F9")]),
    ]))
    elements.append(table)

    # ---------------- TOTALS ----------------
    # Pull dynamic values from the database model
    tax_amount = Decimal(str(getattr(order, 'tax_amount', 0)))
    shipping_cost = Decimal(str(getattr(order, 'delivery_charge', 150)))
    grand_total = subtotal_acc + tax_amount + shipping_cost

    totals_data = [
        ["", "", "Subtotal:", f"{currency} {subtotal_acc:,.2f}"],
        ["", "", "VAT:", f"{currency} {tax_amount:,.2f}"],
        ["", "", "Shipping:", f"{currency} {shipping_cost:,.2f}"],
        ["", "", "GRAND TOTAL:", f"{currency} {grand_total:,.2f}"]
    ]

    total_table = Table(totals_data, colWidths=[300, 40, 85, 90])
    total_table.setStyle(TableStyle([
        ("LINEABOVE", (2,-1), (3,-1), 1.5, brand_color),
        ('FONTNAME', (2,-1), (3,-1), BOLD_FONT),
        ('ALIGN', (2,0), (3,-1), 'RIGHT'),
        ('TEXTCOLOR', (2,-1), (3,-1), brand_color),
    ]))

    elements.append(Spacer(1, 15))
    elements.append(total_table)

    # ---------------- QR & FOOTER ----------------
    qr_code = qr.QrCodeWidget(f"https://ngau-bazaar.com/orders/{order.id}")
    d = Drawing(60, 60)
    d.add(qr_code)
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("Scan to verify order", styles["MutedText"]))
    elements.append(d)

    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"<b>Return Policy:</b> {RETURN_POLICY}", styles['MutedText']))
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    elements.append(Paragraph(f"Thank you for shopping with {COMPANY_NAME}. Support: {SUPPORT_EMAIL}", styles['MutedText']))

    doc.build(elements)
    return filename