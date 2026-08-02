"""
Alembic Migration Environment

Configured for async SQLAlchemy 2.0 (asyncpg driver).

Autogenerate compares the current database schema against all SQLAlchemy
models imported via `app.database.base`. As new models are added in each
module, import them here so Alembic can detect changes.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ─── Load app config ─────────────────────────────────────────────────────────
# Import settings before anything else so .env is loaded
from app.core.config import settings
from app.database.base import Base  # noqa: F401

# ─── Import all models here for autogenerate ─────────────────────────────────
# Add new model imports here as each module is built.
from app.models.user import Permission, RefreshToken, Role, User  # noqa: F401
from app.models.address import Address  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.product import Product, ProductImage, Favorite  # noqa: F401
from app.models.booking import Booking, Review, Dispute  # noqa: F401
from app.models.cms import HeroBanner, Promotion, City  # noqa: F401
# ─────────────────────────────────────────────────────────────────────────────

config = context.config

# Async URL for online migrations (asyncpg driver)
# Use direct connection for migrations if available (required for Supabase — pooler doesn't support DDL)
_migration_url = settings.DIRECT_DATABASE_URL or settings.DATABASE_URL
ASYNC_DATABASE_URL = _migration_url  # asyncpg URL for online migration
# Sync URL for offline SQL generation (psycopg2 driver)
SYNC_DATABASE_URL = _migration_url.replace("+asyncpg", "+psycopg2")

# Set the sync URL as the main option (used by offline mode and alembic.ini)
# Note: configparser uses % for interpolation — escape all % as %% to avoid ValueError
config.set_main_option("sqlalchemy.url", SYNC_DATABASE_URL.replace("%", "%%"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL script, no DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using the async engine (online mode)."""
    from sqlalchemy.ext.asyncio import create_async_engine

    connectable = create_async_engine(ASYNC_DATABASE_URL, poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to DB directly)."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
