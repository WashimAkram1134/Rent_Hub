from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete

from app.database.session import get_db
from app.models.offer_campaign import OfferCampaign
from app.schemas.offer_campaign import (
    OfferCampaignGenerateRequest,
    OfferCampaignTweakRequest,
    OfferCampaignCreate,
    OfferCampaignUpdate,
    OfferCampaignOut,
    GenerateResponse,
)
from app.services.ai_offer_engine import AIOfferEngine

router = APIRouter()


def _format_discount_display(discount_type: str, discount_value: float) -> str:
    if discount_type == "PERCENTAGE":
        val_str = f"{int(discount_value)}" if discount_value.is_integer() else f"{discount_value:.1f}"
        return f"{val_str}% OFF"
    else:
        val_str = f"{int(discount_value):,}" if discount_value.is_integer() else f"{discount_value:,.2f}"
        return f"৳{val_str} OFF"


# ── AI Design Studio Endpoints ──────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
async def generate_offer_designs(payload: OfferCampaignGenerateRequest):
    """
    Generate 3 distinct RentHub design specifications based on business offer facts.
    Critical business facts (discount, code, dates) are locked into the output JSON.
    """
    discount_display = _format_discount_display(payload.discount_type, payload.discount_value)
    
    # Format validity string
    if payload.end_at:
        valid_until_str = payload.end_at.strftime("%d %B %Y")
    else:
        valid_until_str = "Limited Time Offer"

    context = AIOfferEngine.detect_context(
        payload.title,
        payload.description,
        payload.applicable_categories
    )

    variations = AIOfferEngine.generate_variations(
        title=payload.title,
        description=payload.description,
        discount_display=discount_display,
        promo_code=payload.promo_code.strip().upper(),
        valid_until=valid_until_str,
        categories=payload.applicable_categories,
        cta_text=payload.cta_text,
        cta_url=payload.cta_url,
        target_audience=payload.target_audience,
        placement=payload.placement,
        campaign_theme=payload.campaign_theme or context["season"],
        custom_image_url=payload.custom_image_url
    )

    locked_business_data = {
        "title": payload.title,
        "description": payload.description,
        "discount_type": payload.discount_type,
        "discount_value": payload.discount_value,
        "discount_display": discount_display,
        "promo_code": payload.promo_code.strip().upper(),
        "start_at": payload.start_at.isoformat() if payload.start_at else None,
        "end_at": payload.end_at.isoformat() if payload.end_at else None,
        "applicable_categories": payload.applicable_categories,
        "target_audience": payload.target_audience,
        "placement": payload.placement,
        "cta_text": payload.cta_text,
        "cta_url": payload.cta_url,
    }

    return GenerateResponse(
        campaign_theme=payload.campaign_theme or context["season"],
        detected_season=context["season"],
        primary_category=context["primary_category"],
        variations=variations,
        locked_business_data=locked_business_data
    )


@router.post("/tweak")
async def tweak_offer_design(payload: OfferCampaignTweakRequest):
    """
    Apply an AI quick action (e.g. 'make_more_premium', 'make_offer_prominent')
    to adjust layout, color treatment, and hierarchy without changing business values.
    """
    updated_spec = AIOfferEngine.apply_tweak(
        spec=payload.design_spec,
        action=payload.action,
        category=payload.category
    )
    return {"design_spec": updated_spec}


# ── Campaign Lifecycle & CRUD Endpoints ─────────────────────────────────────

