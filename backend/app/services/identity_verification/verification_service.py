"""
RentHub — Identity Verification Orchestration Service

This is the central business logic layer for identity verification.
API routes call THIS service. This service calls face_detection, face_recognition,
liveness, and private_storage. No AI code lives in API routes.

Workflow:
  start()     → create or return existing verification record
  consent()   → record consent
  document()  → validate + store NID image, run face detection
  selfie()    → validate liveness + store selfie
  complete()  → run face matching, finalize status

Status transitions managed here based on scores and config thresholds.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import BadRequestException, ForbiddenException
from app.core.logging import get_logger
from app.models.identity_verification import IdentityVerification, VerificationStatus
from app.models.user import User
from app.repositories.identity_verification import IdentityVerificationRepository
from app.repositories.user import UserRepository
from app.services.identity_verification.face_detection import get_face_detection_service
from app.services.identity_verification.face_recognition_service import (
    FaceEmbedding,
    get_face_recognition_service,
)
from app.services.identity_verification.image_quality import ImageQualityService
from app.services.identity_verification.liveness import get_liveness_service
from app.services.identity_verification.private_storage import get_private_storage

logger = get_logger(__name__)


class VerificationOrchestrationService:
    """
    Orchestrates the full identity verification workflow.
    One instance per request (injected via FastAPI Depends).
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = IdentityVerificationRepository(db)
        self.user_repo = UserRepository(db)
        self.quality_service = ImageQualityService()
        self.face_detection = get_face_detection_service()
        self.face_recognition = get_face_recognition_service()
        self.liveness_service = get_liveness_service()
        self.storage = get_private_storage()

    # ── Step 1: Start ──────────────────────────────────────────────────────

    async def start(self, user: User) -> IdentityVerification:
        """
        Initialize or resume a verification session.
        Returns the existing record or creates a fresh one.
        """
        existing = await self.repo.get_by_user_id(user.id)

        # Already VERIFIED — nothing to do
        if user.identity_verification_status == VerificationStatus.VERIFIED.value:
            if not existing:
                existing = IdentityVerification(
                    user_id=user.id,
                    status=VerificationStatus.VERIFIED,
                    attempt_count=1,
                    consent_given=True,
                    verified_at=datetime.now(timezone.utc),
                )
                self.db.add(existing)
                await self.db.commit()
                await self.db.refresh(existing)
            return existing

        if existing and existing.status == VerificationStatus.VERIFIED:
            if user.identity_verification_status != VerificationStatus.VERIFIED.value:
                user.identity_verification_status = VerificationStatus.VERIFIED.value
                self.db.add(user)
                await self.db.commit()
            return existing

        # REVOKED or FAILED with no retries left → allow fresh start
        if existing and existing.status in (
            VerificationStatus.REVOKED,
            VerificationStatus.FAILED,
        ):
            # Reset to PENDING for a new attempt
            if existing.attempt_count >= settings.IDENTITY_MAX_RETRY_ATTEMPTS:
                existing.status = VerificationStatus.MANUAL_REVIEW
                await self.db.commit()
                await self.db.refresh(existing)
                return existing

            existing.status = VerificationStatus.PENDING
            existing.consent_given = False
            existing.consent_at = None
            existing.document_image_filename = None
            existing.selfie_image_filename = None
            existing.face_match_score = None
            existing.liveness_score = None
            existing.liveness_challenge_type = None
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        if existing:
            return existing

        # First time — create record
        record = IdentityVerification(
            user_id=user.id,
            status=VerificationStatus.PENDING,
            attempt_count=0,
            retention_expires_at=datetime.now(timezone.utc) + timedelta(
                days=settings.IDENTITY_DATA_RETENTION_DAYS
            ),
        )
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)

        logger.info("verification_started", user_id=str(user.id))
        return record

    # ── Step 2: Consent ────────────────────────────────────────────────────

    async def record_consent(self, user: User) -> IdentityVerification:
        """Record the user's explicit consent."""
        record = await self._get_active_record(user.id)
        self._assert_status_not_in(record, [VerificationStatus.VERIFIED])

        record.consent_given = True
        record.consent_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(record)

        logger.info("consent_recorded", user_id=str(user.id))
        return record

    # ── Step 3: Document upload ────────────────────────────────────────────

    async def process_document(
        self,
        user: User,
        file_bytes: bytes,
        content_type: str,
    ) -> dict:
        """
        Validate + store the NID document image, run face detection.
        Returns a result dict with face_detected, quality info, and next_step.
        """
        record = await self._get_active_record(user.id)

        if not record.consent_given:
            raise BadRequestException("You must provide consent before uploading a document.")

        # ── File type validation
        if not self.storage.validate_content_type(content_type):
            raise BadRequestException(
                "Invalid file type. Please upload a JPG, PNG, or WEBP image."
            )

        # ── File size validation
        if not self.storage.validate_file_size(file_bytes):
            raise BadRequestException(
                f"File too large. Maximum size is {settings.IDENTITY_DOCUMENT_MAX_SIZE_MB}MB."
            )

        # ── Image quality check
        quality = await self.quality_service.check(file_bytes)
        if not quality.passed:
            return {
                "status": "QUALITY_FAILED",
                "face_detected": False,
                "error": quality.error,
                "next_step": None,
            }

        # ── Face detection
        face_result = await self.face_detection.detect_faces(file_bytes)
        if not face_result.passed:
            return {
                "status": "FACE_NOT_DETECTED",
                "face_detected": False,
                "error": face_result.error,
                "next_step": None,
            }

        # ── Save image to private storage
        filename = await self.storage.save_document_image(file_bytes, content_type)

        # ── Delete old document image if re-uploading
        if record.document_image_filename:
            await self.storage.delete_file(record.document_image_filename)

        record.document_image_filename = filename
        record.document_type = "NID"
        await self.db.commit()

        logger.info(
            "document_processed",
            user_id=str(user.id),
            face_count=face_result.faces_found,
        )

        return {
            "status": "DOCUMENT_ACCEPTED",
            "face_detected": True,
            "quality": "GOOD",
            "next_step": "SELFIE",
        }

    # ── Step 4: Selfie + liveness ──────────────────────────────────────────

    async def process_selfie(
        self,
        user: User,
        selfie_bytes: bytes,
        challenge_type: str,
        challenge_completed: bool,
    ) -> dict:
        """
        Verify liveness challenge + store selfie.
        """
        record = await self._get_active_record(user.id)

        if not record.document_image_filename:
            raise BadRequestException("Please upload your identity document first.")

        # ── Liveness check
        liveness_result = await self.liveness_service.verify_challenge(
            challenge_type=challenge_type,
            challenge_completed=challenge_completed,
            selfie_bytes=selfie_bytes,
        )

        if not liveness_result.passed:
            return {
                "status": "LIVENESS_FAILED",
                "liveness_passed": False,
                "error": liveness_result.error,
                "next_step": None,
            }

        # ── Save selfie
        filename = await self.storage.save_selfie_image(selfie_bytes)

        if record.selfie_image_filename:
            await self.storage.delete_file(record.selfie_image_filename)

        record.selfie_image_filename = filename
        record.liveness_score = liveness_result.confidence
        record.liveness_challenge_type = liveness_result.challenge_type
        await self.db.commit()

        return {
            "status": "SELFIE_ACCEPTED",
            "liveness_passed": True,
            "next_step": "COMPLETE",
        }

    # ── Step 5: Face matching + final decision ─────────────────────────────

    async def complete_verification(self, user: User) -> IdentityVerification:
        """
        Run face embeddings + cosine similarity comparison.
        Sets final verification status on the record and syncs User model.
        """
        record = await self._get_active_record(user.id)

        if not record.document_image_filename or not record.selfie_image_filename:
            raise BadRequestException("Document and selfie must both be uploaded before completing verification.")

        record.status = VerificationStatus.PROCESSING
        record.attempt_count += 1
        await self.db.commit()

        # ── Load images
        doc_bytes = await self.storage.load_file(record.document_image_filename)
        selfie_bytes = await self.storage.load_file(record.selfie_image_filename)

        if not doc_bytes or not selfie_bytes:
            raise BadRequestException("Verification files could not be loaded. Please start over.")

        # ── Generate embeddings
        doc_embedding = await self.face_recognition.generate_embedding(doc_bytes)
        selfie_embedding = await self.face_recognition.generate_embedding(selfie_bytes)

        if not doc_embedding or not selfie_embedding:
            # Can't generate embeddings → treat as quality failure, allow retry
            record.status = VerificationStatus.FAILED
            await self.db.commit()
            await self.db.refresh(record)
            await self._sync_user_status(user, VerificationStatus.FAILED)
            return record

        # ── Compare faces
        comparison = self.face_recognition.compare_embeddings(doc_embedding, selfie_embedding)
        score = comparison.similarity_score

        record.face_match_score = score
        record.verification_method = "DOCUMENT_SELFIE_FACE_MATCH"
        record.verification_version = "v1"

        logger.info(
            "face_match_result",
            user_id=str(user.id),
            score=round(score, 4),
            threshold=settings.FACE_MATCH_THRESHOLD,
            manual_review_threshold=settings.FACE_MATCH_MANUAL_REVIEW_THRESHOLD,
        )

        # ── Apply threshold logic
        if score >= settings.FACE_MATCH_THRESHOLD:
            record.status = VerificationStatus.VERIFIED
            record.verified_at = datetime.now(timezone.utc)
            await self._cleanup_private_files_after_verification(record)

        elif score >= settings.FACE_MATCH_MANUAL_REVIEW_THRESHOLD:
            record.status = VerificationStatus.MANUAL_REVIEW

        else:
            # Low score — allow retry up to max attempts
            if record.attempt_count >= settings.IDENTITY_MAX_RETRY_ATTEMPTS:
                record.status = VerificationStatus.MANUAL_REVIEW
            else:
                record.status = VerificationStatus.FAILED

        await self.db.commit()
        await self.db.refresh(record)
        await self._sync_user_status(user, record.status)

        return record

    # ── Admin actions ──────────────────────────────────────────────────────

    async def admin_review(
        self,
        verification_id: uuid.UUID,
        action: str,
        reviewer: User,
        notes: str | None = None,
    ) -> IdentityVerification:
        """
        Admin can: APPROVE, REJECT, REQUEST_RETRY, REVOKE.
        All admin actions update reviewed_by and reviewed_at.
        """
        record = await self.repo.get(verification_id)
        if not record:
            from app.core.exceptions import NotFoundException
            raise NotFoundException("IdentityVerification", verification_id)

        now = datetime.now(timezone.utc)
        record.reviewed_by = reviewer.id
        record.reviewed_at = now
        record.review_notes = notes

        action = action.upper()
        if action == "APPROVE":
            record.status = VerificationStatus.VERIFIED
            record.verified_at = now
            await self._sync_user_status_by_id(record.user_id, VerificationStatus.VERIFIED)

        elif action == "REJECT":
            record.status = VerificationStatus.FAILED
            await self._sync_user_status_by_id(record.user_id, VerificationStatus.FAILED)

        elif action == "REQUEST_RETRY":
            record.status = VerificationStatus.FAILED
            record.attempt_count = max(0, record.attempt_count - 1)
            await self._sync_user_status_by_id(record.user_id, VerificationStatus.FAILED)

        elif action == "REVOKE":
            record.status = VerificationStatus.REVOKED
            await self._sync_user_status_by_id(record.user_id, VerificationStatus.REVOKED)

        else:
            raise BadRequestException(f"Unknown review action: {action}. Valid actions: APPROVE, REJECT, REQUEST_RETRY, REVOKE")

        await self.db.commit()
        await self.db.refresh(record)

        logger.info(
            "admin_review_completed",
            action=action,
            verification_id=str(verification_id),
            reviewer_id=str(reviewer.id),
        )

        return record

    # ── Helpers ────────────────────────────────────────────────────────────

    async def _get_active_record(self, user_id: uuid.UUID) -> IdentityVerification:
        record = await self.repo.get_by_user_id(user_id)
        if not record:
            raise BadRequestException("No active verification session found. Please start the verification process.")
        return record

    def _assert_status_not_in(self, record: IdentityVerification, statuses: list) -> None:
        if record.status in [s.value if hasattr(s, "value") else s for s in statuses]:
            raise BadRequestException("This action cannot be performed at the current verification stage.")

    async def _sync_user_status(self, user: User, status: VerificationStatus | str) -> None:
        """Keep User.identity_verification_status in sync for fast booking checks."""
        val = status.value if hasattr(status, "value") else status
        user.identity_verification_status = val
        self.db.add(user)
        await self.db.commit()

    async def _sync_user_status_by_id(self, user_id: uuid.UUID, status: VerificationStatus | str) -> None:
        user = await self.user_repo.get(user_id)
        if user:
            val = status.value if hasattr(status, "value") else status
            user.identity_verification_status = val
            self.db.add(user)
            await self.db.commit()

    async def _cleanup_private_files_after_verification(self, record: IdentityVerification) -> None:
        """
        After successful verification, we can delete the raw images.
        The face match score and metadata are retained; sensitive images are removed.
        This aligns with data minimization principles.
        """
        if record.document_image_filename:
            await self.storage.delete_file(record.document_image_filename)
            record.document_image_filename = None

        if record.selfie_image_filename:
            await self.storage.delete_file(record.selfie_image_filename)
            record.selfie_image_filename = None
