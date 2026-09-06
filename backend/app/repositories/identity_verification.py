from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.identity_verification import IdentityVerification
from app.repositories.base import BaseRepository
from app.schemas.identity_verification import IdentityVerificationCreate, IdentityVerificationUpdate


class IdentityVerificationRepository(BaseRepository[IdentityVerification, IdentityVerificationCreate, IdentityVerificationUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, IdentityVerification)

    async def get_by_user_id(self, user_id: uuid.UUID) -> IdentityVerification | None:
        """
        Get the active identity verification record for a user.
        """
        stmt = select(IdentityVerification).where(
            IdentityVerification.user_id == user_id,
            IdentityVerification.deleted_at.is_(None)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
