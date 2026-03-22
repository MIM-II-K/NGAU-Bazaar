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

# 1. REGISTER THE FONT (CRITICAL FOR THE Rs. SYMBOL)
# Ensure the .ttf files are in your script directory
try:
    pdfmetrics.registerFont(TTFont('NotoSans', 'NotoSans-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('NotoSans-Bold', 'NotoSans-Bold.ttf'))
    FONT_NAME = "NotoSans"
    BOLD_FONT = "NotoSans-Bold"
except:
    # Fallback if font files are missing
    print("Warning: Font files not found. Using Helvetica (Currency may show as blocks).")
    FONT_NAME = "Helvetica"
    BOLD_FONT = "Helvetica-Bold"
    COMPANY_NAME = "NGAU Bazaar"
    COMPANY_ADDRESS = "Dholimara, Jalpa, Palpa, Nepal"
    SUPPORT_EMAIL = "support@ngau-bazaar.com"

    TAX_PERCENT = 13
    SHIPPING_COST = 150.00
    DISCOUNT = 0.00

def generate_invoice_pro(order, user, filename=None):
    if not filename:
        filename = f"invoice_{order.id}.pdf"

    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    # 2. CUSTOM PROFESSIONAL STYLES
    brand_color = colors.HexColor("#004AAD") # A sharp, trust-inducing Blue
    
    styles.add(ParagraphStyle(
        name='ModernTitle', fontName=BOLD_FONT, fontSize=26, textColor=brand_color, spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        name='MutedText', fontName=FONT_NAME, fontSize=9, textColor=colors.grey, leading=12, spaceBefore=20, spaceAfter=20
    ))
    styles.add(ParagraphStyle(
        name='NormalDeva', fontName=FONT_NAME, fontSize=10, leading=14
    ))

    elements = []

    # ---------------- HEADER ----------------
    # Column 1: Company Logo/Name | Column 2: Invoice Label
    logo_path = "assets/logo.png"

    logo = None
    if os.path.exists(logo_path):
        logo = Image(logo_path, width=80, height=40)

    header_left = []
    if logo:
        header_left.append(logo)

    header_left.extend([
        Paragraph(COMPANY_NAME, styles['ModernTitle']),
        Paragraph(COMPANY_ADDRESS, styles['MutedText'])
    ])

    header_data = [
        [
            header_left,
            [
                Paragraph("<b>INVOICE</b>", styles['ModernTitle']),
                Paragraph(
                    f"Invoice No: INV-{order.id}<br/>"
                    f"Order ID: {order.id}<br/>"
                    f"Date: {datetime.now().strftime('%b %d, %Y')}",
                    styles['MutedText']
                )
            ]
        ]
    ]

    header_table = Table(header_data, colWidths=[320, 195])
    elements.append(header_table)
    elements.append(Spacer(1, 30))


    # ---------------- BILLING INFO ----------------
    bill_data = [
        [
            Paragraph("<b>BILL TO</b>", styles["MutedText"]),
            Paragraph("<b>PAYMENT STATUS</b>", styles["MutedText"])
        ],
        [
            Paragraph(
                f"""
                <b>{user.username}</b><br/>
                {user.email}
                """,
                styles["NormalDeva"]
            ),
            Paragraph(
                f"<b>{order.status.upper()}</b>",
                styles["NormalDeva"]
            )
        ]
    ]

    bill_table = Table(bill_data, colWidths=[320, 195])
    bill_table.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 0.8, colors.lightgrey),
        ("INNERGRID", (0,0), (-1,-1), 0.4, colors.lightgrey),

        ("BACKGROUND", (0,0), (-1,0), colors.whitesmoke),

        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),

        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))

    elements.append(bill_table)
    elements.append(Spacer(1, 35))


    # ---------------- ITEMS TABLE ----------------
    # The 'Rs.' symbol will now render because of NotoSans
    currency = "Rs." 
    data = [[ 'Description', 'Qty', 'Price', 'Subtotal']]

    total = 0
    for item in order.items:
        subtotal = item.quantity * float(item.price)
        total += subtotal
        data.append([
            Paragraph(getattr(item.product, 'name', 'Product'), styles['NormalDeva']),
            str(item.quantity),
            f"{currency} {item.price}",
            f"{currency} {subtotal:,.2f}"
        ])

    # Styling the Table
    table = Table(data, colWidths=[300, 40, 85, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), brand_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), BOLD_FONT),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        
        ('FONTNAME', (0,1), (-1,-1), FONT_NAME),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1, -1), 0.1, colors.lightgrey),
        ('LINEBELOW', (0,0), (-1,0), 2, brand_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F2F5F9")]),
    ]))
    elements.append(table)

    # ---------------- TOTALS ----------------
    tax_amount = (total * TAX_PERCENT)/100
    grand_total = total + tax_amount + SHIPPING_COST - DISCOUNT
    totals_data = [
        ["", "", "Subtotal:", f"{currency} {total:,.2f}"],
        ["", "", f"VAT ({TAX_PERCENT}%):", f"{currency} {tax_amount:,.2f}"],
        ["", "", "Shipping:", f"{currency} {SHIPPING_COST:,.2f}"],
    ]

    if DISCOUNT > 0:
        totals_data.append(["", "", "Discount:", f"- {currency} {DISCOUNT:,.2f}"])

    totals_data.append(
        ["", "", "GRAND TOTAL:", f"{currency} {grand_total:,.2f}"]
    )

    total_table = Table(totals_data, colWidths=[300, 40, 85, 90])
    total_table.setStyle(TableStyle([
        ("LINEABOVE", (2,-1), (3,-1), 1.5, brand_color),
        ('FONTNAME', (2,0), (3,-1), FONT_NAME),
        ('FONTNAME', (2,-1), (3,-1), BOLD_FONT),
        ('FONTSIZE', (2,-1), (3,-1), 13),
        ('ALIGN', (2,0), (3,-1), 'RIGHT'),
        ('TEXTCOLOR', (2,-1), (3,-1), brand_color),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (2,0), (3,-1), 8),
    ]))

    elements.append(Spacer(1, 15))
    elements.append(total_table)


    qr_code = qr.QrCodeWidget(f"https://ngau-bazaar.com/orders/{order.id}")
    bounds = qr_code.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]

    d = Drawing(60, 60, transform=[60./width,0,0,60./height,0,0])
    d.add(qr_code)

    elements.append(Spacer(1, 25))
    elements.append(
        Paragraph(
            "Scan to view your order online",
            styles["MutedText"]
        )
    )
    
    elements.append(Spacer(1,8))
    elements.append(d)


    # ---------------- FOOTER ----------------
    elements.append(Spacer(1, 45))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    elements.append(Spacer(1, 10))
    elements.append(
        Paragraph(
            f"Thank you for shopping with {COMPANY_NAME}. For support, contact {SUPPORT_EMAIL}.",
            styles['MutedText']
        )
    )

    doc.build(elements)

    return filename
