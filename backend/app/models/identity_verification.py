"""
RentHub — Identity Verification Model
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class VerificationStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    REVOKED = "REVOKED"


class IdentityVerification(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "identity_verifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ── Status lifecycle
    status: Mapped[str] = mapped_column(String(30), default=VerificationStatus.NOT_STARTED.value, nullable=False, index=True)
    attempt_count: Mapped[int] = mapped_column(default=0, nullable=False)

    # ── Document info
    document_type: Mapped[str | None] = mapped_column(String(20), default="NID")
    document_number_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    document_number_masked: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # ── Storage filenames
    document_image_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    selfie_image_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── AI results
    face_match_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    liveness_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    liveness_challenge_type: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # ── Verification metadata
    verification_method: Mapped[str | None] = mapped_column(String(50), default="DOCUMENT_SELFIE_FACE_MATCH")
    verification_version: Mapped[str | None] = mapped_column(String(10), default="v1")

    # ── Consent
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Timestamps & Admin Review
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    retention_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationships
    user: Mapped["User"] = relationship(  # type: ignore[name-defined] # noqa: F821
        back_populates="identity_verification",
        foreign_keys=[user_id],
    )
    reviewer: Mapped["User"] = relationship(  # type: ignore[name-defined] # noqa: F821
        foreign_keys=[reviewed_by]
    )

    def __repr__(self) -> str:
        return f"<IdentityVerification user_id={self.user_id} status={self.status}>"
