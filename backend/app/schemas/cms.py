from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: int

class CategoryOut(CategoryBase):
    id: UUID
    is_active: bool

    class Config:
        from_attributes = True

class HeroBannerOut(BaseModel):
    id: UUID
    eyebrow: Optional[str]
    title: str
    subtitle: Optional[str]
    cta_text: str
    cta_href: str
    image_url: str
    sort_order: int

    class Config:
        from_attributes = True

class PromotionOut(BaseModel):
    id: UUID
    title: str
    subtitle: Optional[str]
    discount_text: str
    image_url: str
    theme_color: str
    category_id: Optional[UUID]

    class Config:
        from_attributes = True

class CityOut(BaseModel):
    id: UUID
    name: str
    slug: str
    image_url: str
    listing_count: int

    class Config:
        from_attributes = True
