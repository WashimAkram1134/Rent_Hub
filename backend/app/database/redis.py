"""
RentHub Backend — Redis Connection

Provides:
- A shared async Redis connection pool (redis.asyncio)
- get_redis() FastAPI dependency
- Health check helper
"""

from __future__ import annotations

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ─── Connection Pool ─────────────────────────────────────────────────────────

_redis_pool: Redis | None = None


async def get_redis_pool() -> Redis:
    """
    Return (or create) the shared Redis connection pool.
    Called once during application startup.
    """
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
        logger.info("redis_pool_created", url=settings.REDIS_URL.split("@")[-1])
    return _redis_pool


async def close_redis_pool() -> None:
    """Close the shared Redis connection pool (call on app shutdown)."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
        logger.info("redis_pool_closed")


# ─── FastAPI Dependency ───────────────────────────────────────────────────────

async def get_redis() -> Redis:
    """
    FastAPI dependency that returns the shared Redis client.

    Usage:
        async def my_endpoint(redis: Redis = Depends(get_redis)):
            await redis.set("key", "value")
    """
    return await get_redis_pool()


# ─── Health Check ────────────────────────────────────────────────────────────

async def check_redis_connection() -> bool:
    """Return True if Redis is reachable, False otherwise."""
    try:
        pool = await get_redis_pool()
        return await pool.ping()
    except Exception as exc:  # noqa: BLE001
        logger.error("redis_connection_failed", error=str(exc))
        return False