@router.get("/campaigns", response_model=list[OfferCampaignOut])
async def list_campaigns(
    status_filter: Optional[str] = Query("all", alias="status"),
    search: Optional[str] = Query(None),
    placement: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    List all promotional campaigns with optional status, search, and placement filters.
    """
    now = datetime.now(timezone.utc)
    stmt = select(OfferCampaign).order_by(OfferCampaign.created_at.desc())
    clauses = []

    if status_filter and status_filter != "all":
        clauses.append(OfferCampaign.status == status_filter.upper())

    if placement and placement != "all":
        clauses.append(OfferCampaign.placement == placement)

    if search and search.strip():
        term = f"%{search.strip()}%"
        clauses.append(
            or_(
                OfferCampaign.title.ilike(term),
                OfferCampaign.promo_code.ilike(term),
                OfferCampaign.description.ilike(term)
            )
        )

    if clauses:
        stmt = stmt.where(*clauses)

    result = await db.execute(stmt)
    campaigns = result.scalars().all()

    # Auto-expire campaigns that passed end_at
    needs_commit = False
    for c in campaigns:
        if c.status in ["PUBLISHED", "SCHEDULED"] and c.end_at and c.end_at < now:
            c.status = "EXPIRED"
            needs_commit = True
        elif c.status == "SCHEDULED" and c.start_at and c.start_at <= now <= c.end_at:
            c.status = "PUBLISHED"
            needs_commit = True

    if needs_commit:
        await db.commit()

    return campaigns


@router.post("/campaigns", response_model=OfferCampaignOut)
async def create_campaign(payload: OfferCampaignCreate, db: AsyncSession = Depends(get_db)):
    """
    Save or publish a promotional campaign.
    """
    now = datetime.now(timezone.utc)
    discount_display = _format_discount_display(payload.discount_type, payload.discount_value)

    # Determine status if scheduled vs published
    computed_status = payload.status.upper()
    if computed_status == "PUBLISHED":
        if payload.start_at > now:
            computed_status = "SCHEDULED"
        elif payload.end_at < now:
            computed_status = "EXPIRED"

    campaign = OfferCampaign(
        title=payload.title,
        description=payload.description,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        discount_display=discount_display,
        promo_code=payload.promo_code.strip().upper(),
        start_at=payload.start_at,
        end_at=payload.end_at,
        applicable_categories=payload.applicable_categories,
        target_audience=payload.target_audience,
        cta_text=payload.cta_text,
        cta_url=payload.cta_url,
        placement=payload.placement,
        status=computed_status,
        selected_template=payload.selected_template,
        design_spec_json=payload.design_spec_json,
        variations_json=payload.variations_json,
        visual_asset_url=payload.visual_asset_url or payload.design_spec_json.get("visual", {}).get("asset_url"),
        campaign_theme=payload.campaign_theme,
        created_by="Marketing Admin"
    )

    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)

    # Record Audit Log
    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="OFFER_CAMPAIGN_CREATED",
            title=f"Created Offer Campaign: {campaign.title}",
            admin="Marketing Admin",
            target=f"Promo {campaign.promo_code} ({campaign.discount_display})",
            severity="INFO",
            details=f"Placement: {campaign.placement} | Status: {campaign.status} | Template: {campaign.selected_template}"
        )
    except Exception:
        pass

    return campaign


@router.get("/campaigns/{campaign_id}", response_model=OfferCampaignOut)
async def get_campaign(campaign_id: UUID, db: AsyncSession = Depends(get_db)):
    campaign = await db.get(OfferCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Offer campaign not found")
    return campaign


@router.put("/campaigns/{campaign_id}", response_model=OfferCampaignOut)
async def update_campaign(
    campaign_id: UUID,
    payload: OfferCampaignUpdate,
    db: AsyncSession = Depends(get_db)
):
    campaign = await db.get(OfferCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Offer campaign not found")

    update_data = payload.dict(exclude_unset=True)

    if "discount_value" in update_data or "discount_type" in update_data:
        d_type = update_data.get("discount_type", campaign.discount_type)
        d_val = update_data.get("discount_value", campaign.discount_value)
        campaign.discount_display = _format_discount_display(d_type, d_val)

    if "promo_code" in update_data:
        update_data["promo_code"] = update_data["promo_code"].strip().upper()

    for field, val in update_data.items():
        setattr(campaign, field, val)

    await db.commit()
    await db.refresh(campaign)

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="OFFER_CAMPAIGN_UPDATED",
            title=f"Updated Offer Campaign: {campaign.title}",
            admin="Marketing Admin",
            target=f"Promo {campaign.promo_code}",
            severity="INFO",
            details=f"Status: {campaign.status} | Template: {campaign.selected_template}"
        )
    except Exception:
        pass

    return campaign


@router.post("/campaigns/{campaign_id}/publish")
async def publish_campaign(campaign_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Publish an approved offer campaign live to the storefront.
    """
    now = datetime.now(timezone.utc)
    campaign = await db.get(OfferCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Offer campaign not found")

    if campaign.end_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish an expired campaign. Please extend the expiration date first."
        )

    if campaign.start_at > now:
        campaign.status = "SCHEDULED"
    else:
        campaign.status = "PUBLISHED"

    await db.commit()
    await db.refresh(campaign)

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="OFFER_CAMPAIGN_PUBLISHED",
            title=f"Published Offer Campaign: {campaign.title}",
            admin="Marketing Admin",
            target=f"Promo {campaign.promo_code} ({campaign.discount_display})",
            severity="INFO",
            details=f"Live on {campaign.placement} until {campaign.end_at.strftime('%Y-%m-%d %H:%M')}"
        )
    except Exception:
        pass

    return {"message": f"Offer Campaign '{campaign.title}' is now {campaign.status}!", "campaign": campaign}


@router.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: UUID, db: AsyncSession = Depends(get_db)):
    campaign = await db.get(OfferCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Offer campaign not found")

    campaign.status = "PAUSED"
    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="OFFER_CAMPAIGN_PAUSED",
            title=f"Paused Offer Campaign: {campaign.title}",
            admin="Marketing Admin",
            target=f"Promo {campaign.promo_code}",
            severity="WARNING",
            details="Banner temporarily withdrawn from storefront."
        )
    except Exception:
        pass

    return {"message": f"Offer Campaign '{campaign.title}' has been paused.", "status": "PAUSED"}


@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: UUID, db: AsyncSession = Depends(get_db)):
    campaign = await db.get(OfferCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Offer campaign not found")

    title = campaign.title
    code = campaign.promo_code
    await db.delete(campaign)
    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="OFFER_CAMPAIGN_DELETED",
            title=f"Deleted Offer Campaign: {title}",
            admin="Marketing Admin",
            target=f"Promo {code}",
            severity="WARNING",
            details="Campaign permanently removed."
        )
    except Exception:
        pass

    return {"message": f"Offer campaign '{title}' deleted successfully."}


# ── Storefront Public Delivery Endpoint ──────────────────────────────────────

@router.get("/active", response_model=list[OfferCampaignOut])
async def get_active_storefront_offers(
    placement: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Public storefront endpoint to fetch published active promotional banners.
    Automatically checks that start_at <= now <= end_at.
    """
    now = datetime.now(timezone.utc)
    stmt = select(OfferCampaign).where(
        OfferCampaign.status == "PUBLISHED",
        OfferCampaign.start_at <= now,
        OfferCampaign.end_at >= now
    ).order_by(OfferCampaign.created_at.desc())

    if placement and placement != "all":
        stmt = stmt.where(OfferCampaign.placement == placement)

    result = await db.execute(stmt)
    campaigns = result.scalars().all()

    # If category filter provided, filter in-memory or by JSON
    if category and category.strip():
        cat_lower = category.strip().lower()
        campaigns = [
            c for c in campaigns
            if any(cat_lower in cat.lower() for cat in (c.applicable_categories or [])) or not c.applicable_categories
        ]

    return campaigns
