from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

class MessageCreate(BaseModel):
    booking_id: UUID
    receiver_id: UUID
    content: str = Field(..., min_length=1, max_length=2000)

class MessageResponse(BaseModel):
    id: UUID
    booking_id: UUID
    sender_id: UUID
    receiver_id: UUID
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
