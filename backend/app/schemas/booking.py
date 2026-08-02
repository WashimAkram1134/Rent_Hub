from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date

class ProductSimple(BaseModel):
    id: UUID
    title: str
    image_url: Optional[str] = None
    price_per_day: Optional[float] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    product_id: UUID
    start_date: date
    end_date: date
    delivery_option: str = "Pick-up"
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: UUID
    product_id: UUID
    renter_id: UUID
    owner_id: UUID
    start_date: date
    end_date: date
    total_days: int
    daily_rate: float
    subtotal: float
    security_deposit: float
    delivery_fee: float
    total_amount: float
    status: str
    delivery_option: str
    notes: Optional[str] = None

    # Joined relations for easy UI display
    product: Optional[ProductSimple] = None

    class Config:
        from_attributes = True
