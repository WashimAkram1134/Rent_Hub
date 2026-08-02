"""
RentHub Backend — Application Configuration

Uses pydantic-settings to load and validate all environment variables.
Every config value is typed, validated, and has a sensible default.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, EmailStr, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Application ───────────────────────────────────────────────────────
    APP_NAME: str = "RentHub"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_VERSION: str = "1.0.0"
    APP_DEBUG: bool = False
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # ─── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str
    # Direct connection for Alembic migrations (bypasses PgBouncer pooler)
    DIRECT_DATABASE_URL: str = ""
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # ─── Redis ─────────────────────────────────────────────────────────────
    REDIS_URL: str

    # ─── JWT ───────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated origins to a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # ─── Email ─────────────────────────────────────────────────────────────
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USE_TLS: bool = True
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: EmailStr = "noreply@renthub.com"  # type: ignore[assignment]
    EMAIL_FROM_NAME: str = "RentHub"

    # ─── Storage ───────────────────────────────────────────────────────────
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    LOCAL_STORAGE_PATH: str = "uploads"
    LOCAL_STORAGE_URL: str = "http://localhost:8000/uploads"

    # AWS S3 (optional — used when STORAGE_BACKEND=s3)
    AWS_S3_BUCKET: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-southeast-1"
    AWS_S3_BASE_URL: str = ""

    # ─── Rate Limiting ─────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 1000
    AUTH_RATE_LIMIT_PER_MINUTE: int = 200

    # ─── Pagination ────────────────────────────────────────────────────────
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # ─── Security ──────────────────────────────────────────────────────────
    PASSWORD_MIN_LENGTH: int = 8
    BCRYPT_ROUNDS: int = 12

    # ─── Computed Properties ───────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def openapi_enabled(self) -> bool:
        """Disable Swagger/ReDoc in production."""
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    """
    Return cached settings instance.

    Using lru_cache means settings are only parsed once per process lifetime.
    In tests, call get_settings.cache_clear() before overriding.
    """
    return Settings()


# Convenience alias for direct import
settings = get_settings()
