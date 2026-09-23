"""
RentHub Backend — Keep-Alive Service

Prevents the Render free-tier service from going to sleep by periodically
pinging its own health endpoint.  Render puts free services to sleep after
~15 minutes of inactivity; a 10-minute self-ping interval is enough to keep
the service awake indefinitely.

Configuration
─────────────
Set SELF_PING_URL in your environment / Render dashboard to the full URL of
your deployed backend, e.g.:

    SELF_PING_URL=https://renthub-backend.onrender.com

When SELF_PING_URL is not set (local development) the task exits immediately
and does nothing.
"""

from __future__ import annotations

import asyncio

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# How often to ping (seconds).  10 min < Render's 15-min idle threshold.
_PING_INTERVAL_SECONDS: int = 10 * 60

_keep_alive_task: asyncio.Task | None = None


async def _ping_loop(url: str) -> None:
    """Infinite loop that GETs *url* every _PING_INTERVAL_SECONDS."""
    logger.info("keep_alive_started", url=url, interval_seconds=_PING_INTERVAL_SECONDS)
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            await asyncio.sleep(_PING_INTERVAL_SECONDS)
            try:
                response = await client.get(url)
                logger.info(
                    "keep_alive_ping",
                    status=response.status_code,
                    url=url,
                )
            except Exception as exc:  # noqa: BLE001
                # Non-fatal — log and keep going
                logger.warning("keep_alive_ping_failed", error=str(exc), url=url)


def start_keep_alive() -> None:
    """
    Schedules the ping loop as a background asyncio task.

    Call this inside the FastAPI lifespan startup block.
    Does nothing when SELF_PING_URL is not configured.
    """
    global _keep_alive_task  # noqa: PLW0603

    ping_url = getattr(settings, "SELF_PING_URL", "").strip()
    if not ping_url:
        logger.info(
            "keep_alive_disabled",
            reason="SELF_PING_URL not set — skipping (normal in local dev)",
        )
        return

    # Append the health path if the user gave a bare domain
    if not ping_url.endswith("/health"):
        ping_url = ping_url.rstrip("/") + "/api/v1/health"

    _keep_alive_task = asyncio.create_task(_ping_loop(ping_url), name="keep_alive")


async def stop_keep_alive() -> None:
    """
    Cancels the ping loop gracefully.

    Call this inside the FastAPI lifespan shutdown block.
    """
    global _keep_alive_task  # noqa: PLW0603

    if _keep_alive_task and not _keep_alive_task.done():
        _keep_alive_task.cancel()
        try:
            await _keep_alive_task
        except asyncio.CancelledError:
            pass
        logger.info("keep_alive_stopped")
    _keep_alive_task = None
