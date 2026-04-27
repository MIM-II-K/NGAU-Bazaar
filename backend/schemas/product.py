from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from datetime import datetime
from typing import List, Optional, Dict
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
    
    model_config = ConfigDict(from_attributes = True)

class ProductVariantResponse(BaseModel):
    id: int
    name: str
    price_override: Optional[Decimal]
    stock: int
    
    model_config = ConfigDict(from_attributes = True)

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
    image_url: Optional[str] = None  # For the first image URL to show in cards
    variants: List[ProductVariantResponse] = []
    tags: Optional[List[str]] = []
    specifications: Optional[str] = None
    average_rating: float = 0.0
    view_count: int = 0
    created_at: datetime
    is_in_wishlist: bool= False  # To indicate if the product is in the user's wishlist
    
    model_config = ConfigDict(from_attributes = True)

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

    model_config = ConfigDict(from_attributes = True)
