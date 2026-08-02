"""
RentHub Backend — Storage Backend Abstraction

Defines a StorageBackend abstract interface so the rest of the application
is decoupled from the actual storage implementation.

To add AWS S3 support:
1. Create app/storage/s3.py implementing StorageBackend.
2. Set STORAGE_BACKEND=s3 in .env.
3. The factory function get_storage() will return the correct backend.

File naming strategy:
- Uses UUID + original extension to prevent filename collisions and path traversal.
"""

from __future__ import annotations

import abc
from dataclasses import dataclass


@dataclass
class UploadedFile:
    """Result returned by StorageBackend.save()."""

    filename: str   # UUID-based stored filename
    url: str        # Public-facing URL to access the file
    size: int       # File size in bytes
    content_type: str


class StorageBackend(abc.ABC):
    """Abstract interface for file storage backends."""

    @abc.abstractmethod
    async def save(
        self,
        file_data: bytes,
        original_filename: str,
        content_type: str,
        folder: str = "uploads",
    ) -> UploadedFile:
        """
        Persist a file and return its public URL.

        Args:
            file_data:         Raw file bytes.
            original_filename: Original name from the upload (used for extension only).
            content_type:      MIME type (e.g., "image/jpeg").
            folder:            Logical folder (e.g., "avatars", "products").

        Returns:
            UploadedFile with filename, url, size, and content_type.
        """
        ...

    @abc.abstractmethod
    async def delete(self, filename: str, folder: str = "uploads") -> None:
        """Delete a stored file by its stored filename."""
        ...

    @abc.abstractmethod
    def get_url(self, filename: str, folder: str = "uploads") -> str:
        """Return the public URL for a stored file without fetching it."""
        ...


def get_storage() -> StorageBackend:
    """
    Factory that returns the configured storage backend.

    Reads STORAGE_BACKEND from settings. Defaults to local storage.
    """
    from app.core.config import settings

    if settings.STORAGE_BACKEND == "s3":
        from app.storage.s3 import S3StorageBackend  # type: ignore[import]
        return S3StorageBackend()
    else:
        from app.storage.local import LocalStorageBackend
        return LocalStorageBackend()
