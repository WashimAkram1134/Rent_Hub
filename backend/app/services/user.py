"""
RentHub — User Service (Module 3)

Handles:
- Profile info updates (name, phone)
- Avatar upload
- Password change
"""

from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password import hash_password, verify_password
from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import ProfileUpdateRequest


class UserService:

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_profile(self, user: User) -> User:
        """Return the current user (already loaded by dependency)."""
        return user

    async def update_profile(self, user: User, data: ProfileUpdateRequest) -> User:
        """Update mutable profile fields."""
        update_data = data.model_dump(exclude_none=True)
        
        if "email" in update_data and update_data["email"] != user.email:
            existing_user = await self.user_repo.get_by_email(update_data["email"])
            if existing_user:
                raise BadRequestException("Email is already in use by another account.")
                
        for key, value in update_data.items():
            setattr(user, key, value)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def change_password(self, user: User, current_password: str, new_password: str) -> None:
        """Verify the current password, then update to new hash."""
        if not verify_password(current_password, user.password_hash):
            raise BadRequestException("Current password is incorrect.")
        user.password_hash = hash_password(new_password)
        await self.db.flush()

    async def upload_avatar(self, user: User, file: UploadFile) -> str:
        """Save avatar image to local storage and return the public URL."""
        # Validate file type
        if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
            raise BadRequestException("Only JPEG, PNG, WebP, or GIF images are allowed.")

        # Build storage path
        ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
        filename = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
        upload_dir = Path(settings.LOCAL_STORAGE_PATH) / "avatars"
        upload_dir.mkdir(parents=True, exist_ok=True)
        dest = upload_dir / filename

        # Write file
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:  # 5 MB limit
            raise BadRequestException("Avatar image must be under 5 MB.")
        with open(dest, "wb") as f:
            f.write(contents)

        # Build public URL
        public_url = f"{settings.LOCAL_STORAGE_URL}/avatars/{filename}"

        # Delete old avatar file if it was locally stored
        if user.avatar_url and "/uploads/" in user.avatar_url:
            old_path = Path(settings.LOCAL_STORAGE_PATH) / user.avatar_url.split("/uploads/")[-1]
            if old_path.exists():
                os.remove(old_path)

        user.avatar_url = public_url
        await self.db.flush()
        return public_url
