from pydantic import BaseModel
from datetime import datetime
from typing import List
from decimal import Decimal

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderItemAdminResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: str | None
    price: Decimal
    quantity: int
    unit: str | None = "pc"

    class Config:
        from_attributes = True

class OrderAdminResponse(BaseModel):
    id: str
    user_id: int
    username: str
    email: str
    status: str
    created_at: datetime

    full_name: str | None
    phone: str | None
    province: str | None
    district: str | None
    address: str | None
    postal_code: str | None
    notes: str | None

    tax_amount: Decimal =Decimal("0.00")
    delivery_charge: Decimal = Decimal("100.00")
    business_pan: str | None
    business_reg_no: str | None 


    items: List[OrderItemAdminResponse]

    class Config:
        from_attributes = True

class OrderItemHistoryResponse(BaseModel):
    id: int | str
    product_id: int
    product_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True

class OrderHistoryResponse(BaseModel):
    id: int | str
    status: str
    items: list[OrderItemHistoryResponse]

    class Config:
        from_attributes = True
        