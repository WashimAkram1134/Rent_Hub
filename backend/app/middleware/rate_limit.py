"""
RentHub Backend — Redis Sliding Window Rate Limiter Middleware

Algorithm: Sliding window using Redis sorted sets.
Each key is: rate_limit:{client_ip}
Score = timestamp, so we can count requests in the last N seconds.

Configuration:
- RATE_LIMIT_PER_MINUTE (general endpoints)
- AUTH_RATE_LIMIT_PER_MINUTE (auth endpoints — stricter)

Returns 429 with Retry-After header when limit is exceeded.
"""

from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.logging import get_logger
from app.database.redis import get_redis_pool

logger = get_logger(__name__)

AUTH_PATHS = {"/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/forgot-password"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ("/api/v1/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        is_auth = request.url.path in AUTH_PATHS
        limit = settings.AUTH_RATE_LIMIT_PER_MINUTE if is_auth else settings.RATE_LIMIT_PER_MINUTE
        window = 60  # seconds

        try:
            redis = await get_redis_pool()
            key = f"rate_limit:{'auth' if is_auth else 'api'}:{client_ip}"
            now = time.time()
            window_start = now - window

            pipe = redis.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)   # Remove old entries
            pipe.zadd(key, {str(now): now})               # Add current request
            pipe.zcard(key)                               # Count requests in window
            pipe.expire(key, window)                      # TTL = window size
            results = await pipe.execute()

            request_count = results[2]

            if request_count > limit:
                logger.warning(
                    "rate_limit_exceeded",
                    client_ip=client_ip,
                    path=request.url.path,
                    count=request_count,
                    limit=limit,
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "Too many requests. Please slow down.",
                        },
                    },
                    headers={"Retry-After": str(window)},
                )
        except Exception as exc:  # noqa: BLE001
            # Redis failure should NOT block the request — fail open
            logger.warning("rate_limit_redis_error", error=str(exc))

        return await call_next(request)

    @staticmethod
    def _get_client_ip(request: Request) -> str:
        """Extract the real client IP, honoring X-Forwarded-For from Nginx."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
