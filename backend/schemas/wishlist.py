from pydantic import BaseModel, ConfigDict
from datetime import datetime
from .product import ProductResponse

class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    added_at: datetime
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)