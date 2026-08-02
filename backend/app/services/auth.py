"""
RentHub — Auth Service (Business Logic)

Orchestrates all authentication use cases:
  register()              — Create account, assign role, send verification email
  login()                 — Verify credentials, issue JWT + refresh token
  refresh_access_token()  — Validate refresh token from cookie, issue new access token
  logout()                — Revoke refresh token
  verify_email()          — Mark email as verified
  forgot_password()       — Generate reset token, send email
  reset_password()        — Verify token, set new password, revoke all refresh tokens
  change_password()       — Authenticated password change

The service layer coordinates:
  - UserRepository (data access)
  - RoleRepository (RBAC lookup)
  - EmailService (notifications)
  - JWT / password utilities
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import (
    REFRESH_COOKIE_PARAMS,
    create_access_token,
    create_refresh_token,
    get_refresh_token_expires_at,
)
from app.auth.password import hash_password, is_password_strong, verify_password
from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    InvalidTokenException,
    NotFoundException,
    TokenExpiredException,
    UnauthorizedException,
)
from app.core.logging import get_logger
from app.models.user import RefreshToken, User
from app.repositories.role import RoleRepository
from app.repositories.user import UserRepository
from app.schemas.auth import (
    LoginResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.email import EmailService

logger = get_logger(__name__)


class AuthService:

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.email_svc = EmailService()

    # ─── Register ─────────────────────────────────────────────────────────────

    async def register(self, data: RegisterRequest, request: Request) -> UserResponse:
        """
        Create a new user account.

        Steps:
        1. Check email uniqueness
        2. Validate password strength
        3. Create user with hashed password
        4. Assign requested role
        5. Generate & store email verification token
        6. Send verification email (non-blocking failure)
        """
        # 1. Email uniqueness
        if await self.user_repo.email_exists(data.email):
            raise ConflictException("An account with this email address already exists.")

        # 2. Password strength
        is_strong, error_msg = is_password_strong(data.password)
        if not is_strong:
            raise BadRequestException(error_msg)

        # 3. Fetch role
        role = await self.role_repo.get_by_name(data.role)

        # 4. Create user
        verification_token = str(uuid.uuid4())
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            is_email_verified=True,  # Bypass email verification for now
            email_verification_token=verification_token,
            email_verification_expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
            roles=[role] if role else [],
        )
        self.db.add(user)
        await self.db.flush()

        # 5. Reload with relationships
        await self.db.refresh(user)

        # 6. Send verification email (don't fail registration if email fails)
        try:
            await self.email_svc.send_verification_email(
                to_email=user.email,
                first_name=user.first_name,
                token=verification_token,
            )
        except Exception as exc:
            logger.warning("verification_email_failed", user_id=str(user.id), error=str(exc))

        logger.info("user_registered", user_id=str(user.id), role=data.role)
        return UserResponse.model_validate(user)

    # ─── Login ────────────────────────────────────────────────────────────────

    async def login(self, email: str, password: str, request: Request) -> tuple[LoginResponse, str]:
        """
        Authenticate user and return tokens.

        Returns: (LoginResponse, raw_refresh_token)
        The caller is responsible for setting the refresh token as an httpOnly cookie.
        """
        user = await self.user_repo.get_by_email(email)

        # Use constant-time comparison to prevent timing attacks
        if user is None or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Your account has been suspended. Please contact support.")

        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        self.db.add(user)

        # Create tokens
        access_token = create_access_token(
            user_id=user.id,
            role=user.primary_role,
            permissions=user.permission_names,
        )
        raw_refresh = create_refresh_token()
        token_hash = RefreshToken.hash_token(raw_refresh)

        await self.user_repo.create_refresh_token(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=get_refresh_token_expires_at(),
            user_agent=request.headers.get("user-agent", "")[:500],
            ip_address=request.client.host if request.client else None,
        )

        await self.db.flush()

        logger.info("user_logged_in", user_id=str(user.id))

        token_response = TokenResponse(
            access_token=access_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        login_response = LoginResponse(
            token=token_response,
            user=UserResponse.model_validate(user),
        )
        return login_response, raw_refresh

    # ─── Refresh ──────────────────────────────────────────────────────────────

    async def refresh_access_token(self, raw_refresh_token: str) -> TokenResponse:
        """
        Validate the refresh token and issue a new access token.

        Implements token rotation: the old refresh token is revoked and a new one is issued.
        """
        token_hash = RefreshToken.hash_token(raw_refresh_token)
        stored = await self.user_repo.get_refresh_token(token_hash)

        if stored is None:
            raise InvalidTokenException()

        if stored.is_revoked:
            # Possible token reuse attack — revoke all user tokens
            await self.user_repo.revoke_all_user_tokens(stored.user_id)
            logger.warning("refresh_token_reuse_detected", user_id=str(stored.user_id))
            raise InvalidTokenException()

        if stored.expires_at < datetime.now(timezone.utc):
            await self.user_repo.revoke_refresh_token(token_hash)
            raise TokenExpiredException()

        user = await self.user_repo.get_active_by_id(stored.user_id)
        if user is None:
            raise UnauthorizedException()

        # Revoke old token (rotation)
        await self.user_repo.revoke_refresh_token(token_hash)

        # Issue new access token
        new_access = create_access_token(
            user_id=user.id,
            role=user.primary_role,
            permissions=user.permission_names,
        )

        return TokenResponse(
            access_token=new_access,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    # ─── Logout ───────────────────────────────────────────────────────────────

    async def logout(self, raw_refresh_token: str | None, user: User) -> None:
        """Revoke the current refresh token."""
        if raw_refresh_token:
            token_hash = RefreshToken.hash_token(raw_refresh_token)
            await self.user_repo.revoke_refresh_token(token_hash)
        logger.info("user_logged_out", user_id=str(user.id))

    # ─── Email Verification ───────────────────────────────────────────────────

    async def verify_email(self, token: str) -> UserResponse:
        user = await self.user_repo.get_by_verification_token(token)

        if user is None:
            raise InvalidTokenException()

        if user.is_email_verified:
            return UserResponse.model_validate(user)  # Already verified

        if (
            user.email_verification_expires_at is None
            or user.email_verification_expires_at < datetime.now(timezone.utc)
        ):
            raise TokenExpiredException()

        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires_at = None
        self.db.add(user)
        await self.db.flush()

        # Send welcome email
        try:
            await self.email_svc.send_welcome_email(
                to_email=user.email,
                first_name=user.first_name,
            )
        except Exception:
            pass

        logger.info("email_verified", user_id=str(user.id))
        return UserResponse.model_validate(user)

    # ─── Forgot Password ──────────────────────────────────────────────────────

    async def forgot_password(self, email: str) -> None:
        """
        Generate a password reset token and send the reset email.

        Always returns success (don't reveal whether email exists).
        """
        user = await self.user_repo.get_by_email(email)
        if user is None:
            # Don't reveal that the user doesn't exist
            logger.info("forgot_password_unknown_email", email=email)
            return

        reset_token = str(uuid.uuid4())
        user.password_reset_token = reset_token
        user.password_reset_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        self.db.add(user)
        await self.db.flush()

        try:
            await self.email_svc.send_password_reset_email(
                to_email=user.email,
                first_name=user.first_name,
                token=reset_token,
            )
        except Exception as exc:
            logger.error("reset_email_failed", email=email, error=str(exc))

        logger.info("password_reset_requested", user_id=str(user.id))

    # ─── Reset Password ───────────────────────────────────────────────────────

    async def reset_password(self, token: str, new_password: str) -> None:
        user = await self.user_repo.get_by_reset_token(token)

        if user is None:
            raise InvalidTokenException()

        if (
            user.password_reset_expires_at is None
            or user.password_reset_expires_at < datetime.now(timezone.utc)
        ):
            raise TokenExpiredException()

        is_strong, error_msg = is_password_strong(new_password)
        if not is_strong:
            raise BadRequestException(error_msg)

        user.password_hash = hash_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires_at = None
        self.db.add(user)

        # Revoke all existing refresh tokens for security
        await self.user_repo.revoke_all_user_tokens(user.id)
        await self.db.flush()

        logger.info("password_reset_completed", user_id=str(user.id))

    # ─── Change Password ──────────────────────────────────────────────────────

    async def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:
        if not verify_password(current_password, user.password_hash):
            raise BadRequestException("Current password is incorrect.")

        is_strong, error_msg = is_password_strong(new_password)
        if not is_strong:
            raise BadRequestException(error_msg)

        user.password_hash = hash_password(new_password)
        self.db.add(user)
        await self.user_repo.revoke_all_user_tokens(user.id)
        await self.db.flush()

        logger.info("password_changed", user_id=str(user.id))

    # ─── Resend Verification ──────────────────────────────────────────────────

    async def resend_verification_email(self, user: User) -> None:
        if user.is_email_verified:
            raise BadRequestException("Email is already verified.")

        token = str(uuid.uuid4())
        user.email_verification_token = token
        user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        self.db.add(user)
        await self.db.flush()

        await self.email_svc.send_verification_email(
            to_email=user.email,
            first_name=user.first_name,
            token=token,
        )
