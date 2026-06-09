# schemas/vendor.py
from pydantic import BaseModel, Field
from typing import Optional

class VendorCreate(BaseModel):
    store_name: str = Field(..., min_length=3, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None

class VendorUpdate(BaseModel):
    store_name: Optional[str] = Field(None, min_length=3, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    banner: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    user_id: int
    store_name: str
    slug: str
    phone: Optional[str]
    address: Optional[str]
    logo: Optional[str]
    banner: Optional[str]
    description: Optional[str]
    is_verified: bool
    is_active: bool

    class Config:
        from_attributes = True