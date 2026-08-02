"""
RentHub — Role Repository

Provides lookups for roles and permissions (primarily used for seeding and RBAC checks).
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import Permission, Role


class RoleRepository:

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_name(self, name: str) -> Role | None:
        result = await self.db.execute(
            select(Role)
            .where(Role.name == name)
            .options(selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_all_with_permissions(self) -> list[Role]:
        result = await self.db.execute(
            select(Role).options(selectinload(Role.permissions))
        )
        return list(result.scalars().all())

    async def get_permission_by_name(self, name: str) -> Permission | None:
        result = await self.db.execute(
            select(Permission).where(Permission.name == name)
        )
        return result.scalar_one_or_none()

    async def create_role(self, name: str, description: str = "") -> Role:
        role = Role(name=name, description=description)
        self.db.add(role)
        await self.db.flush()
        return role

    async def create_permission(
        self, name: str, resource: str, action: str, description: str = ""
    ) -> Permission:
        perm = Permission(
            name=name,
            resource=resource,
            action=action,
            description=description,
        )
        self.db.add(perm)
        await self.db.flush()
        return perm

    async def assign_permission_to_role(self, role: Role, permission: Permission) -> None:
        if permission not in role.permissions:
            role.permissions.append(permission)
            self.db.add(role)
            await self.db.flush()
