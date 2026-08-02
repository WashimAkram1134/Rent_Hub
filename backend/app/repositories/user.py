"""
RentHub — User Repository

Extends BaseRepository with user-specific queries.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import RefreshToken, Role, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User, None, None]):  # type: ignore[type-var]

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, User)

    async def get_by_email(self, email: str) -> User | None:
        """Find an active (non-deleted) user by email (case-insensitive)."""
        result = await self.db.execute(
            select(User)
            .where(User.email == email.lower(), User.deleted_at.is_(None))
            .options(selectinload(User.roles).selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_active_by_id(self, user_id: str | uuid.UUID) -> User | None:
        """Find a non-deleted, active user by ID."""
        if isinstance(user_id, str):
            try:
                user_id = uuid.UUID(user_id)
            except ValueError:
                return None
        result = await self.db.execute(
            select(User)
            .where(User.id == user_id, User.deleted_at.is_(None))
            .options(selectinload(User.roles).selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> User | None:
        """Find a user by their email verification token."""
        result = await self.db.execute(
            select(User).where(
                User.email_verification_token == token,
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, token: str) -> User | None:
        """Find a user by their password reset token."""
        result = await self.db.execute(
            select(User).where(
                User.password_reset_token == token,
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """Return True if a non-deleted user with this email exists."""
        user = await self.get_by_email(email.lower())
        return user is not None

    # ── Refresh Token Operations ─────────────────────────────────────────────

    async def create_refresh_token(
        self,
        *,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> RefreshToken:
        rt = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        self.db.add(rt)
        await self.db.flush()
        return rt

    async def get_refresh_token(self, token_hash: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token_hash: str) -> None:
        rt = await self.get_refresh_token(token_hash)
        if rt:
            rt.is_revoked = True
            self.db.add(rt)
            await self.db.flush()

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> None:
        """Revoke all refresh tokens for a user (e.g., on password change)."""
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_revoked == False,  # noqa: E712
            )
        )
        tokens = result.scalars().all()
        for token in tokens:
            token.is_revoked = True
            self.db.add(token)
        await self.db.flush()
