from __future__ import annotations

import re
from typing import Sequence
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.category import Category
from app.models.product import Product
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.category_repo = CategoryRepository(db)

    def _generate_slug(self, text: str) -> str:
        """Generate a URL-friendly slug from a string."""
        text = text.lower()
        text = re.sub(r"[^\w\s-]", "", text)
        text = re.sub(r"[\s_-]+", "-", text)
        text = text.strip("-")
        return text

    async def _ensure_unique_slug(self, slug: str, exclude_id: uuid.UUID | None = None) -> str:
        """Ensure slug is unique, append numbers if needed."""
        base_slug = slug
        counter = 1
        while True:
            existing = await self.category_repo.get_by_slug(slug)
            if not existing or (exclude_id and existing.id == exclude_id):
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    async def _get_product_counts(self) -> dict[uuid.UUID, int]:
        """Fetch product counts per category via a single GROUP BY query."""
        stmt = (
            select(Product.category_id, func.count(Product.id).label("cnt"))
            .where(Product.is_active.is_(True), Product.deleted_at.is_(None))
            .group_by(Product.category_id)
        )
        result = await self.db.execute(stmt)
        return {row.category_id: row.cnt for row in result}

    async def _enrich_with_counts(self, categories: Sequence[Category]) -> list[CategoryResponse]:
        """Attach product_count to each category."""
        counts = await self._get_product_counts()
        result = []
        for cat in categories:
            data = CategoryResponse.model_validate(cat)
            data.product_count = counts.get(cat.id, 0)
            result.append(data)
        return result

    async def get_all(self, include_inactive: bool = False) -> list[CategoryResponse]:
        if include_inactive:
            cats = await self.category_repo.get_all_admin()
        else:
            cats = await self.category_repo.get_all_active()
        return await self._enrich_with_counts(cats)

    async def get_by_id_or_slug(self, identifier: str) -> CategoryResponse:
        try:
            category_id = uuid.UUID(identifier)
            category = await self.category_repo.get_by_id(category_id)
        except ValueError:
            category = await self.category_repo.get_by_slug(identifier)

        if not category:
            raise NotFoundException("Category not found.")

        counts = await self._get_product_counts()
        data = CategoryResponse.model_validate(category)
        data.product_count = counts.get(category.id, 0)
        return data

    async def create(self, data: CategoryCreate) -> CategoryResponse:
        base_slug = self._generate_slug(data.name)
        slug = await self._ensure_unique_slug(base_slug)
        category = await self.category_repo.create(data, slug=slug)
        result = CategoryResponse.model_validate(category)
        result.product_count = 0
        return result

    async def update(self, category_id: uuid.UUID, data: CategoryUpdate) -> CategoryResponse:
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found.")

        update_data = data.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != category.name:
            base_slug = self._generate_slug(update_data["name"])
            update_data["slug"] = await self._ensure_unique_slug(base_slug, exclude_id=category_id)

        updated = await self.category_repo.update(category, data)
        counts = await self._get_product_counts()
        result = CategoryResponse.model_validate(updated)
        result.product_count = counts.get(updated.id, 0)
        return result

    async def delete(self, category_id: uuid.UUID) -> None:
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found.")
        await self.category_repo.delete(category)
