"""
RentHub Backend — Async SQLAlchemy Database Session

Provides:
- Async engine with connection pool configuration
- AsyncSessionLocal factory
- get_db() FastAPI dependency (yields a session, commits on success, rolls back on error)
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ─── Engine ──────────────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,          # Detect stale connections
    pool_recycle=3600,           # Recycle connections every hour
    echo=settings.APP_DEBUG,    # Log SQL statements in debug mode
    future=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

# ─── Session Factory ─────────────────────────────────────────────────────────

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,      # Don't expire objects after commit
    autoflush=False,
    autocommit=False,
)


# ─── FastAPI Dependency ───────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.

    Automatically commits on success and rolls back on exception.
    Usage:
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── Lifecycle Helpers ───────────────────────────────────────────────────────

async def check_db_connection() -> bool:
    """Return True if the database is reachable, False otherwise."""
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("db_connection_failed", error=str(exc))
        return False


async def dispose_db() -> None:
    """Dispose the engine connection pool (call on app shutdown)."""
    await engine.dispose()
