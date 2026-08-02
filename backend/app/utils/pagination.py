"""
RentHub Backend — Pagination Utilities

Provides PageParams (query parameters) and PagedResponse (response schema)
that are used consistently across all list endpoints.
"""

from __future__ import annotations

import math
from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel, computed_field

from app.core.config import settings

T = TypeVar("T")


# ─── Request Parameters ──────────────────────────────────────────────────────

class PageParams:
    """
    FastAPI-injectable pagination query parameters.

    Usage in a router:
        async def list_products(
            params: PageParams = Depends(),
            db: AsyncSession = Depends(get_db),
        ):
            items, total = await repo.list(
                skip=params.offset,
                limit=params.limit,
            )
            return PagedResponse.create(items, total, params)
    """

    def __init__(
        self,
        page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
        page_size: int = Query(
            default=settings.DEFAULT_PAGE_SIZE,
            ge=1,
            le=settings.MAX_PAGE_SIZE,
            description=f"Results per page (max {settings.MAX_PAGE_SIZE})",
        ),
    ) -> None:
        self.page = page
        self.page_size = page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


# ─── Response Schema ─────────────────────────────────────────────────────────

class PaginationMeta(BaseModel):
    """Pagination metadata included in every list response."""

    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PagedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response envelope.

    Example JSON:
    {
      "success": true,
      "data": [...],
      "pagination": {
        "page": 1,
        "page_size": 20,
        "total_items": 100,
        "total_pages": 5,
        "has_next": true,
        "has_prev": false
      }
    }
    """

    success: bool = True
    data: list[T]
    pagination: PaginationMeta

    @classmethod
    def create(
        cls,
        items: list[T],
        total: int,
        params: PageParams,
    ) -> "PagedResponse[T]":
        total_pages = math.ceil(total / params.page_size) if total > 0 else 1
        return cls(
            data=items,
            pagination=PaginationMeta(
                page=params.page,
                page_size=params.page_size,
                total_items=total,
                total_pages=total_pages,
                has_next=params.page < total_pages,
                has_prev=params.page > 1,
            ),
        )
