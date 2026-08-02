"""
Tests — Health Check Endpoint

Tests for GET /api/v1/health covering:
- Happy path: all services healthy
- Degraded path: Redis unreachable
- Response schema validation
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
class TestHealthCheck:

    async def test_health_returns_200_when_healthy(self, client: AsyncClient):
        """Health endpoint returns 200 and healthy status when DB and Redis are up."""
        with (
            patch("app.api.v1.health.check_db_connection", return_value=True),
            patch("app.api.v1.health.check_redis_connection", return_value=True),
        ):
            response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["services"]["database"] == "ok"
        assert data["services"]["redis"] == "ok"
        assert "version" in data
        assert "environment" in data

    async def test_health_returns_degraded_when_db_down(self, client: AsyncClient):
        """Health endpoint returns degraded when database is unreachable."""
        with (
            patch("app.api.v1.health.check_db_connection", return_value=False),
            patch("app.api.v1.health.check_redis_connection", return_value=True),
        ):
            response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["services"]["database"] == "unreachable"
        assert data["services"]["redis"] == "ok"

    async def test_health_returns_degraded_when_redis_down(self, client: AsyncClient):
        """Health endpoint returns degraded when Redis is unreachable."""
        with (
            patch("app.api.v1.health.check_db_connection", return_value=True),
            patch("app.api.v1.health.check_redis_connection", return_value=False),
        ):
            response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["services"]["redis"] == "unreachable"

    async def test_health_response_schema(self, client: AsyncClient):
        """Health response contains all required fields."""
        with (
            patch("app.api.v1.health.check_db_connection", return_value=True),
            patch("app.api.v1.health.check_redis_connection", return_value=True),
        ):
            response = await client.get("/api/v1/health")

        data = response.json()
        assert set(data.keys()) >= {"status", "version", "environment", "services"}
        assert set(data["services"].keys()) == {"database", "redis"}
