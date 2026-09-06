from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

class NotificationCreate(BaseModel):
    user_id: UUID
    type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    body: str
    reference_id: UUID | None = None
    reference_type: str | None = Field(None, max_length=50)

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    body: str
    is_read: bool
    reference_id: UUID | None
    reference_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
