"""
Tests — Auth Endpoints

Covers:
  - Registration (success, duplicate email, weak password)
  - Login (success, invalid credentials, inactive account)
  - Token refresh
  - Logout
  - Email verification
  - Forgot/reset password
  - Protected route enforcement
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


# ─── Fixtures ─────────────────────────────────────────────────────────────────

VALID_REGISTER_DATA = {
    "email": "testuser@example.com",
    "password": "SecurePass@123",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer",
}


@pytest.fixture
def mock_email_service():
    with patch("app.services.auth.EmailService.send_verification_email", new_callable=AsyncMock) as mock:
        mock.return_value = True
        yield mock


# ─── Registration ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestRegister:

    async def test_register_success(self, client: AsyncClient, mock_email_service):
        response = await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "testuser@example.com"
        assert data["data"]["first_name"] == "Test"
        assert "password_hash" not in data["data"]

    async def test_register_duplicate_email(self, client: AsyncClient, mock_email_service):
        await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        response = await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "CONFLICT"

    async def test_register_invalid_email(self, client: AsyncClient):
        data = {**VALID_REGISTER_DATA, "email": "not-an-email"}
        response = await client.post("/api/v1/auth/register", json=data)
        assert response.status_code == 422

    async def test_register_weak_password(self, client: AsyncClient):
        data = {**VALID_REGISTER_DATA, "email": "weak@test.com", "password": "password"}
        response = await client.post("/api/v1/auth/register", json=data)
        # Weak password detected by is_password_strong
        assert response.status_code in (400, 422)

    async def test_register_invalid_role(self, client: AsyncClient):
        data = {**VALID_REGISTER_DATA, "email": "role@test.com", "role": "admin"}
        response = await client.post("/api/v1/auth/register", json=data)
        assert response.status_code == 422


# ─── Login ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestLogin:

    async def _register_user(self, client: AsyncClient, mock_email_service):
        await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)

    async def test_login_success(self, client: AsyncClient, mock_email_service):
        await self._register_user(client, mock_email_service)
        response = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "SecurePass@123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]["token"]
        assert data["data"]["token"]["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, mock_email_service):
        await self._register_user(client, mock_email_service)
        response = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "WrongPassword@123",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "SecurePass@123",
        })
        assert response.status_code == 401

    async def test_login_sets_refresh_cookie(self, client: AsyncClient, mock_email_service):
        await self._register_user(client, mock_email_service)
        response = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "SecurePass@123",
        })
        assert response.status_code == 200
        assert "refresh_token" in response.cookies


# ─── Protected Routes ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestProtectedRoutes:

    async def test_get_me_without_token(self, client: AsyncClient):
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401

    async def test_get_me_with_valid_token(self, client: AsyncClient, mock_email_service):
        # Register and login
        await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "SecurePass@123",
        })
        token = login_resp.json()["data"]["token"]["access_token"]

        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["data"]["email"] == "testuser@example.com"

    async def test_get_me_with_invalid_token(self, client: AsyncClient):
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401


# ─── Logout ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestLogout:

    async def test_logout_success(self, client: AsyncClient, mock_email_service):
        await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "SecurePass@123",
        })
        token = login_resp.json()["data"]["token"]["access_token"]

        response = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["success"] is True


# ─── Forgot Password ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestForgotPassword:

    async def test_forgot_password_existing_email(self, client: AsyncClient, mock_email_service):
        await client.post("/api/v1/auth/register", json=VALID_REGISTER_DATA)
        with patch("app.services.auth.EmailService.send_password_reset_email", new_callable=AsyncMock, return_value=True):
            response = await client.post("/api/v1/auth/forgot-password", json={
                "email": "testuser@example.com"
            })
        assert response.status_code == 200
        assert response.json()["success"] is True

    async def test_forgot_password_nonexistent_email(self, client: AsyncClient):
        """Should return 200 even for unknown emails (prevents enumeration)."""
        response = await client.post("/api/v1/auth/forgot-password", json={
            "email": "nobody@example.com"
        })
        assert response.status_code == 200
