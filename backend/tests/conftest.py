"""
RentHub Backend — Test Configuration

Provides:
- Async test client via httpx + ASGITransport
- In-memory SQLite test database (no Docker needed for unit tests)
- Override get_db and get_redis dependencies
- pytest-asyncio configured for async tests
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from unittest.mock import AsyncMock, MagicMock

from app.core.config import get_settings
from app.database.base import Base
from app.database.session import get_db
from app.database.redis import get_redis
from app.main import create_application

# ─── Override settings for tests ─────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


# ─── Database Fixtures ────────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="function")
async def test_db_engine():
    """Create an in-memory SQLite engine for tests."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_db_engine) -> AsyncSession:
    """Provide a test database session."""
    session_factory = async_sessionmaker(
        bind=test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


# ─── Redis Mock ───────────────────────────────────────────────────────────────

@pytest.fixture
def mock_redis():
    """Mock Redis client for tests."""
    redis = AsyncMock()
    redis.ping.return_value = True
    redis.pipeline.return_value.__aenter__ = AsyncMock(return_value=redis)
    redis.pipeline.return_value.__aexit__ = AsyncMock(return_value=False)
    redis.execute = AsyncMock(return_value=[0, 1, 1, True])
    return redis


# ─── Test Client ─────────────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession, mock_redis) -> AsyncClient:
    """Async test client with overridden dependencies."""
    app = create_application()

    async def override_get_db():
        yield db_session

    async def override_get_redis():
        return mock_redis

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
