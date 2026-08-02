from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    title: str
    slug: str
    price_per_day: float
    city: Optional[str] = None
    area: Optional[str] = None
    avg_rating: float = 0.0
    review_count: int = 0

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price_per_day: float
    security_deposit: float = 0.0
    condition: str
    delivery_option: str
    city: Optional[str] = None
    area: Optional[str] = None
    category_id: UUID
    image_url: str


class ProductStatusUpdate(BaseModel):
    status: str

class ProductOut(ProductBase):
    id: UUID
    category_id: UUID
    owner_id: UUID
    is_featured: bool
    is_trending: bool
    status: str
    image_url: Optional[str] = None
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

class ProductImageOut(BaseModel):
    id: UUID
    url: str
    is_primary: bool

    class Config:
        from_attributes = True

class ProductOwnerOut(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductCategoryOut(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True

class ProductDetailOut(ProductBase):
    id: UUID
    description: Optional[str] = None
    security_deposit: float
    condition: str
    delivery_option: str
    status: str
    images: list[ProductImageOut] = []
    owner: ProductOwnerOut
    category: ProductCategoryOut
    is_wishlisted: bool = False

    class Config:
        from_attributes = True
