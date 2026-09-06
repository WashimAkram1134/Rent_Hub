from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.identity_verification import VerificationStatus


class IdentityVerificationBase(BaseModel):
    pass


class IdentityVerificationCreate(IdentityVerificationBase):
    pass


class IdentityVerificationUpdate(IdentityVerificationBase):
    status: VerificationStatus | None = None
    attempt_count: int | None = None
    document_type: str | None = None
    document_number_encrypted: str | None = None
    document_number_masked: str | None = None
    document_image_filename: str | None = None
    selfie_image_filename: str | None = None
    face_match_score: float | None = None
    liveness_score: float | None = None
    liveness_challenge_type: str | None = None
    verification_method: str | None = None
    verification_version: str | None = None
    consent_given: bool | None = None
    consent_at: datetime | None = None
    verified_at: datetime | None = None
    reviewed_by: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    review_notes: str | None = None


class IdentityVerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    status: VerificationStatus
    attempt_count: int
    document_type: str | None
    document_number_masked: str | None
    face_match_score: float | None
    liveness_score: float | None
    liveness_challenge_type: str | None
    consent_given: bool
    consent_at: datetime | None
    verified_at: datetime | None
    created_at: datetime
    updated_at: datetime
    
    # We deliberately exclude image filenames and encrypted numbers from standard responses
