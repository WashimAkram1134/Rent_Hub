"""
RentHub — Users API Router (Module 3)

Endpoints:
  GET    /api/v1/users/me                        → get my profile
  PATCH  /api/v1/users/me                        → update profile
  POST   /api/v1/users/me/avatar                 → upload avatar
  POST   /api/v1/users/me/change-password        → change password

  GET    /api/v1/users/me/addresses              → list my addresses
  POST   /api/v1/users/me/addresses              → add address
  GET    /api/v1/users/me/addresses/{id}         → get address
  PUT    /api/v1/users/me/addresses/{id}         → update address
  DELETE /api/v1/users/me/addresses/{id}         → delete address
  POST   /api/v1/users/me/addresses/{id}/default → set as default
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.address import AddressRepository
from app.schemas.auth import UserResponse
from app.schemas.user import (
    AddressCreateRequest,
    AddressResponse,
    AddressUpdateRequest,
    AvatarResponse,
    ChangePasswordRequest,
    ProfileUpdateRequest,
)
from app.services.user import UserService
from app.utils.response import success

router = APIRouter(prefix="/users", tags=["Users"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


def get_address_repo(db: AsyncSession = Depends(get_db)) -> AddressRepository:
    return AddressRepository(db)


# ─── Profile ──────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse, summary="Get my profile")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse, summary="Update my profile")
async def update_me(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    svc: UserService = Depends(get_user_service),
):
    user = await svc.update_profile(current_user, data)
    return user


@router.post(
    "/me/avatar",
    response_model=AvatarResponse,
    summary="Upload profile avatar",
)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    svc: UserService = Depends(get_user_service),
):
    url = await svc.upload_avatar(current_user, file)
    return AvatarResponse(avatar_url=url)


@router.post("/me/change-password", summary="Change password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    svc: UserService = Depends(get_user_service),
):
    await svc.change_password(current_user, data.current_password, data.new_password)
    return success(message="Password changed successfully.")


# ─── Addresses ────────────────────────────────────────────────────────────────

@router.get(
    "/me/addresses",
    response_model=list[AddressResponse],
    summary="List my addresses",
)
async def list_addresses(
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    return await repo.get_all_for_user(current_user.id)


@router.post(
    "/me/addresses",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new address",
)
async def create_address(
    data: AddressCreateRequest,
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    address = await repo.create(current_user.id, data.model_dump())
    return address


@router.get(
    "/me/addresses/{address_id}",
    response_model=AddressResponse,
    summary="Get a specific address",
)
async def get_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    address = await repo.get_by_id(address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found.")
    return address


@router.put(
    "/me/addresses/{address_id}",
    response_model=AddressResponse,
    summary="Update an address",
)
async def update_address(
    address_id: uuid.UUID,
    data: AddressUpdateRequest,
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    address = await repo.get_by_id(address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found.")
    updated = await repo.update(address, data.model_dump(exclude_none=True))
    return updated


@router.delete(
    "/me/addresses/{address_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an address",
)
async def delete_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    address = await repo.get_by_id(address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found.")
    await repo.delete(address)


@router.post(
    "/me/addresses/{address_id}/default",
    response_model=AddressResponse,
    summary="Set address as default",
)
async def set_default_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    repo: AddressRepository = Depends(get_address_repo),
):
    address = await repo.get_by_id(address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found.")
    updated = await repo.set_default(address)
    return updated
