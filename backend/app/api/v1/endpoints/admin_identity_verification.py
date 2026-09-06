"""
RentHub — Admin Identity Verification Endpoints

Routes (admin only):
  GET   /api/v1/admin/identity-verifications        → list with filters
  GET   /api/v1/admin/identity-verifications/{id}   → detail view
  PATCH /api/v1/admin/identity-verifications/{id}/review → APPROVE/REJECT/REVOKE/REQUEST_RETRY

All routes require role = "admin".
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.database.session import get_db
from app.models.identity_verification import IdentityVerification
from app.models.user import User
from app.services.identity_verification.verification_service import VerificationOrchestrationService

router = APIRouter(tags=["Admin — Identity Verification"])


class AdminReviewRequest(BaseModel):
    action: str          # APPROVE | REJECT | REQUEST_RETRY | REVOKE
    notes: str | None = None


def _get_service(db: AsyncSession = Depends(get_db)) -> VerificationOrchestrationService:
    return VerificationOrchestrationService(db)


@router.get("", status_code=200)
async def list_verifications(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    _: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all identity verifications with optional status filter and pagination."""
    stmt = select(IdentityVerification).where(
        IdentityVerification.deleted_at.is_(None)
    )

    if status_filter:
        stmt = stmt.where(IdentityVerification.status == status_filter.upper())

    stmt = stmt.order_by(IdentityVerification.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "user_id": str(r.user_id),
            "status": r.status,
            "attempt_count": r.attempt_count,
            "document_type": r.document_type,
            "face_match_score": float(r.face_match_score) if r.face_match_score else None,
            "liveness_score": float(r.liveness_score) if r.liveness_score else None,
            "liveness_challenge_type": r.liveness_challenge_type,
            "consent_given": r.consent_given,
            "verified_at": r.verified_at.isoformat() if r.verified_at else None,
            "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            "review_notes": r.review_notes,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat(),
        }
        for r in records
    ]


@router.get("/{verification_id}", status_code=200)
async def get_verification_detail(
    verification_id: uuid.UUID,
    _: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed view of a single identity verification record."""
    stmt = select(IdentityVerification).where(IdentityVerification.id == verification_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("IdentityVerification", verification_id)

    return {
        "id": str(record.id),
        "user_id": str(record.user_id),
        "status": record.status,
        "attempt_count": record.attempt_count,
        "document_type": record.document_type,
        # document_number_masked only — never return encrypted value
        "document_number_masked": record.document_number_masked,
        "face_match_score": float(record.face_match_score) if record.face_match_score else None,
        "liveness_score": float(record.liveness_score) if record.liveness_score else None,
        "liveness_challenge_type": record.liveness_challenge_type,
        "verification_method": record.verification_method,
        "verification_version": record.verification_version,
        "consent_given": record.consent_given,
        "consent_at": record.consent_at.isoformat() if record.consent_at else None,
        "verified_at": record.verified_at.isoformat() if record.verified_at else None,
        "reviewed_by": str(record.reviewed_by) if record.reviewed_by else None,
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
        "review_notes": record.review_notes,
        "created_at": record.created_at.isoformat(),
        "updated_at": record.updated_at.isoformat(),
    }


@router.patch("/{verification_id}/review", status_code=200)
async def review_verification(
    verification_id: uuid.UUID,
    payload: AdminReviewRequest,
    current_user: User = Depends(require_role("admin")),
    service: VerificationOrchestrationService = Depends(_get_service),
):
    """
    Admin review action.
    Valid actions: APPROVE, REJECT, REQUEST_RETRY, REVOKE
    """
    record = await service.admin_review(
        verification_id=verification_id,
        action=payload.action,
        reviewer=current_user,
        notes=payload.notes,
    )

    return {
        "id": str(record.id),
        "status": record.status,
        "action_taken": payload.action.upper(),
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
        "review_notes": record.review_notes,
        "message": f"Verification {payload.action.upper()} completed successfully.",
    }
