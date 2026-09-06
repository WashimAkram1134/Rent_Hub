"""
RentHub — Lister Application Model

Tracks customer applications to become verified owners / listers on the platform.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class ListerApplicationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ListerApplication(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "lister_applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ── Applicant Details ─────────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    business_name: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # ── Address Details ───────────────────────────────────────────────────────
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="Dhaka")
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="Bangladesh")

    # ── Identity Verification ─────────────────────────────────────────────────
    id_type: Mapped[str] = mapped_column(String(50), nullable=False, default="National ID (NID)")
    id_number: Mapped[str] = mapped_column(String(100), nullable=False)
    id_front_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    id_back_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Operational Intent ────────────────────────────────────────────────────
    experience_bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    categories_intended: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON or comma-separated
    agreed_terms: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Review & Status ───────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(30), default=ListerApplicationStatus.PENDING.value, nullable=False, index=True
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(  # type: ignore[name-defined] # noqa: F821
        "User",
        back_populates="lister_application",
        foreign_keys=[user_id],
    )
    reviewer: Mapped["User"] = relationship(  # type: ignore[name-defined] # noqa: F821
        "User",
        foreign_keys=[reviewed_by],
    )

    def __repr__(self) -> str:
        return f"<ListerApplication user_id={self.user_id} status={self.status}>"
