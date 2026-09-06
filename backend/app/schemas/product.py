from pydantic import BaseModel
from typing import Optional, List
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
    discount_percentage: int = 0
    offer_title: Optional[str] = None
    offer_active: bool = False

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
    owner_id: Optional[UUID] = None
    status: Optional[str] = "PENDING"
    image_url: Optional[str] = None
    images: Optional[List[str]] = []

class ProductStatusUpdate(BaseModel):
    status: str

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    security_deposit: Optional[float] = None
    condition: Optional[str] = None
    delivery_option: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    category_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    discount_percentage: Optional[int] = None
    offer_title: Optional[str] = None
    offer_active: Optional[bool] = None

class ProductOfferUpdate(BaseModel):
    discount_percentage: int = 0
    offer_title: Optional[str] = None
    offer_active: bool = False

class BulkOfferPayload(BaseModel):
    scope: str = "all"  # "all" or "category"
    category_id: Optional[UUID] = None
    discount_percentage: int = 0
    offer_title: Optional[str] = None
    action: str = "apply"  # "apply" or "remove"

class ProductOut(ProductBase):
    id: UUID
    category_id: UUID
    owner_id: UUID
    is_featured: bool
    is_trending: bool
    status: str
    image_url: Optional[str] = None
    is_wishlisted: bool = False
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    category_name: Optional[str] = None
    images: List[dict] = []

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
    email: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductCategoryOut(BaseModel):
    id: UUID
    name: str
    slug: Optional[str] = None

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
