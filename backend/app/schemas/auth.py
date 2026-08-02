"""
RentHub — Auth & User Pydantic Schemas (DTOs)

These schemas define the request/response shapes for all auth endpoints.
They are intentionally separate from the SQLAlchemy models.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ─── Requests ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9\s\-]{7,20}$")
    role: str = Field(default="customer", pattern=r"^(customer|owner)$")

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def strip_and_title(cls, v: str) -> str:
        return v.strip()

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class VerifyEmailRequest(BaseModel):
    token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class RefreshTokenRequest(BaseModel):
    """Used only when refresh token is sent in request body (not cookie)."""
    refresh_token: str


# ─── Responses ────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    """Returned by /login and /refresh endpoints."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RoleSchema(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """Public user representation — safe to return to any authenticated user."""
    id: uuid.UUID
    email: str
    phone: str | None
    first_name: str
    last_name: str
    full_name: str
    avatar_url: str | None
    is_email_verified: bool
    is_identity_verified: bool
    is_active: bool
    primary_role: str
    role_names: list[str]
    last_login_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublicResponse(BaseModel):
    """Minimal user info safe to show other users (e.g., on product listings)."""
    id: uuid.UUID
    first_name: str
    last_name: str
    full_name: str
    avatar_url: str | None
    is_identity_verified: bool
    primary_role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """Combined auth + user payload returned on successful login."""
    token: TokenResponse
    user: UserResponse
