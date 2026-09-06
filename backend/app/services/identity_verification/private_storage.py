"""
RentHub — Private Storage Service for Identity Verification

Wraps the existing StorageBackend to provide identity-verification-specific
private file storage. Files are stored in a subdirectory that is NOT served
via the public /uploads static mount.

IMPORTANT: Identity verification images must NEVER be publicly accessible.
They are served only through authenticated API endpoints.

Directory layout:
  uploads/
  ├── products/           ← public, served by /uploads static mount
  ├── users/              ← public
  └── private/
      └── identity-verification/   ← PRIVATE, no static URL
"""

from __future__ import annotations

import uuid
from pathlib import Path

import aiofiles

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Allowed MIME types for identity documents
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

PRIVATE_SUBFOLDER = "private/identity-verification"


class PrivateStorageService:
    """
    Handles private file storage for identity verification documents and selfies.

    Unlike the public StorageBackend, files here are:
    - Stored under a private subdirectory
    - NOT accessible via static file URL
    - Served only via authenticated API endpoints with authorization checks
    """

    def __init__(self) -> None:
        self.base_path = Path(settings.LOCAL_STORAGE_PATH) / "private" / "identity-verification"
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_document_image(
        self,
        file_bytes: bytes,
        content_type: str,
    ) -> str:
        """
        Save an NID document image to private storage.
        Returns the stored filename (UUID-based, no path).
        """
        return await self._save(file_bytes, content_type, prefix="doc")

    async def save_selfie_image(
        self,
        file_bytes: bytes,
        content_type: str = "image/jpeg",
    ) -> str:
        """
        Save a live selfie frame to private storage.
        Returns the stored filename.
        """
        return await self._save(file_bytes, content_type, prefix="selfie")

    async def load_file(self, filename: str) -> bytes | None:
        """
        Load a stored file by filename. Returns bytes or None if not found.
        """
        file_path = self.base_path / filename
        if not file_path.exists():
            return None

        async with aiofiles.open(file_path, "rb") as f:
            return await f.read()

    async def delete_file(self, filename: str) -> None:
        """Delete a stored file. Silent if not found."""
        file_path = self.base_path / filename
        try:
            file_path.unlink(missing_ok=True)
            logger.info("private_file_deleted", filename=filename)
        except OSError as exc:
            logger.error("private_file_delete_error", filename=filename, error=str(exc))

    def validate_content_type(self, content_type: str) -> bool:
        """Return True if content_type is an allowed image type."""
        return content_type in ALLOWED_CONTENT_TYPES

    def validate_file_size(self, file_bytes: bytes) -> bool:
        """Return True if file is within the configured size limit."""
        max_bytes = settings.IDENTITY_DOCUMENT_MAX_SIZE_MB * 1024 * 1024
        return len(file_bytes) <= max_bytes

    async def _save(self, file_bytes: bytes, content_type: str, prefix: str) -> str:
        extension = EXTENSION_MAP.get(content_type, ".jpg")
        filename = f"{prefix}_{uuid.uuid4()}{extension}"
        file_path = self.base_path / filename

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_bytes)

        logger.info(
            "private_file_saved",
            prefix=prefix,
            filename=filename,
            size=len(file_bytes),
        )
        return filename


def get_private_storage() -> PrivateStorageService:
    return PrivateStorageService()
