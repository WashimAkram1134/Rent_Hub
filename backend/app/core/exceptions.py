"""
RentHub Backend — Custom Exception Hierarchy & FastAPI Exception Handlers

Design:
- All domain exceptions inherit from RentHubException.
- Each exception carries an HTTP status code, error code (machine-readable),
  and a human-readable message.
- Global handlers translate exceptions into a consistent JSON error envelope.
- Unhandled exceptions are caught by a fallback 500 handler to prevent leaking
  internal details.

Error Envelope:
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product with id 42 was not found.",
    "details": { ... }   // optional
  }
}
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


# ─── Base Exception ──────────────────────────────────────────────────────────

class RentHubException(Exception):
    """Base class for all RentHub domain exceptions."""

    def __init__(
        self,
        *,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


# ─── 400 Bad Request ─────────────────────────────────────────────────────────

class BadRequestException(RentHubException):
    def __init__(self, message: str = "Bad request.", details: dict | None = None) -> None:
        super().__init__(
            message=message,
            code="BAD_REQUEST",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class ValidationException(RentHubException):
    def __init__(self, message: str = "Validation failed.", details: dict | None = None) -> None:
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


# ─── 401 Unauthorized ────────────────────────────────────────────────────────

class UnauthorizedException(RentHubException):
    def __init__(self, message: str = "Authentication required.") -> None:
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class InvalidCredentialsException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Invalid email or password.",
            code="INVALID_CREDENTIALS",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class TokenExpiredException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Token has expired.",
            code="TOKEN_EXPIRED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class InvalidTokenException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Invalid token.",
            code="INVALID_TOKEN",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


# ─── 403 Forbidden ───────────────────────────────────────────────────────────

class ForbiddenException(RentHubException):
    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class EmailNotVerifiedException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Please verify your email address before proceeding.",
            code="EMAIL_NOT_VERIFIED",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class AccountBannedException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Your account has been suspended. Please contact support.",
            code="ACCOUNT_BANNED",
            status_code=status.HTTP_403_FORBIDDEN,
        )


# ─── 404 Not Found ───────────────────────────────────────────────────────────

class NotFoundException(RentHubException):
    def __init__(self, resource: str = "Resource", resource_id: Any = None) -> None:
        message = (
            f"{resource} with id '{resource_id}' was not found."
            if resource_id is not None
            else f"{resource} was not found."
        )
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


# ─── 409 Conflict ────────────────────────────────────────────────────────────

class ConflictException(RentHubException):
    def __init__(self, message: str = "Resource already exists.") -> None:
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
        )


class EmailAlreadyExistsException(ConflictException):
    def __init__(self) -> None:
        super().__init__("An account with this email address already exists.")


# ─── 429 Rate Limited ────────────────────────────────────────────────────────

class RateLimitException(RentHubException):
    def __init__(self) -> None:
        super().__init__(
            message="Too many requests. Please slow down.",
            code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        )


# ─── 500 Internal ────────────────────────────────────────────────────────────

class InternalServerException(RentHubException):
    def __init__(self, message: str = "An unexpected error occurred.") -> None:
        super().__init__(
            message=message,
            code="INTERNAL_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ─── Response Builders ───────────────────────────────────────────────────────

def _error_response(
    status_code: int,
    code: str,
    message: str,
    details: dict | None = None,
) -> JSONResponse:
    content: dict[str, Any] = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)


# ─── Exception Handlers ──────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers onto the FastAPI application."""

    @app.exception_handler(RentHubException)
    async def renthub_exception_handler(request: Request, exc: RentHubException) -> JSONResponse:
        if exc.status_code >= 500:
            logger.error(
                "domain_exception",
                code=exc.code,
                message=exc.message,
                path=str(request.url),
            )
        return _error_response(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Flatten pydantic validation errors into a clean structure
        field_errors: dict[str, list[str]] = {}
        for error in exc.errors():
            loc = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
            field_errors.setdefault(loc, []).append(error["msg"])

        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message="Request validation failed.",
            details={"fields": field_errors},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return _error_response(
            status_code=exc.status_code,
            code="HTTP_ERROR",
            message=str(exc.detail),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "unhandled_exception",
            exc_info=exc,
            path=str(request.url),
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INTERNAL_ERROR",
            message="An unexpected error occurred. Our team has been notified.",
        )
