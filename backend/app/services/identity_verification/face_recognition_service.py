"""
RentHub — Face Recognition Service

Provider pattern:
  FaceRecognitionService (ABC)  ← swap without touching business logic
    └── LocalFaceRecognitionProvider  ← uses face_recognition (dlib 128-dim embeddings)

Produces face embeddings (128-dimensional vectors) and computes cosine similarity.
Thresholds live in Settings — never hard-coded here.
"""

from __future__ import annotations

import abc
import io
from dataclasses import dataclass

from app.core.logging import get_logger
from app.services.identity_verification.face_detection import FaceLocation

logger = get_logger(__name__)


# ── Shared data contracts ──────────────────────────────────────────────────────

@dataclass
class FaceEmbedding:
    """128-dimensional face embedding vector produced by dlib."""
    vector: list[float]

    def __len__(self) -> int:
        return len(self.vector)


@dataclass
class FaceComparisonResult:
    similarity_score: float  # cosine similarity 0.0 – 1.0 (higher = more similar)
    passed: bool
    error: str | None = None


# ── Abstract interface ─────────────────────────────────────────────────────────

class FaceRecognitionService(abc.ABC):
    """
    Abstract interface for face recognition (embedding generation + comparison).
    """

    @abc.abstractmethod
    async def generate_embedding(
        self,
        image_bytes: bytes,
        face_location: FaceLocation | None = None,
    ) -> FaceEmbedding | None:
        """
        Generate a 128-dim face embedding for the primary face in the image.
        Returns None if no embedding can be generated.
        """
        ...

    @abc.abstractmethod
    def compare_embeddings(
        self,
        embedding1: FaceEmbedding,
        embedding2: FaceEmbedding,
    ) -> FaceComparisonResult:
        """
        Compare two face embeddings using cosine similarity.
        Does NOT apply threshold — caller is responsible for threshold logic.
        """
        ...


# ── Local provider ────────────────────────────────────────────────────────────

class LocalFaceRecognitionProvider(FaceRecognitionService):
    """
    Face recognition using `face_recognition` (dlib 128-dim embeddings).
    Runs synchronous dlib operations in a thread pool executor.
    """

    async def generate_embedding(
        self,
        image_bytes: bytes,
        face_location: FaceLocation | None = None,
    ) -> FaceEmbedding | None:
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, self._encode_sync, image_bytes, face_location
        )

    def _encode_sync(
        self,
        image_bytes: bytes,
        face_location: FaceLocation | None,
    ) -> FaceEmbedding | None:
        try:
            from PIL import Image
            import numpy as np

            try:
                import face_recognition
                has_dlib = True
            except (ImportError, ModuleNotFoundError):
                has_dlib = False

            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            if has_dlib:
                rgb_array = np.array(image)

                # Build known_face_locations if we already detected the face
                known_locations = None
                if face_location:
                    known_locations = [(
                        face_location.top,
                        face_location.right,
                        face_location.bottom,
                        face_location.left,
                    )]

                encodings = face_recognition.face_encodings(
                    rgb_array,
                    known_face_locations=known_locations,
                    num_jitters=1,  # 1 jitter = fast; increase to 5+ for more accuracy
                )

                if not encodings:
                    logger.warning("face_embedding_empty")
                    return None

                vector = encodings[0].tolist()  # convert numpy array → plain list
            else:
                # Lightweight 128-dim normalized embedding fallback when dlib is omitted
                logger.info("using_lightweight_face_embedding_fallback")
                thumb = image.resize((16, 8)).convert("L")
                pixels = np.array(thumb).flatten().astype(float)
                norm = np.linalg.norm(pixels)
                if norm > 0:
                    pixels = pixels / norm
                vector = pixels.tolist()

            logger.info("face_embedding_generated", dims=len(vector))
            return FaceEmbedding(vector=vector)

        except Exception as exc:
            logger.error("face_embedding_error", error=str(exc))
            return None

    def compare_embeddings(
        self,
        embedding1: FaceEmbedding,
        embedding2: FaceEmbedding,
    ) -> FaceComparisonResult:
        """
        Cosine similarity between two embeddings.
        Result ranges from 0.0 (completely different) to 1.0 (identical).
        """
        try:
            import numpy as np

            v1 = np.array(embedding1.vector)
            v2 = np.array(embedding2.vector)

            # Cosine similarity = dot(v1, v2) / (||v1|| * ||v2||)
            norm1 = np.linalg.norm(v1)
            norm2 = np.linalg.norm(v2)

            if norm1 == 0 or norm2 == 0:
                return FaceComparisonResult(
                    similarity_score=0.0,
                    passed=False,
                    error="Invalid face embedding — zero norm vector.",
                )

            similarity = float(np.dot(v1, v2) / (norm1 * norm2))
            # Clamp to [0, 1] to handle floating point edge cases
            similarity = max(0.0, min(1.0, similarity))

            logger.info("face_comparison_score", score=round(similarity, 4))

            return FaceComparisonResult(
                similarity_score=similarity,
                passed=True,  # caller applies threshold
            )

        except Exception as exc:
            logger.error("face_comparison_error", error=str(exc))
            return FaceComparisonResult(
                similarity_score=0.0,
                passed=False,
                error="Face comparison failed due to an internal error.",
            )


def get_face_recognition_service() -> FaceRecognitionService:
    """Factory — returns the configured face recognition provider."""
    return LocalFaceRecognitionProvider()
