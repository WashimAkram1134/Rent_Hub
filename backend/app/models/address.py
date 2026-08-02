"""
RentHub — Address ORM Model

Stores physical addresses belonging to a user (billing, delivery, home, etc.).
Each user can have multiple addresses; exactly one can be the default.
"""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Address(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "addresses"

    # ── Owner ─────────────────────────────────────────────────────────────────
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Label / Type ──────────────────────────────────────────────────────────
    label: Mapped[str] = mapped_column(String(50), nullable=False, default="Home")
    # e.g. "Home", "Work", "Other"

    # ── Street-level ──────────────────────────────────────────────────────────
    street_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    street_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Locality ──────────────────────────────────────────────────────────────
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="Bangladesh")

    # ── Geo-coordinates (optional, for map display) ───────────────────────────
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)

    # ── Flags ─────────────────────────────────────────────────────────────────
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Notes ─────────────────────────────────────────────────────────────────
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="addresses")  # type: ignore[name-defined]  # noqa: F821

    __table_args__ = (
        Index("ix_addresses_user_id", "user_id"),
    )

    def __repr__(self) -> str:
        return f"<Address {self.label}: {self.city}, {self.country}>"
