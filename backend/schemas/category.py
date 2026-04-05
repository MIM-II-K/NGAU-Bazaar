from pydantic import BaseModel, ConfigDict

class CategoryCreate(BaseModel):
    name : str

class CategoryResponse(CategoryCreate):
    id: int
    model_config = ConfigDict(orm_mode=True)
