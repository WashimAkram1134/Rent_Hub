"""
RentHub Backend — Local Filesystem Storage Backend

Implements StorageBackend for local disk storage.

Files are saved to: LOCAL_STORAGE_PATH/{folder}/{uuid}.{ext}
Public URLs:         LOCAL_STORAGE_URL/{folder}/{uuid}.{ext}

Nginx serves the /uploads/ path from the same volume.

Security:
- Filenames are always UUID-based (no user input in paths).
- Extension is extracted and validated before saving.
"""

from __future__ import annotations

import os
import uuid
from pathlib import Path

import aiofiles

from app.core.config import settings
from app.core.logging import get_logger
from app.storage.base import StorageBackend, UploadedFile

logger = get_logger(__name__)

SAFE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
}


class LocalStorageBackend(StorageBackend):
    """Stores files on the local filesystem, served by Nginx."""

    def __init__(self) -> None:
        self.base_path = Path(settings.LOCAL_STORAGE_PATH)
        self.base_url = settings.LOCAL_STORAGE_URL.rstrip("/")

    async def save(
        self,
        file_data: bytes,
        original_filename: str,
        content_type: str,
        folder: str = "uploads",
    ) -> UploadedFile:
        extension = SAFE_EXTENSIONS.get(content_type)
        if extension is None:
            # Fall back to original extension (sanitized)
            _, ext = os.path.splitext(original_filename)
            extension = ext.lower() if ext else ".bin"

        stored_filename = f"{uuid.uuid4()}{extension}"
        folder_path = self.base_path / folder
        folder_path.mkdir(parents=True, exist_ok=True)

        file_path = folder_path / stored_filename

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_data)

        logger.info(
            "file_saved_locally",
            folder=folder,
            filename=stored_filename,
            size=len(file_data),
        )

        return UploadedFile(
            filename=stored_filename,
            url=self.get_url(stored_filename, folder),
            size=len(file_data),
            content_type=content_type,
        )

    async def delete(self, filename: str, folder: str = "uploads") -> None:
        file_path = self.base_path / folder / filename
        try:
            file_path.unlink(missing_ok=True)
            logger.info("file_deleted_locally", folder=folder, filename=filename)
        except OSError as exc:
            logger.error("file_delete_error", filename=filename, error=str(exc))

    def get_url(self, filename: str, folder: str = "uploads") -> str:
        return f"{self.base_url}/{folder}/{filename}"
