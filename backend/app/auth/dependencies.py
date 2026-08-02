"""
RentHub — FastAPI Auth Dependencies

Provides injectable dependencies for route protection:

  get_current_user       — Requires valid access token, returns User
  get_current_user_opt   — Optional auth (returns None if no token)
  require_verified_email — User must have verified email
  require_role(role)     — User must have a specific role
  require_permission(p)  — User must have a specific permission

Usage:
    @router.get("/products")
    async def list_products(
        current_user: User = Depends(get_current_user),
    ): ...

    @router.post("/products")
    async def create_product(
        _: User = Depends(require_permission("product:create")),
        current_user: User = Depends(get_current_user),
    ): ...
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import decode_access_token
from app.core.exceptions import (
    AccountBannedException,
    EmailNotVerifiedException,
    ForbiddenException,
    UnauthorizedException,
)
from app.database.session import get_db
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Decode the Bearer token and return the authenticated User.

    Raises UnauthorizedException if token is missing or invalid.
    Raises AccountBannedException if user is inactive/deleted.
    """
    if not credentials:
        raise UnauthorizedException("Authentication required. Please provide a Bearer token.")

    payload = decode_access_token(credentials.credentials)
    user_id: str = payload.get("sub", "")

    if not user_id:
        raise UnauthorizedException()

    # Import here to avoid circular imports
    from app.repositories.user import UserRepository
    repo = UserRepository(db)
    user = await repo.get_active_by_id(user_id)

    if user is None:
        raise UnauthorizedException("User account not found or has been deleted.")

    if not user.is_active:
        raise AccountBannedException()

    return user


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Return the current user if authenticated, or None for anonymous requests."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except Exception:
        return None


def require_verified_email(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require the user to have a verified email address."""
    if not current_user.is_email_verified:
        raise EmailNotVerifiedException()
    return current_user


def require_role(*roles: str):
    """
    Dependency factory that requires the current user to have one of the given roles.

    Usage:
        @router.delete("/users/{id}")
        async def delete_user(
            _: User = Depends(require_role("admin")),
        ): ...
    """
    async def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.primary_role not in roles:
            raise ForbiddenException(
                f"This action requires one of these roles: {', '.join(roles)}."
            )
        return current_user
    return _dependency


def require_permission(permission: str):
    """
    Dependency factory that requires the current user to have a specific permission.

    Usage:
        @router.post("/products")
        async def create_product(
            _: User = Depends(require_permission("product:create")),
        ): ...
    """
    async def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if permission not in current_user.permission_names:
            raise ForbiddenException(
                f"You do not have the '{permission}' permission required for this action."
            )
        return current_user
    return _dependency


# ─── Typed Annotations ────────────────────────────────────────────────────────
# Use these in route signatures for cleaner code.

CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentUserOptional = Annotated[User | None, Depends(get_current_user_optional)]
VerifiedUser = Annotated[User, Depends(require_verified_email)]
