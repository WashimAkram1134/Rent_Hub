"""
RentHub — Liveness Detection Service

⚠️  INTERNAL NOTE: This is a V1 MVP liveness implementation.
    It provides a basic challenge-response mechanism (blink / head turn),
    which offers UX-level friction but is NOT a full anti-spoofing system.
    It should be replaced with a stronger ML-based liveness provider in V2.

Provider pattern:
  LivenessService (ABC)
    └── BasicChallengeLivenessProvider  ← V1 MVP

The actual challenge verification is browser-side (MediaPipe face_mesh).
The backend receives: challenge_type + challenge_completed (bool) + selfie frame.
The backend validates face presence on the selfie and trusts the browser result.

V2 upgrade path:
  └── AdvancedMLLivenessProvider  ← commercial SDK (e.g., iProov, Facetec)
"""

from __future__ import annotations

import abc
import random
from dataclasses import dataclass
from enum import Enum

from app.core.logging import get_logger

logger = get_logger(__name__)


# ── Challenge types ────────────────────────────────────────────────────────────

class ChallengeType(str, Enum):
    BLINK = "BLINK"
    TURN_LEFT = "TURN_LEFT"
    TURN_RIGHT = "TURN_RIGHT"
    LOOK_UP = "LOOK_UP"


CHALLENGE_INSTRUCTIONS: dict[str, str] = {
    ChallengeType.BLINK: "Please blink slowly",
    ChallengeType.TURN_LEFT: "Please turn your head to the left",
    ChallengeType.TURN_RIGHT: "Please turn your head to the right",
    ChallengeType.LOOK_UP: "Please tilt your head slightly upward",
}


# ── Data contracts ─────────────────────────────────────────────────────────────

@dataclass
class LivenessChallenge:
    challenge_type: str
    instruction: str


@dataclass
class LivenessResult:
    passed: bool
    confidence: float  # 0.0 – 1.0
    challenge_type: str
    error: str | None = None


# ── Abstract interface ─────────────────────────────────────────────────────────

class LivenessService(abc.ABC):
    """
    Abstract interface for liveness detection.
    Implementations can range from basic challenge-response to ML-based.
    """

    @abc.abstractmethod
    def generate_challenge(self) -> LivenessChallenge:
        """Return a randomly chosen liveness challenge to present to the user."""
        ...

    @abc.abstractmethod
    async def verify_challenge(
        self,
        challenge_type: str,
        challenge_completed: bool,
        selfie_bytes: bytes,
    ) -> LivenessResult:
        """
        Verify liveness evidence.

        Args:
            challenge_type: The challenge that was shown (from generate_challenge).
            challenge_completed: Whether the browser reported the challenge as passed.
            selfie_bytes: The captured selfie frame bytes.
        """
        ...


# ── V1 Basic provider ─────────────────────────────────────────────────────────

class BasicChallengeLivenessProvider(LivenessService):
    """
    V1 MVP liveness provider.

    Strategy:
    - Backend generates a random challenge and sends it to the frontend.
    - Frontend uses MediaPipe face_mesh to detect head pose / eye blinks.
    - Frontend reports completion and captures a final selfie frame.
    - Backend checks:
      1. Frontend reported challenge_completed = True
      2. A face is present in the submitted selfie (basic sanity check)

    This is sufficient to prevent casual fraud but not sophisticated attacks.
    Document this clearly — do NOT misrepresent as full anti-spoofing.
    """

    def generate_challenge(self) -> LivenessChallenge:
        challenge_type = random.choice(list(ChallengeType))
        return LivenessChallenge(
            challenge_type=challenge_type.value,
            instruction=CHALLENGE_INSTRUCTIONS[challenge_type],
        )

    async def verify_challenge(
        self,
        challenge_type: str,
        challenge_completed: bool,
        selfie_bytes: bytes,
    ) -> LivenessResult:
        """
        V1 verification:
        1. Frontend must report the challenge was completed.
        2. A face must be detectable in the selfie image.
        """
        if not challenge_completed:
            logger.info("liveness_challenge_not_completed", challenge=challenge_type)
            return LivenessResult(
                passed=False,
                confidence=0.0,
                challenge_type=challenge_type,
                error="Liveness challenge was not completed. Please follow the on-screen instruction.",
            )

        # Basic sanity: verify a face exists in the submitted selfie
        from app.services.identity_verification.face_detection import get_face_detection_service
        face_service = get_face_detection_service()
        face_result = await face_service.detect_faces(selfie_bytes)

        if not face_result.passed:
            return LivenessResult(
                passed=False,
                confidence=0.0,
                challenge_type=challenge_type,
                error=face_result.error or "No face detected in the selfie. Please try again.",
            )

        # V1: fixed confidence for completed challenge with face present
        # V2: replace with actual ML confidence score from advanced provider
        confidence = 0.80

        logger.info(
            "liveness_passed",
            challenge=challenge_type,
            confidence=confidence,
        )

        return LivenessResult(
            passed=True,
            confidence=confidence,
            challenge_type=challenge_type,
        )


def get_liveness_service() -> LivenessService:
    """Factory — returns the configured liveness provider."""
    return BasicChallengeLivenessProvider()
