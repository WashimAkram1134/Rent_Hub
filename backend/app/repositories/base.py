"""
RentHub Backend — Generic Base Repository

Implements the Repository Pattern with SQLAlchemy 2.0 async sessions.

Features:
- Type-safe generics: BaseRepository[Model, CreateSchema, UpdateSchema]
- Standard CRUD: get, get_or_404, list (paginated), create, update, delete
- Soft delete support (uses deleted_at field when model has SoftDeleteMixin)
- Filter / sort / paginate helpers

Usage:
    class ProductRepository(BaseRepository[Product, ProductCreate, ProductUpdate]):
        def __init__(self, db: AsyncSession):
            super().__init__(db, Product)

        async def get_by_owner(self, owner_id: UUID) -> list[Product]:
            result = await self.db.execute(
                select(self.model).where(
                    Product.owner_id == owner_id,
                    Product.deleted_at.is_(None),
                )
            )
            return list(result.scalars().all())
"""

from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.database.base import Base, SoftDeleteMixin

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Generic async CRUD repository.

    Subclasses inject `db` and `model` and can add domain-specific methods.
    """

    def __init__(self, db: AsyncSession, model: type[ModelType]) -> None:
        self.db = db
        self.model = model

    # ─── Read ─────────────────────────────────────────────────────────────

    async def get(self, id: uuid.UUID) -> ModelType | None:
        """Return a record by primary key, or None if not found."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)  # type: ignore[attr-defined]
        )
        return result.scalar_one_or_none()

    async def get_or_404(self, id: uuid.UUID) -> ModelType:
        """Return a record by PK or raise NotFoundException."""
        obj = await self.get(id)
        if obj is None:
            raise NotFoundException(
                resource=self.model.__name__,
                resource_id=id,
            )
        return obj

    async def get_by(self, **kwargs: Any) -> ModelType | None:
        """Return first record matching all given keyword filters."""
        conditions = [
            getattr(self.model, key) == value
            for key, value in kwargs.items()
        ]
        result = await self.db.execute(
            select(self.model).where(*conditions)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        order_by: Any = None,
        filters: list[Any] | None = None,
        include_deleted: bool = False,
    ) -> tuple[list[ModelType], int]:
        """
        Return a paginated list and total count.

        Returns: (items, total_count)
        """
        query = select(self.model)

        # Soft delete filter
        if not include_deleted and issubclass(self.model, SoftDeleteMixin):
            query = query.where(self.model.deleted_at.is_(None))  # type: ignore[attr-defined]

        if filters:
            query = query.where(*filters)

        # Count query
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Paginated query
        if order_by is not None:
            query = query.order_by(order_by)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)

        return list(result.scalars().all()), total

    # ─── Write ────────────────────────────────────────────────────────────

    async def create(self, schema: CreateSchemaType, **extra_fields: Any) -> ModelType:
        """Create and persist a new record from a Pydantic schema."""
        data = schema.model_dump(exclude_unset=False)
        data.update(extra_fields)
        obj = self.model(**data)
        self.db.add(obj)
        await self.db.flush()  # Flush to get the generated ID without committing
        await self.db.refresh(obj)
        return obj

    async def update(
        self,
        obj: ModelType,
        schema: UpdateSchemaType,
    ) -> ModelType:
        """Update an existing record with non-null values from schema."""
        data = schema.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(obj, field, value)
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_fields(self, obj: ModelType, **kwargs: Any) -> ModelType:
        """Update specific fields on a model instance directly."""
        for key, value in kwargs.items():
            setattr(obj, key, value)
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        """
        Delete a record.

        If the model supports soft delete (SoftDeleteMixin), sets deleted_at.
        Otherwise, performs a hard delete.
        """
        if isinstance(obj, SoftDeleteMixin):
            obj.soft_delete()
            self.db.add(obj)
            await self.db.flush()
        else:
            await self.db.delete(obj)
            await self.db.flush()

    async def hard_delete(self, obj: ModelType) -> None:
        """Permanently remove a record regardless of soft delete support."""
        await self.db.delete(obj)
        await self.db.flush()

    async def exists(self, **kwargs: Any) -> bool:
        """Check if a record matching the given kwargs exists."""
        obj = await self.get_by(**kwargs)
        return obj is not None

    async def count(self, filters: list[Any] | None = None) -> int:
        """Return the total count of records (optionally filtered)."""
        query = select(func.count()).select_from(self.model)
        if filters:
            query = query.where(*filters)
        result = await self.db.execute(query)
        return result.scalar_one()
