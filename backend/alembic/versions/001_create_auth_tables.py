"""Create auth tables and seed roles/permissions

Revision ID: 001
Revises: 
Create Date: 2026-07-22

Tables created:
  roles, permissions, role_permissions,
  users, user_roles, refresh_tokens
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ─── Enable pgcrypto for gen_random_uuid() ────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ─── roles ───────────────────────────────────────────────────────────────
    op.create_table(
        "roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_roles_name", "roles", ["name"], unique=True)

    # ─── permissions ─────────────────────────────────────────────────────────
    op.create_table(
        "permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("resource", sa.String(50), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_permissions_name", "permissions", ["name"], unique=True)
    op.create_unique_constraint("uq_permission_resource_action", "permissions", ["resource", "action"])

    # ─── role_permissions (M2M) ───────────────────────────────────────────────
    op.create_table(
        "role_permissions",
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    )

    # ─── users ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("avatar_url", sa.Text, nullable=True),
        sa.Column("is_email_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_identity_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("email_verification_token", sa.String(255), nullable=True),
        sa.Column("email_verification_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_reset_token", sa.String(255), nullable=True),
        sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_is_active", "users", ["is_active"])
    op.create_index("ix_users_email_active", "users", ["email", "is_active"])
    op.create_index("ix_users_deleted_at", "users", ["deleted_at"])
    op.create_index("ix_users_password_reset_token", "users", ["password_reset_token"])

    # ─── user_roles (M2M) ────────────────────────────────────────────────────
    op.create_table(
        "user_roles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ─── refresh_tokens ───────────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_revoked", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("ip_address", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)

    # ─── Seed: Roles ──────────────────────────────────────────────────────────
    now = datetime.now(timezone.utc).replace(tzinfo=None)  # naive UTC for TIMESTAMP WITHOUT TIME ZONE

    roles_table = sa.table(
        "roles",
        sa.column("id", postgresql.UUID()),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )

    role_ids = {
        "guest":    str(uuid.uuid4()),
        "customer": str(uuid.uuid4()),
        "owner":    str(uuid.uuid4()),
        "admin":    str(uuid.uuid4()),
    }

    op.bulk_insert(roles_table, [
        {"id": role_ids["guest"],    "name": "guest",    "description": "Anonymous visitor",        "created_at": now, "updated_at": now},
        {"id": role_ids["customer"], "name": "customer", "description": "Can browse and rent items", "created_at": now, "updated_at": now},
        {"id": role_ids["owner"],    "name": "owner",    "description": "Can list and manage items", "created_at": now, "updated_at": now},
        {"id": role_ids["admin"],    "name": "admin",    "description": "Full platform access",      "created_at": now, "updated_at": now},
    ])

    # ─── Seed: Permissions ────────────────────────────────────────────────────
    permissions_table = sa.table(
        "permissions",
        sa.column("id", postgresql.UUID()),
        sa.column("name", sa.String()),
        sa.column("resource", sa.String()),
        sa.column("action", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )

    permission_definitions = [
        ("product:read",    "product",  "read"),
        ("product:create",  "product",  "create"),
        ("product:update",  "product",  "update"),
        ("product:delete",  "product",  "delete"),
        ("product:approve", "product",  "approve"),
        ("booking:create",  "booking",  "create"),
        ("booking:read",    "booking",  "read"),
        ("booking:manage",  "booking",  "manage"),
        ("booking:approve", "booking",  "approve"),
        ("payment:read",    "payment",  "read"),
        ("payment:refund",  "payment",  "refund"),
        ("user:read",       "user",     "read"),
        ("user:manage",     "user",     "manage"),
        ("user:ban",        "user",     "ban"),
        ("review:create",   "review",   "create"),
        ("review:delete",   "review",   "delete"),
        ("admin:access",    "admin",    "access"),
        ("analytics:read",  "analytics","read"),
    ]

    perm_ids: dict[str, str] = {}
    perm_rows = []
    for name, resource, action in permission_definitions:
        pid = str(uuid.uuid4())
        perm_ids[name] = pid
        perm_rows.append({
            "id": pid, "name": name, "resource": resource, "action": action,
            "description": f"Allow {action} on {resource}",
            "created_at": now, "updated_at": now,
        })
    op.bulk_insert(permissions_table, perm_rows)

    # ─── Seed: Role ↔ Permission Assignments ──────────────────────────────────
    rp_table = sa.table(
        "role_permissions",
        sa.column("role_id", postgresql.UUID()),
        sa.column("permission_id", postgresql.UUID()),
    )

    role_permission_map = {
        "guest":    ["product:read"],
        "customer": ["product:read", "booking:create", "booking:read", "payment:read", "review:create"],
        "owner":    ["product:read", "product:create", "product:update", "product:delete",
                     "booking:read", "booking:approve", "booking:manage", "payment:read", "review:create"],
        "admin":    list(perm_ids.keys()),  # All permissions
    }

    rp_rows = []
    for role_name, perms in role_permission_map.items():
        for perm_name in perms:
            rp_rows.append({
                "role_id": role_ids[role_name],
                "permission_id": perm_ids[perm_name],
            })
    op.bulk_insert(rp_table, rp_rows)


def downgrade() -> None:
    op.drop_table("refresh_tokens")
    op.drop_table("user_roles")
    op.drop_table("users")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")
