from pydantic import BaseModel
from typing import List
from decimal import Decimal

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    slug: str
    price: Decimal
    original_price: Decimal
    discount_percentage: int
    
    image_url: str | None = None
    subtotal: Decimal

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse]
    total_items: int
    total_price: Decimal

    class Config:
        from_attributes = True

class CartCheckoutResponse(BaseModel):
    full_name: str
    phone: str
    email: str
    province: str
    district: str
    address: str
    postal_code: str | None = None
    notes: str | None = ""
    payment_method: str = "esewa"