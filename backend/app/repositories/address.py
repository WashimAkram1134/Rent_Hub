"""
RentHub — Address Repository
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address


class AddressRepository:

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all_for_user(self, user_id: uuid.UUID) -> list[Address]:
        result = await self.db.execute(
            select(Address)
            .where(Address.user_id == user_id)
            .order_by(Address.is_default.desc(), Address.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, address_id: uuid.UUID, user_id: uuid.UUID) -> Address | None:
        result = await self.db.execute(
            select(Address).where(Address.id == address_id, Address.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: uuid.UUID, data: dict) -> Address:
        """Create a new address. If is_default=True, clear other defaults first."""
        if data.get("is_default"):
            await self._clear_default(user_id)

        address = Address(user_id=user_id, **data)
        self.db.add(address)
        await self.db.flush()
        await self.db.refresh(address)
        return address

    async def update(self, address: Address, data: dict) -> Address:
        """Update address fields. If is_default=True, clear other defaults first."""
        if data.get("is_default"):
            await self._clear_default(address.user_id)

        for key, value in data.items():
            if value is not None:
                setattr(address, key, value)

        await self.db.flush()
        await self.db.refresh(address)
        return address

    async def set_default(self, address: Address) -> Address:
        await self._clear_default(address.user_id)
        address.is_default = True
        await self.db.flush()
        return address

    async def delete(self, address: Address) -> None:
        await self.db.delete(address)
        await self.db.flush()

    async def _clear_default(self, user_id: uuid.UUID) -> None:
        """Remove is_default flag from all addresses for this user."""
        result = await self.db.execute(
            select(Address).where(Address.user_id == user_id, Address.is_default.is_(True))
        )
        for addr in result.scalars().all():
            addr.is_default = False
        await self.db.flush()
