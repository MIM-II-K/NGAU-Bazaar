from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from .category import CategoryResponse

# Schema for creating/updating a product
class ProductCreate(BaseModel):
    name: str
    price: Decimal
    unit: str = "pc"
    category_id: int
    quantity: int = 0
    description: str | None = None
    stock: int = 0
    tags: Optional[List[str]] = []
    slug: Optional[str] = None

class ProductImageResponse(BaseModel):
    id: int
    url: str
    class Config:
        from_attributes = True

class ProductVariantResponse(BaseModel):
    id: int
    name: str
    price_override: Optional[Decimal]
    stock: int
    class Config:
        from_attributes = True

# Schema for returning product info to client
class ProductResponse(BaseModel):
    id: int
    name: str
    price: Decimal
    unit: str
    discount_price: Optional[Decimal] = None
    is_flash_deal: bool = False
    deal_expiry: Optional[datetime] = None
    category_id: int
    category_name: Optional[str] = None
    category: Optional[CategoryResponse] = None
    quantity: int
    description: str | None = None
    stock: int = 0
    slug: str
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    tags: Optional[List[str]] = []
    specifications: Optional[str] = None
    average_rating: float = 0.0
    view_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True  # Important: allows SQLAlchemy models to be returned directly

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class FlashDealUpdate(BaseModel):
    is_flash_deal: Optional[bool] = None
    discount_price:Optional[Decimal] = None
    deal_expiry: Optional[datetime] = None

    class Config:
        from_attributes = True  
