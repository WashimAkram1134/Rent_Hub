"""
RentHub — Face Detection Service

Provider pattern:
  FaceDetectionService (ABC)  ← swap provider without touching business logic
    └── LocalFaceDetectionProvider  ← uses face_recognition (dlib)

FaceDetectionResult is the common contract between providers.
"""

from __future__ import annotations

import abc
import io
from dataclasses import dataclass, field

from app.core.logging import get_logger

logger = get_logger(__name__)


# ── Shared data contracts ──────────────────────────────────────────────────────

@dataclass
class FaceLocation:
    """Bounding box in CSS order: (top, right, bottom, left)."""
    top: int
    right: int
    bottom: int
    left: int

    @property
    def width(self) -> int:
        return self.right - self.left

    @property
    def height(self) -> int:
        return self.bottom - self.top


@dataclass
class FaceDetectionResult:
    faces_found: int
    face_locations: list[FaceLocation] = field(default_factory=list)
    passed: bool = False
    error: str | None = None


# ── Abstract interface ─────────────────────────────────────────────────────────

class FaceDetectionService(abc.ABC):
    """
    Abstract interface for face detection.
    Implement this to swap to a commercial provider (AWS Rekognition, etc.).
    """

    @abc.abstractmethod
    async def detect_faces(self, image_bytes: bytes) -> FaceDetectionResult:
        """
        Detect all faces in the image.

        Returns FaceDetectionResult.
        `passed` is True only if exactly one acceptable-quality face is found.
        """
        ...

    def _validate_result(self, result: FaceDetectionResult, min_face_pixels: int = 80) -> FaceDetectionResult:
        """
        Common post-detection validation:
        - Must find at least one face
        - Prefer exactly one face (multiple → ambiguous)
        - Face must meet minimum pixel size
        """
        if result.faces_found == 0:
            result.passed = False
            result.error = "No face was detected in this image. Please upload a clear photo where the face is visible."
            return result

        if result.faces_found > 1:
            result.passed = False
            result.error = "Multiple faces were detected. Please upload an image with only one person."
            return result

        face = result.face_locations[0]
        if face.width < min_face_pixels or face.height < min_face_pixels:
            result.passed = False
            result.error = "The face in the image is too small. Please upload a closer, clearer photo."
            return result

        result.passed = True
        return result


# ── Local provider (dlib via face_recognition) ────────────────────────────────

class LocalFaceDetectionProvider(FaceDetectionService):
    """
    Face detection using the `face_recognition` library (dlib CNN model).
    Suitable for backend processing. No GPU required for HOG model.

    NOTE: face_recognition is a synchronous library. We run it in a
    thread pool executor to avoid blocking the async event loop.
    """

    # HOG is faster; "cnn" is more accurate but requires more CPU/memory
    MODEL = "hog"

    async def detect_faces(self, image_bytes: bytes) -> FaceDetectionResult:
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, self._detect_sync, image_bytes
        )

    def _detect_sync(self, image_bytes: bytes) -> FaceDetectionResult:
        try:
            import face_recognition
            from PIL import Image
            import numpy as np

            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            rgb_array = np.array(image)

            locations = face_recognition.face_locations(rgb_array, model=self.MODEL)

            if len(locations) > 1:
                # Filter out false positives (e.g. watermarks, seals) by keeping only the largest face
                locations = [max(locations, key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]))]

            face_locs = [
                FaceLocation(top=t, right=r, bottom=b, left=l)
                for (t, r, b, l) in locations
            ]

            result = FaceDetectionResult(
                faces_found=len(locations),
                face_locations=face_locs,
            )

            validated = self._validate_result(result)

            logger.info(
                "face_detection_complete",
                faces_found=result.faces_found,
                passed=validated.passed,
            )

            return validated

        except Exception as exc:
            logger.error("face_detection_error", error=str(exc))
            return FaceDetectionResult(
                faces_found=0,
                passed=False,
                error="We could not process this image. Please try again with a clearer photo.",
            )


def get_face_detection_service() -> FaceDetectionService:
    """Factory — returns the configured face detection provider."""
    return LocalFaceDetectionProvider()
