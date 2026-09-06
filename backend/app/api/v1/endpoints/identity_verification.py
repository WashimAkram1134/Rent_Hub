"""
RentHub — Identity Verification API Endpoints (Customer)

Routes:
  POST /api/v1/identity-verification/start      → start/resume session
  POST /api/v1/identity-verification/consent    → record consent
  POST /api/v1/identity-verification/document   → upload NID image
  POST /api/v1/identity-verification/selfie     → submit selfie + liveness
  POST /api/v1/identity-verification/complete   → face match + finalize
  GET  /api/v1/identity-verification/status     → get safe status response
  GET  /api/v1/identity-verification/challenge  → get a liveness challenge

All routes require authentication.
No AI code lives here — all business logic is in VerificationOrchestrationService.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.identity_verification import VerificationStatus
from app.models.user import User
from app.services.identity_verification.liveness import get_liveness_service
from app.services.identity_verification.verification_service import VerificationOrchestrationService

router = APIRouter(tags=["Identity Verification"])


# ── Response schemas ───────────────────────────────────────────────────────────

class VerificationStatusResponse(BaseModel):
    status: str
    attempt_count: int
    document_type: str | None
    document_number_masked: str | None
    face_match_score: float | None
    liveness_score: float | None
    consent_given: bool
    verified_at: str | None
    message: str


class ChallengeResponse(BaseModel):
    challenge_type: str
    instruction: str


class DocumentUploadResponse(BaseModel):
    status: str
    face_detected: bool
    quality: str | None = None
    error: str | None = None
    next_step: str | None = None


class SelfieUploadResponse(BaseModel):
    status: str
    liveness_passed: bool
    error: str | None = None
    next_step: str | None = None


# ── Helper ─────────────────────────────────────────────────────────────────────

def _get_service(db: AsyncSession = Depends(get_db)) -> VerificationOrchestrationService:
    return VerificationOrchestrationService(db)


def _status_message(status_val: str) -> str:
    messages = {
        VerificationStatus.NOT_STARTED: "You have not started identity verification yet.",
        VerificationStatus.PENDING: "Your verification is in progress.",
        VerificationStatus.PROCESSING: "Your verification is being processed.",
        VerificationStatus.VERIFIED: "Your identity has been verified. You can book items on RentHub.",
        VerificationStatus.FAILED: "Verification failed. You may retry.",
        VerificationStatus.MANUAL_REVIEW: "Your verification requires additional review by our team.",
        VerificationStatus.REVOKED: "Your verification has been revoked. Please re-verify your identity.",
    }
    return messages.get(status_val, "Unknown verification status.")


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/start", status_code=status.HTTP_200_OK)
async def start_verification(
    current_user: User = Depends(get_current_user),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """Start or resume an identity verification session."""
    record = await service.start(current_user)
    return {
        "status": record.status,
        "attempt_count": record.attempt_count,
        "consent_given": record.consent_given,
        "message": _status_message(record.status),
    }


@router.post("/consent", status_code=status.HTTP_200_OK)
async def record_consent(
    current_user: User = Depends(get_current_user),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """Record that the user has read and accepted the verification consent."""
    record = await service.record_consent(current_user)
    return {
        "consent_given": record.consent_given,
        "consent_at": record.consent_at.isoformat() if record.consent_at else None,
        "next_step": "DOCUMENT",
        "message": "Consent recorded. Please upload your identity document.",
    }


@router.get("/challenge", response_model=ChallengeResponse)
async def get_liveness_challenge(
    current_user: User = Depends(get_current_user),
):
    """
    Get a randomized liveness challenge to display to the user.
    Call this when the selfie capture page loads.
    """
    liveness = get_liveness_service()
    challenge = liveness.generate_challenge()
    return ChallengeResponse(
        challenge_type=challenge.challenge_type,
        instruction=challenge.instruction,
    )


@router.post("/document", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """
    Upload NID/identity document image.
    Returns face detection result and quality check outcome.
    """
    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    result = await service.process_document(
        user=current_user,
        file_bytes=file_bytes,
        content_type=content_type,
    )
    return DocumentUploadResponse(**result)


@router.post("/selfie", response_model=SelfieUploadResponse)
async def upload_selfie(
    file: UploadFile = File(...),
    challenge_type: str = Form(...),
    challenge_completed: bool = Form(...),
    current_user: User = Depends(get_current_user),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """
    Submit live selfie frame + liveness challenge result.
    """
    selfie_bytes = await file.read()

    result = await service.process_selfie(
        user=current_user,
        selfie_bytes=selfie_bytes,
        challenge_type=challenge_type,
        challenge_completed=challenge_completed,
    )
    return SelfieUploadResponse(**result)


@router.post("/complete", status_code=status.HTTP_200_OK)
async def complete_verification(
    current_user: User = Depends(get_current_user),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """
    Run face matching and finalize verification status.
    Call this after document and selfie have been accepted.
    """
    record = await service.complete_verification(current_user)
    return {
        "status": record.status,
        "face_match_score": float(record.face_match_score) if record.face_match_score else None,
        "liveness_score": float(record.liveness_score) if record.liveness_score else None,
        "verified_at": record.verified_at.isoformat() if record.verified_at else None,
        "attempt_count": record.attempt_count,
        "message": _status_message(record.status),
    }


@router.get("/status", response_model=VerificationStatusResponse)
async def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the current identity verification status for the authenticated user.
    Returns safe, masked information only — no image paths or raw biometrics.
    """
    from app.repositories.identity_verification import IdentityVerificationRepository
    repo = IdentityVerificationRepository(db)
    record = await repo.get_by_user_id(current_user.id)

    if not record:
        return VerificationStatusResponse(
            status=VerificationStatus.NOT_STARTED,
            attempt_count=0,
            document_type=None,
            document_number_masked=None,
            face_match_score=None,
            liveness_score=None,
            consent_given=False,
            verified_at=None,
            message=_status_message(VerificationStatus.NOT_STARTED),
        )

    return VerificationStatusResponse(
        status=record.status,
        attempt_count=record.attempt_count,
        document_type=record.document_type,
        document_number_masked=record.document_number_masked,
        face_match_score=float(record.face_match_score) if record.face_match_score else None,
        liveness_score=float(record.liveness_score) if record.liveness_score else None,
        consent_given=record.consent_given,
        verified_at=record.verified_at.isoformat() if record.verified_at else None,
        message=_status_message(record.status),
    )
