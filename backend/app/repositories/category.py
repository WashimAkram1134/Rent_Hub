from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Category)

    async def get_by_slug(self, slug: str) -> Category | None:
        """Get a category by its slug."""
        stmt = select(Category).where(Category.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_all_active(self) -> Sequence[Category]:
        """Get all active categories ordered by sort_order."""
        stmt = (
            select(Category)
            .where(Category.is_active.is_(True))
            .order_by(Category.sort_order.asc(), Category.name.asc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_all_admin(self) -> Sequence[Category]:
        """Get all categories including inactive ones (for admin)."""
        stmt = (
            select(Category)
            .order_by(Category.sort_order.asc(), Category.name.asc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
