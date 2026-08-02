"""
RentHub — JWT Token Management

Strategy:
  Access Token  — short-lived (15 min), contains user_id + permissions
  Refresh Token — long-lived (7 days), raw UUID stored in httpOnly cookie,
                  SHA-256 hash stored in the refresh_tokens DB table

Token Payload (access):
  {
    "sub":         "user-uuid",
    "permissions": ["product:read", "booking:create", ...],
    "role":        "customer",
    "type":        "access",
    "iat":         timestamp,
    "exp":         timestamp,
  }
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import InvalidTokenException, TokenExpiredException
from app.core.logging import get_logger

logger = get_logger(__name__)


# ─── Access Token ──────────────────────────────────────────────────────────────

def create_access_token(
    user_id: uuid.UUID,
    role: str,
    permissions: list[str],
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "permissions": permissions,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Raises TokenExpiredException or InvalidTokenException on failure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "access":
            raise InvalidTokenException()
        return payload
    except JWTError as exc:
        if "expired" in str(exc).lower():
            raise TokenExpiredException()
        logger.warning("jwt_decode_failed", error=str(exc))
        raise InvalidTokenException()


# ─── Refresh Token ─────────────────────────────────────────────────────────────

def create_refresh_token() -> str:
    """
    Generate a cryptographically random refresh token (UUID v4).

    The raw token is sent to the client in an httpOnly cookie.
    Store only the SHA-256 hash (via RefreshToken.hash_token()) in the DB.
    """
    return str(uuid.uuid4())


def get_refresh_token_expires_at() -> datetime:
    """Return the expiry datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)


# ─── Cookie Helpers ────────────────────────────────────────────────────────────

REFRESH_TOKEN_COOKIE_KEY = "refresh_token"

REFRESH_COOKIE_PARAMS = {
    "key": REFRESH_TOKEN_COOKIE_KEY,
    "httponly": True,
    "secure": True,      # HTTPS only in production
    "samesite": "lax",
    "max_age": settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    "path": "/api/v1/auth",  # Cookie only sent to auth endpoints
}
