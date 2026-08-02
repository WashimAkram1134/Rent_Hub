"""
RentHub Backend — FastAPI Application Entry Point (Updated Rate Limits)

Lifespan:
- Startup: initialise DB engine, Redis pool, logging
- Shutdown: dispose DB engine, close Redis pool

Middleware (order matters — applied bottom-up):
1. CORS
2. RequestIDMiddleware (outermost — traces all requests)
3. RateLimitMiddleware

Routers:
- /api/v1/health
- (more added per module)
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import auth, health, users, categories
from app.core.config import settings
from app.core.constants import API_DESCRIPTION, API_TITLE, API_V1_PREFIX
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.database.redis import close_redis_pool, get_redis_pool
from app.database.session import dispose_db
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware

# Configure structured logging before anything else
configure_logging()
logger = get_logger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle."""

    # ── Startup ────────────────────────────────────────────────────────────
    logger.info(
        "renthub_starting",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )

    # Warm up Redis connection pool
    await get_redis_pool()
    logger.info("redis_connected")

    logger.info("renthub_ready", port=settings.APP_PORT)

    yield  # Application runs here

    # ── Shutdown ───────────────────────────────────────────────────────────
    logger.info("renthub_shutting_down")
    await dispose_db()
    await close_redis_pool()
    logger.info("renthub_stopped")


# ─── App Factory ──────────────────────────────────────────────────────────────

def create_application() -> FastAPI:
    """
    Application factory.

    Separating creation from the module-level `app` variable makes the app
    easily testable (create a fresh instance per test).
    """

    _app = FastAPI(
        title=API_TITLE,
        description=API_DESCRIPTION,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        # Disable Swagger/ReDoc in production
        docs_url="/docs" if settings.openapi_enabled else None,
        redoc_url="/redoc" if settings.openapi_enabled else None,
        openapi_url="/openapi.json" if settings.openapi_enabled else None,
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Custom Middleware ──────────────────────────────────────────────────
    _app.add_middleware(RateLimitMiddleware)
    _app.add_middleware(RequestIDMiddleware)

    # ── Exception Handlers ────────────────────────────────────────────────
    register_exception_handlers(_app)

    # ── Static Files ──────────────────────────────────────────────────────
    uploads_dir = Path(settings.LOCAL_STORAGE_PATH)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    _app.mount("/uploads", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="uploads")

    # ── Routers ───────────────────────────────────────────────────────────
    from app.api.v1.endpoints import cms, products, bookings, analytics, upload, payments
    
    _app.include_router(health.router, prefix=API_V1_PREFIX)
    _app.include_router(auth.router, prefix=API_V1_PREFIX)
    _app.include_router(users.router, prefix=API_V1_PREFIX)
    _app.include_router(categories.router, prefix=API_V1_PREFIX)
    _app.include_router(cms.router, prefix=f"{API_V1_PREFIX}/cms")
    _app.include_router(products.router, prefix=f"{API_V1_PREFIX}/products")
    _app.include_router(bookings.router, prefix=f"{API_V1_PREFIX}/bookings")
    _app.include_router(payments.router, prefix=f"{API_V1_PREFIX}/payments")
    _app.include_router(analytics.router, prefix=f"{API_V1_PREFIX}/analytics")
    _app.include_router(upload.router, prefix=f"{API_V1_PREFIX}/upload")

    return _app


# Module-level app instance used by uvicorn
app = create_application()
