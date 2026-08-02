from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None
    icon_url: str | None = None
    image_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    description: str | None = None
    icon_url: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(CategoryBase):
    id: uuid.UUID
    slug: str
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
