"""
RentHub Backend — Cloudinary Storage Backend

Implements StorageBackend using Cloudinary for permanent, globally-CDN-served uploads.

Files are uploaded to: renthub/{folder}/{uuid}
Public URLs:           https://res.cloudinary.com/{cloud_name}/image/upload/renthub/{folder}/{uuid}

Benefits over local storage:
- Works in production / any deployment (URLs are always publicly accessible)
- Free 25 GB bandwidth + 25 GB storage on Cloudinary free tier
- Automatic format optimisation and responsive transformations available

Security:
- Filenames are always UUID-based (no user input in paths).
- Unsigned uploads are disabled; we use server-side signed uploads via API key/secret.
"""

from __future__ import annotations

import io
import uuid
from concurrent.futures import ThreadPoolExecutor

import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.core.logging import get_logger
from app.storage.base import StorageBackend, UploadedFile

logger = get_logger(__name__)

# Thread pool for running the synchronous Cloudinary SDK in async context
_executor = ThreadPoolExecutor(max_workers=4)

SAFE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
}

RESOURCE_TYPE_MAP = {
    "application/pdf": "raw",
}


def _configure_cloudinary() -> None:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


class CloudinaryStorageBackend(StorageBackend):
    """
    Stores files on Cloudinary CDN.

    Uses the synchronous Cloudinary SDK wrapped in a thread-pool executor
    so it is non-blocking in async FastAPI request handlers.
    """

    def __init__(self) -> None:
        _configure_cloudinary()

    async def save(
        self,
        file_data: bytes,
        original_filename: str,
        content_type: str,
        folder: str = "uploads",
    ) -> UploadedFile:
        if content_type not in SAFE_CONTENT_TYPES:
            raise ValueError(f"Unsupported content type for cloud upload: {content_type}")

        public_id = f"renthub/{folder}/{uuid.uuid4()}"
        resource_type = RESOURCE_TYPE_MAP.get(content_type, "image")

        import asyncio
        loop = asyncio.get_event_loop()

        def _upload() -> dict:
            return cloudinary.uploader.upload(
                io.BytesIO(file_data),
                public_id=public_id,
                resource_type=resource_type,
                overwrite=False,
                unique_filename=False,
            )

        result: dict = await loop.run_in_executor(_executor, _upload)

        url: str = result["secure_url"]
        stored_filename = result["public_id"].split("/")[-1]

        logger.info(
            "file_uploaded_cloudinary",
            folder=folder,
            public_id=result["public_id"],
            url=url,
            size=len(file_data),
        )

        return UploadedFile(
            filename=stored_filename,
            url=url,
            size=len(file_data),
            content_type=content_type,
        )

    async def delete(self, filename: str, folder: str = "uploads") -> None:
        public_id = f"renthub/{folder}/{filename}"

        import asyncio
        loop = asyncio.get_event_loop()

        def _destroy() -> dict:
            return cloudinary.uploader.destroy(public_id)

        try:
            result = await loop.run_in_executor(_executor, _destroy)
            logger.info("file_deleted_cloudinary", public_id=public_id, result=result)
        except Exception as exc:
            logger.error("file_delete_error_cloudinary", public_id=public_id, error=str(exc))

    def get_url(self, filename: str, folder: str = "uploads") -> str:
        return cloudinary.CloudinaryImage(f"renthub/{folder}/{filename}").build_url(secure=True)
