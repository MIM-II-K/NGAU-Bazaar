from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Numeric, Boolean
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime
import pytz  # for timezone handling

NEPAL_TZ = pytz.timezone("Asia/Kathmandu")

# ✅ Naive Nepal datetime
def nepal_now():
    return datetime.now(NEPAL_TZ).replace(tzinfo=None)

class Order(Base):
    __tablename__ = "orders"

    # Use UUID as primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")

    # SHIPPING FIELDS
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    province = Column(String, nullable=True)
    district = Column(String, nullable=True)
    address = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    # created_at in naive Nepal time
    created_at = Column(DateTime, default=nepal_now)

    invoice_sent = Column(Boolean, default=False)
    is_cart = Column(Boolean, default=False)  # identify cart orders
    payment_status = Column(String, default="pending")  # unpaid, paid, failed
    payment_ref = Column(String, nullable=True)  # e.g. Stripe payment intent ID
    payment_method = Column(String, nullable=True)  # e.g. card, mobile_wallet
    paid_at = Column(DateTime, nullable=True)  # when payment was completed

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(36), ForeignKey("orders.id"))  # match Order.id
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
