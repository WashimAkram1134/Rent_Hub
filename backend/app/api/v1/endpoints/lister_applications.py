"""
RentHub — Lister Application & Verification API Endpoints

Handles customer applications to become verified owners/listers on RentHub,
as well as Admin review, approval, and rejection workflows.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user, require_role
from app.database.session import get_db
from app.models.lister_application import ListerApplication, ListerApplicationStatus
from app.models.notification import Notification
from app.models.user import Role, User

router = APIRouter(tags=["Lister Applications"])


# ─── Pydantic Schemas ──────────────────────────────────────────────────────────

class ListerApplyIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    business_name: Optional[str] = None
    address_line: str
    city: str = "Dhaka"
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Bangladesh"
    id_type: str = "National ID (NID)"
    id_number: str
    id_front_url: Optional[str] = None
    id_back_url: Optional[str] = None
    experience_bio: Optional[str] = None
    categories_intended: Optional[list[str] | str] = None
    agreed_terms: bool = True


class ListerRejectIn(BaseModel):
    reason: str
    admin_notes: Optional[str] = None


class ListerApproveIn(BaseModel):
    admin_notes: Optional[str] = None


# ─── Endpoints: User Flow ──────────────────────────────────────────────────────

@router.get("/my-status")
async def get_my_lister_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Get current user's lister application status, approval details, or rejection notes.
    """
    is_owner = any(r.name in ["owner", "admin"] for r in current_user.roles)

    stmt = select(ListerApplication).where(
        ListerApplication.user_id == current_user.id,
        ListerApplication.deleted_at.is_(None),
    ).order_by(ListerApplication.created_at.desc())
    result = await db.execute(stmt)
    application = result.scalars().first()

    status_str = "none"
    if is_owner:
        status_str = "approved"
    elif application:
        status_str = application.status.lower()

    app_data = None
    if application:
        categories = application.categories_intended
        if isinstance(categories, str):
            try:
                categories = json.loads(categories)
            except Exception:
                categories = [c.strip() for c in categories.split(",") if c.strip()]

        app_data = {
            "id": str(application.id),
            "full_name": application.full_name,
            "email": application.email,
            "phone": application.phone,
            "business_name": application.business_name,
            "address_line": application.address_line,
            "city": application.city,
            "state": application.state,
            "postal_code": application.postal_code,
            "country": application.country,
            "id_type": application.id_type,
            "id_number": application.id_number,
            "id_front_url": application.id_front_url,
            "id_back_url": application.id_back_url,
            "experience_bio": application.experience_bio,
            "categories_intended": categories or [],
            "agreed_terms": application.agreed_terms,
            "status": application.status,
            "rejection_reason": application.rejection_reason,
            "created_at": application.created_at.isoformat() if application.created_at else None,
            "reviewed_at": application.reviewed_at.isoformat() if application.reviewed_at else None,
        }

    return {
        "is_owner": is_owner,
        "is_customer": True,
        "lister_status": status_str,
        "application": app_data,
    }


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def submit_lister_application(
    payload: ListerApplyIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Submit or update a Lister application for the logged-in customer.
    """
    # If already owner
    if any(r.name in ["owner", "admin"] for r in current_user.roles):
        return {
            "success": True,
            "message": "You are already an approved RentHub Owner.",
            "status": "approved",
            "is_owner": True,
        }

    # Format categories
    cat_str = ""
    if isinstance(payload.categories_intended, list):
        cat_str = json.dumps(payload.categories_intended)
    elif isinstance(payload.categories_intended, str):
        cat_str = payload.categories_intended

    # Check for existing application
    stmt = select(ListerApplication).where(
        ListerApplication.user_id == current_user.id,
        ListerApplication.deleted_at.is_(None),
    )
    result = await db.execute(stmt)
    application = result.scalars().first()

    if application:
        # Update existing application and reset status to PENDING
        application.full_name = payload.full_name
        application.email = payload.email
        application.phone = payload.phone
        application.business_name = payload.business_name
        application.address_line = payload.address_line
        application.city = payload.city
        application.state = payload.state
        application.postal_code = payload.postal_code
        application.country = payload.country
        application.id_type = payload.id_type
        application.id_number = payload.id_number
        if payload.id_front_url:
            application.id_front_url = payload.id_front_url
        if payload.id_back_url:
            application.id_back_url = payload.id_back_url
        application.experience_bio = payload.experience_bio
        application.categories_intended = cat_str
        application.agreed_terms = payload.agreed_terms
        application.status = ListerApplicationStatus.PENDING.value
        application.rejection_reason = None
        application.reviewed_by = None
        application.reviewed_at = None
        application.updated_at = datetime.utcnow()
    else:
        # Create new application
        application = ListerApplication(
            user_id=current_user.id,
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            business_name=payload.business_name,
            address_line=payload.address_line,
            city=payload.city,
            state=payload.state,
            postal_code=payload.postal_code,
            country=payload.country,
            id_type=payload.id_type,
            id_number=payload.id_number,
            id_front_url=payload.id_front_url,
            id_back_url=payload.id_back_url,
            experience_bio=payload.experience_bio,
            categories_intended=cat_str,
            agreed_terms=payload.agreed_terms,
            status=ListerApplicationStatus.PENDING.value,
        )
        db.add(application)

    # In-app notification for applicant
    notif = Notification(
        user_id=current_user.id,
        title="Lister Application Submitted ⏳",
        body="Your application to become a RentHub Lister has been received and is under review by our verification team.",
        type="lister_application",
        is_read=False,
    )
    db.add(notif)

    await db.commit()
    await db.refresh(application)

    return {
        "success": True,
        "message": "Lister application submitted successfully. Verification is in progress.",
        "status": "pending",
        "application_id": str(application.id),
    }


# ─── Endpoints: Admin Verification & Management Flow ─────────────────────────

@router.get("/admin/list")
async def list_lister_applications_admin(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    List all lister applications for Admin review.
    """
    stmt = (
        select(ListerApplication)
        .options(selectinload(ListerApplication.user))
        .where(ListerApplication.deleted_at.is_(None))
    )

    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(ListerApplication.status == status_filter.upper())

    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                ListerApplication.full_name.ilike(term),
                ListerApplication.email.ilike(term),
                ListerApplication.phone.ilike(term),
                ListerApplication.city.ilike(term),
                ListerApplication.id_number.ilike(term),
            )
        )

    # Count query
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    # Summary counts
    pending_count = (await db.execute(
        select(func.count()).select_from(ListerApplication).where(
            ListerApplication.status == ListerApplicationStatus.PENDING.value,
            ListerApplication.deleted_at.is_(None)
        )
    )).scalar() or 0

    approved_count = (await db.execute(
        select(func.count()).select_from(ListerApplication).where(
            ListerApplication.status == ListerApplicationStatus.APPROVED.value,
            ListerApplication.deleted_at.is_(None)
        )
    )).scalar() or 0

    rejected_count = (await db.execute(
        select(func.count()).select_from(ListerApplication).where(
            ListerApplication.status == ListerApplicationStatus.REJECTED.value,
            ListerApplication.deleted_at.is_(None)
        )
    )).scalar() or 0

    # Pagination
    stmt = stmt.order_by(
        desc(ListerApplication.status == "PENDING"),
        desc(ListerApplication.created_at)
    ).offset((page - 1) * limit).limit(limit)

    results = (await db.execute(stmt)).scalars().all()

    items = []
    for app in results:
        cats = app.categories_intended
        if isinstance(cats, str):
            try:
                cats = json.loads(cats)
            except Exception:
                cats = [c.strip() for c in cats.split(",") if c.strip()]

        user_info = None
        if app.user:
            user_info = {
                "id": str(app.user.id),
                "full_name": app.user.full_name,
                "email": app.user.email,
                "avatar_url": app.user.avatar_url,
                "created_at": app.user.created_at.isoformat() if app.user.created_at else None,
                "role_names": [r.name for r in app.user.roles] if app.user.roles else ["customer"],
            }

        items.append({
            "id": str(app.id),
            "user_id": str(app.user_id),
            "full_name": app.full_name,
            "email": app.email,
            "phone": app.phone,
            "business_name": app.business_name,
            "address_line": app.address_line,
            "city": app.city,
            "state": app.state,
            "postal_code": app.postal_code,
            "country": app.country,
            "id_type": app.id_type,
            "id_number": app.id_number,
            "id_front_url": app.id_front_url,
            "id_back_url": app.id_back_url,
            "experience_bio": app.experience_bio,
            "categories_intended": cats or [],
            "status": app.status,
            "rejection_reason": app.rejection_reason,
            "admin_notes": app.admin_notes,
            "created_at": app.created_at.isoformat() if app.created_at else None,
            "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
            "user": user_info,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "metrics": {
            "total_applications": total,
            "pending_count": pending_count,
            "approved_count": approved_count,
            "rejected_count": rejected_count,
        },
    }


@router.get("/admin/{application_id}")
async def get_lister_application_detail(
    application_id: uuid.UUID,
    _: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Get detailed information about a single lister application for Admin review.
    """
    stmt = (
        select(ListerApplication)
        .options(selectinload(ListerApplication.user), selectinload(ListerApplication.reviewer))
        .where(ListerApplication.id == application_id, ListerApplication.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    app = result.scalars().first()

    if not app:
        raise HTTPException(status_code=404, detail="Lister application not found.")

    cats = app.categories_intended
    if isinstance(cats, str):
        try:
            cats = json.loads(cats)
        except Exception:
            cats = [c.strip() for c in cats.split(",") if c.strip()]

    user_info = None
    if app.user:
        user_info = {
            "id": str(app.user.id),
            "full_name": app.user.full_name,
            "email": app.user.email,
            "avatar_url": app.user.avatar_url,
            "created_at": app.user.created_at.isoformat() if app.user.created_at else None,
            "role_names": [r.name for r in app.user.roles] if app.user.roles else ["customer"],
        }

    return {
        "id": str(app.id),
        "user_id": str(app.user_id),
        "full_name": app.full_name,
        "email": app.email,
        "phone": app.phone,
        "business_name": app.business_name,
        "address_line": app.address_line,
        "city": app.city,
        "state": app.state,
        "postal_code": app.postal_code,
        "country": app.country,
        "id_type": app.id_type,
        "id_number": app.id_number,
        "id_front_url": app.id_front_url,
        "id_back_url": app.id_back_url,
        "experience_bio": app.experience_bio,
        "categories_intended": cats or [],
        "agreed_terms": app.agreed_terms,
        "status": app.status,
        "rejection_reason": app.rejection_reason,
        "admin_notes": app.admin_notes,
        "created_at": app.created_at.isoformat() if app.created_at else None,
        "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
        "user": user_info,
    }


@router.post("/admin/{application_id}/approve")
async def approve_lister_application(
    application_id: uuid.UUID,
    payload: Optional[ListerApproveIn] = None,
    current_admin: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Approve lister application:
    1. Update application status to APPROVED
    2. Add 'owner' role to user.roles (preserving 'customer' role)
    3. Mark user identity_verification_status = 'VERIFIED'
    4. Send celebratory notification to user
    """
    stmt = (
        select(ListerApplication)
        .options(selectinload(ListerApplication.user).selectinload(User.roles))
        .where(ListerApplication.id == application_id, ListerApplication.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    app = result.scalars().first()

    if not app:
        raise HTTPException(status_code=404, detail="Lister application not found.")

    # 1. Update application
    app.status = ListerApplicationStatus.APPROVED.value
    app.reviewed_by = current_admin.id
    app.reviewed_at = datetime.utcnow()
    if payload and payload.admin_notes:
        app.admin_notes = payload.admin_notes
    app.updated_at = datetime.utcnow()

    # 2. Add 'owner' role to the user if not already present
    applicant = app.user
    if applicant:
        # Find or create owner role
        role_stmt = select(Role).where(Role.name == "owner")
        role_res = await db.execute(role_stmt)
        owner_role = role_res.scalars().first()
        if not owner_role:
            owner_role = Role(name="owner", description="Item owner / lister on RentHub")
            db.add(owner_role)
            await db.flush()

        existing_role_names = [r.name for r in applicant.roles]
        if "owner" not in existing_role_names:
            applicant.roles.append(owner_role)

        applicant.identity_verification_status = "VERIFIED"

        # 3. Create celebratory notification
        notif = Notification(
            user_id=applicant.id,
            title="🎉 Congratulations! Your Lister Application is Approved",
            body="You are now a verified RentHub Owner! You can switch to Owner Mode at any time from your profile or menu to list products, view booking requests, and manage earnings.",
            type="lister_approved",
            is_read=False,
        )
        db.add(notif)

    await db.commit()

    return {
        "success": True,
        "message": f"Application for {app.full_name} has been approved. Owner features are now enabled.",
        "status": "APPROVED",
        "user_id": str(app.user_id),
    }


@router.post("/admin/{application_id}/reject")
async def reject_lister_application(
    application_id: uuid.UUID,
    payload: ListerRejectIn,
    current_admin: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Reject lister application:
    1. Update application status to REJECTED with reason
    2. Customer retains standard customer account
    3. Send notification with actionable feedback
    """
    stmt = (
        select(ListerApplication)
        .options(selectinload(ListerApplication.user))
        .where(ListerApplication.id == application_id, ListerApplication.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    app = result.scalars().first()

    if not app:
        raise HTTPException(status_code=404, detail="Lister application not found.")

    app.status = ListerApplicationStatus.REJECTED.value
    app.rejection_reason = payload.reason
    app.admin_notes = payload.admin_notes
    app.reviewed_by = current_admin.id
    app.reviewed_at = datetime.utcnow()
    app.updated_at = datetime.utcnow()

    applicant = app.user
    if applicant:
        notif = Notification(
            user_id=applicant.id,
            title="Lister Application Update: Revision Required",
            body=f"Your Lister Application requires updates: {payload.reason}. You can update your details and reapply at any time.",
            type="lister_rejected",
            is_read=False,
        )
        db.add(notif)

    await db.commit()

    return {
        "success": True,
        "message": f"Application for {app.full_name} has been rejected.",
        "status": "REJECTED",
        "reason": payload.reason,
    }
