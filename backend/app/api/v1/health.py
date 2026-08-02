"""
RentHub Backend — Health Check Endpoint

GET /api/v1/health

Returns application status, version, and connectivity to database and Redis.
Used by Docker health checks, load balancers, and uptime monitors.

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
"""

from __future__ import annotations

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings
from app.database.redis import check_redis_connection
from app.database.session import check_db_connection

router = APIRouter(tags=["Health"])


class ServiceStatus(BaseModel):
    database: str
    redis: str


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    services: ServiceStatus


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check application health and connectivity to downstream services.",
    responses={
        200: {"description": "Application is healthy"},
        503: {"description": "One or more services are unavailable"},
    },
)
async def health_check() -> HealthResponse:
    db_ok = await check_db_connection()
    redis_ok = await check_redis_connection()

    all_healthy = db_ok and redis_ok

    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        services=ServiceStatus(
            database="ok" if db_ok else "unreachable",
            redis="ok" if redis_ok else "unreachable",
        ),
    )
