"""
RentHub Backend — SQLAlchemy Declarative Base & Shared Mixins

Mixins:
- TimestampMixin: created_at / updated_at with auto UTC timestamps
- SoftDeleteMixin: deleted_at field + is_deleted property
- UUIDPrimaryKeyMixin: UUID v4 primary key

All domain models should inherit from `Base` and the relevant mixins.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, text
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedColumn, mapped_column


def utcnow() -> datetime:
    """Return timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""

    # SQLAlchemy 2.0 — type annotation map
    type_annotation_map = {
        str: String,
    }


# ─── Mixins ──────────────────────────────────────────────────────────────────

class UUIDPrimaryKeyMixin:
    """UUID v4 primary key."""

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )


class TimestampMixin:
    """Automatic created_at and updated_at timestamps (UTC)."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )


class SoftDeleteMixin:
    """
    Soft delete support.

    Records are never physically deleted — instead deleted_at is set.
    Use the `is_deleted` property for checks, and filter with
    `Model.deleted_at.is_(None)` in queries.
    """

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        index=True,
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self) -> None:
        self.deleted_at = utcnow()

    def restore(self) -> None:
        self.deleted_at = None
