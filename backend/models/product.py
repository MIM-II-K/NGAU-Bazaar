from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    price = Column(Numeric(10,2), nullable=False)
    unit = Column(String, nullable=False, default="pc")
    category_id = Column(Integer, ForeignKey("categories.id"))
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False, default=0)
    stock = Column(Integer, nullable=False, default=0)

    tags = Column(JSON, default=[])
    specifications = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    is_flash_deal = Column(Boolean, default=False)
    discount_price = Column(Numeric(10,2), nullable=True)
    deal_expiry = Column(DateTime(timezone=True))

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

    order_items = relationship(
        "OrderItem",
        back_populates="product",
        cascade="all, delete-orphan"  # delete order items if product deleted
    )
class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    url = Column(String, nullable=False)
    product = relationship("Product", back_populates="images")

class ProductVariant(Base):
    __tablename__ = "product_variants"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, nullable=False) # e.g. "Size: L"
    price_override = Column(Numeric(10,2), nullable=True)
    stock = Column(Integer, default=0)
    product = relationship("Product", back_populates="variants")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    product = relationship("Product", back_populates="reviews")