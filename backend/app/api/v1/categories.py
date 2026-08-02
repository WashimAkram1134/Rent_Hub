"""
RentHub — Categories API Router (Module 4)

Endpoints:
  GET    /api/v1/categories              → List categories (Public)
  GET    /api/v1/categories/{identifier} → Get by ID or slug (Public)
  POST   /api/v1/categories              → Create (Admin)
  PUT    /api/v1/categories/{id}         → Update (Admin)
  DELETE /api/v1/categories/{id}         → Delete (Admin)
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user_optional, require_role
from app.database.session import get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


def get_svc(db: AsyncSession = Depends(get_db)) -> CategoryService:
    return CategoryService(db)


@router.get("", response_model=list[CategoryResponse], summary="List categories")
async def list_categories(
    include_inactive: bool = False,
    current_user: User | None = Depends(get_current_user_optional),
    svc: CategoryService = Depends(get_svc),
):
    """List all active categories with product counts. Admins can include inactive."""
    is_admin = current_user and current_user.primary_role == "admin"
    return await svc.get_all(include_inactive=include_inactive and bool(is_admin))


@router.get("/{identifier}", response_model=CategoryResponse, summary="Get category by ID or slug")
async def get_category(
    identifier: str,
    svc: CategoryService = Depends(get_svc),
):
    return await svc.get_by_id_or_slug(identifier)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create category (Admin)",
    dependencies=[Depends(require_role("admin"))],
)
async def create_category(data: CategoryCreate, svc: CategoryService = Depends(get_svc)):
    return await svc.create(data)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update category (Admin)",
    dependencies=[Depends(require_role("admin"))],
)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    svc: CategoryService = Depends(get_svc),
):
    return await svc.update(category_id, data)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete category (Admin)",
    dependencies=[Depends(require_role("admin"))],
)
async def delete_category(category_id: uuid.UUID, svc: CategoryService = Depends(get_svc)):
    await svc.delete(category_id)
