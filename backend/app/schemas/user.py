"""
RentHub — User & Profile Schemas (Module 3)
"""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ─── Profile Update ───────────────────────────────────────────────────────────

class ProfileUpdateRequest(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


class AvatarResponse(BaseModel):
    avatar_url: str


# ─── Address Schemas ──────────────────────────────────────────────────────────

class AddressCreateRequest(BaseModel):
    label: str = Field("Home", max_length=50)
    street_line1: str = Field(..., min_length=1, max_length=255)
    street_line2: str | None = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=20)
    country: str = Field("Bangladesh", max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None
    is_default: bool = False


class AddressUpdateRequest(BaseModel):
    label: str | None = Field(None, max_length=50)
    street_line1: str | None = Field(None, min_length=1, max_length=255)
    street_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, min_length=1, max_length=100)
    state: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=20)
    country: str | None = Field(None, max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    notes: str | None = None
    is_default: bool | None = None


class AddressResponse(BaseModel):
    id: UUID
    label: str
    street_line1: str
    street_line2: str | None
    city: str
    state: str | None
    postal_code: str | None
    country: str
    latitude: float | None
    longitude: float | None
    is_default: bool
    notes: str | None

    model_config = {"from_attributes": True}
