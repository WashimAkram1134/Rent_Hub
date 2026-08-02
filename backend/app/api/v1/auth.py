"""
RentHub — Auth API Router

Endpoints:
  POST /api/v1/auth/register            — Create account
  POST /api/v1/auth/login               — Login, get tokens
  POST /api/v1/auth/refresh             — Refresh access token (cookie)
  POST /api/v1/auth/logout              — Revoke refresh token
  POST /api/v1/auth/verify-email        — Confirm email address
  POST /api/v1/auth/resend-verification — Re-send verification email
  POST /api/v1/auth/forgot-password     — Request reset link
  POST /api/v1/auth/reset-password      — Set new password with token
  POST /api/v1/auth/change-password     — Authenticated password change
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, get_current_user
from app.auth.jwt import REFRESH_COOKIE_PARAMS, REFRESH_TOKEN_COOKIE_KEY
from app.core.exceptions import UnauthorizedException
from app.database.session import get_db
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth import AuthService
from app.utils.response import MessageResponse, success

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
)
async def register(
    data: RegisterRequest,
    request: Request,
    svc: AuthService = Depends(_get_auth_service),
) -> dict:
    user = await svc.register(data, request)
    return success(
        data=user.model_dump(),
        message="Registration successful. Please check your email to verify your account.",
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=dict,
    summary="Login with email and password",
)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    svc: AuthService = Depends(_get_auth_service),
) -> dict:
    login_resp, raw_refresh = await svc.login(data.email, data.password, request)

    # Set refresh token in httpOnly cookie
    response.set_cookie(
        **REFRESH_COOKIE_PARAMS,
        value=raw_refresh,
    )

    return success(
        data=login_resp.model_dump(),
        message="Login successful.",
    )


# ─── Refresh ──────────────────────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=dict,
    summary="Refresh access token using httpOnly cookie",
)
async def refresh_token(
    request: Request,
    svc: AuthService = Depends(_get_auth_service),
) -> dict:
    raw_refresh = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)
    if not raw_refresh:
        raise UnauthorizedException("No refresh token found. Please log in again.")

    token_response = await svc.refresh_access_token(raw_refresh)
    return success(data=token_response.model_dump())


# ─── Logout ───────────────────────────────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout and revoke refresh token",
)
async def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user),
    svc: AuthService = Depends(_get_auth_service),
) -> MessageResponse:
    raw_refresh = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)
    await svc.logout(raw_refresh, current_user)

    # Clear the refresh cookie
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_KEY,
        path=REFRESH_COOKIE_PARAMS["path"],
    )
    return MessageResponse(message="Logged out successfully.")


# ─── Email Verification ───────────────────────────────────────────────────────

@router.post(
    "/verify-email",
    response_model=dict,
    summary="Verify email address with token",
)
async def verify_email(
    data: VerifyEmailRequest,
    svc: AuthService = Depends(_get_auth_service),
) -> dict:
    user = await svc.verify_email(data.token)
    return success(data=user.model_dump(), message="Email verified successfully.")


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Resend email verification link",
)
async def resend_verification(
    current_user: CurrentUser,
    svc: AuthService = Depends(_get_auth_service),
) -> MessageResponse:
    await svc.resend_verification_email(current_user)
    return MessageResponse(message="Verification email sent. Please check your inbox.")


# ─── Password Reset ───────────────────────────────────────────────────────────

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset email",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    svc: AuthService = Depends(_get_auth_service),
) -> MessageResponse:
    await svc.forgot_password(data.email)
    # Always return success to prevent email enumeration
    return MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using token from email",
)
async def reset_password(
    data: ResetPasswordRequest,
    svc: AuthService = Depends(_get_auth_service),
) -> MessageResponse:
    await svc.reset_password(data.token, data.new_password)
    return MessageResponse(message="Password reset successfully. Please log in with your new password.")


# ─── Change Password ──────────────────────────────────────────────────────────

@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password (authenticated)",
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: CurrentUser,
    svc: AuthService = Depends(_get_auth_service),
) -> MessageResponse:
    await svc.change_password(current_user, data.current_password, data.new_password)
    return MessageResponse(message="Password changed successfully. All sessions have been revoked.")
