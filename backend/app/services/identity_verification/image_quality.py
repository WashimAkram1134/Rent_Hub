"""
RentHub — Image Quality Service

Validates that an uploaded image meets minimum requirements for face detection:
- Decodable by Pillow
- Minimum resolution
- Not extremely blurry (Laplacian variance)
- Not extremely dark or overexposed
- File size within limit

This runs BEFORE any AI model to fail fast on bad inputs.
"""

from __future__ import annotations

import io
from dataclasses import dataclass

from PIL import Image, ImageStat

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class ImageQualityResult:
    passed: bool
    error: str | None = None
    width: int = 0
    height: int = 0
    blur_score: float = 0.0  # higher = sharper


class ImageQualityService:
    """
    Performs basic image quality checks using Pillow only.
    Does NOT load any AI model — pure pixel analysis.
    """

    MIN_WIDTH = 300
    MIN_HEIGHT = 300
    MIN_BLUR_SCORE = 80.0       # Laplacian variance threshold; below = too blurry
    MIN_BRIGHTNESS = 30.0       # 0-255 scale; below = too dark
    MAX_BRIGHTNESS = 240.0      # above = overexposed

    async def check(self, image_bytes: bytes) -> ImageQualityResult:
        """
        Run all quality checks on raw image bytes.
        Returns ImageQualityResult with passed=True if image is acceptable.
        """
        # ── 1. Decode check ──────────────────────────────────────────────
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()  # checks file integrity
            # Re-open after verify (verify closes the fp)
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as exc:
            logger.warning("image_decode_failed", error=str(exc))
            return ImageQualityResult(passed=False, error="Unable to open the image. Please upload a valid JPG, PNG, or WEBP file.")

        width, height = image.size

        # ── 2. Minimum resolution ─────────────────────────────────────────
        if width < self.MIN_WIDTH or height < self.MIN_HEIGHT:
            return ImageQualityResult(
                passed=False,
                error=f"Image resolution is too low ({width}×{height}). Please upload a clearer, higher-resolution image.",
                width=width,
                height=height,
            )

        # ── 3. Brightness check ───────────────────────────────────────────
        stat = ImageStat.Stat(image)
        brightness = sum(stat.mean) / 3  # average of R, G, B channels

        if brightness < self.MIN_BRIGHTNESS:
            return ImageQualityResult(
                passed=False,
                error="The image appears too dark. Please take a photo in better lighting.",
                width=width,
                height=height,
            )

        if brightness > self.MAX_BRIGHTNESS:
            return ImageQualityResult(
                passed=False,
                error="The image appears overexposed. Please reduce glare or avoid direct flash.",
                width=width,
                height=height,
            )

        # ── 4. Blur / sharpness check (Laplacian variance) ────────────────
        blur_score = self._laplacian_variance(image)

        if blur_score < self.MIN_BLUR_SCORE:
            return ImageQualityResult(
                passed=False,
                error="The image appears blurry. Please upload a sharper, clearer photo.",
                width=width,
                height=height,
                blur_score=blur_score,
            )

        logger.info(
            "image_quality_passed",
            width=width,
            height=height,
            brightness=round(brightness, 1),
            blur_score=round(blur_score, 1),
        )

        return ImageQualityResult(
            passed=True,
            width=width,
            height=height,
            blur_score=blur_score,
        )

    def _laplacian_variance(self, image: Image.Image) -> float:
        """
        Approximate Laplacian variance using Pillow (no OpenCV).
        Higher value = sharper image.
        """
        import numpy as np

        gray = image.convert("L")
        arr = np.array(gray, dtype=np.float32)

        # Simple Laplacian kernel convolution
        kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        from PIL import ImageFilter
        laplacian_img = gray.filter(ImageFilter.Kernel(
            size=(3, 3),
            kernel=[0, 1, 0, 1, -4, 1, 0, 1, 0],
            scale=1,
            offset=128,
        ))
        lap_arr = np.array(laplacian_img, dtype=np.float32)
        return float(np.var(lap_arr))
