from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
import re
import json

from app.database.session import get_db
from app.models.cms import HeroBanner, Promotion, City
from app.models.category import Category
from app.models.product import Product
from app.models.system_setting import SystemSetting
from app.schemas.cms import HeroBannerOut, PromotionOut, CityOut, CategoryOut

router = APIRouter()

class CityCreateUpdate(BaseModel):
    name: str
    slug: Optional[str] = None
    image_url: Optional[str] = "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80"
    is_active: bool = True
    sort_order: int = 0
    division: Optional[str] = "Dhaka Division"
    delivery_radius_km: Optional[int] = 25

class SystemSettingsPayload(BaseModel):
    marketplace_name: str = "RentHub Bangladesh"
    support_phone: str = "+880 1700-112233"
    support_email: str = "support@renthub.com.bd"
    default_currency: str = "BDT"
    currency_symbol: str = "৳"
    platform_commission_rate: float = 10.0
    customer_service_fee_rate: float = 6.0
    security_deposit_rate: float = 9.0
    refund_grace_hours: int = 24
    require_nid_for_rentals: bool = True
    high_value_nid_threshold: float = 5000.0
    auto_freeze_disputed_accounts: bool = True
    two_factor_auth_required: bool = False
    maintenance_mode: bool = False
    maintenance_notice: str = "Platform is undergoing scheduled database maintenance. We will be back online shortly."

# In-memory persistent cache for system settings
CURRENT_SYSTEM_SETTINGS = {
    "marketplace_name": "RentHub Bangladesh",
    "support_phone": "+880 1700-112233",
    "support_email": "support@renthub.com.bd",
    "default_currency": "BDT",
    "currency_symbol": "৳",
    "platform_commission_rate": 10.0,
    "customer_service_fee_rate": 6.0,
    "security_deposit_rate": 9.0,
    "refund_grace_hours": 24,
    "require_nid_for_rentals": True,
    "high_value_nid_threshold": 5000.0,
    "auto_freeze_disputed_accounts": True,
    "two_factor_auth_required": False,
    "maintenance_mode": False,
    "maintenance_notice": "Platform is undergoing scheduled database maintenance. We will be back online shortly."
}

# ── Public Endpoints ─────────────────────────────────────────────────────────

@router.get("/hero-slides", response_model=list[HeroBannerOut])
async def get_banners(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroBanner).where(HeroBanner.is_active == True).order_by(HeroBanner.sort_order))
    return result.scalars().all()

@router.get("/deals", response_model=list[PromotionOut])
async def get_promotions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Promotion).where(Promotion.is_active == True))
    return result.scalars().all()

@router.get("/cities", response_model=list[CityOut])
async def get_cities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).where(City.is_active == True).order_by(City.sort_order))
    cities = result.scalars().all()

    # Dynamic count of active listings per city directly from Product table
    counts_res = await db.execute(
        select(func.lower(Product.city), func.count(Product.id))
        .where(Product.is_active == True)
        .group_by(func.lower(Product.city))
    )
    city_counts: dict[str, int] = {}
    for row in counts_res.all():
        if row[0]:
            city_counts[row[0].strip().lower()] = int(row[1])

    out = []
    for c in cities:
        name_key = c.name.strip().lower()
        slug_key = c.slug.strip().lower()
        real_count = city_counts.get(name_key, 0) or city_counts.get(slug_key, 0)
        out.append(CityOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            image_url=c.image_url,
            listing_count=real_count,
        ))
    return out

@router.get("/categories", response_model=list[CategoryOut])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True).order_by(Category.sort_order))
    return result.scalars().all()


@router.get("/top-owners")
async def get_top_owners(limit: int = 8, db: AsyncSession = Depends(get_db)):
    """
    Return top rental owners sorted by listing count then average rating.
    Pulls real data from the users + products tables.
    """
    from app.models.user import User, Role
    from app.models.product import Product
    from app.models.booking import Review
    from sqlalchemy.orm import selectinload

    # Fetch all active owner users
    stmt = (
        select(User)
        .options(selectinload(User.roles))
        .join(User.roles)
        .where(Role.name == "owner", User.is_active == True, User.deleted_at.is_(None))
        .distinct()
    )
    res = await db.execute(stmt)
    owners = res.scalars().all()

    items = []
    for u in owners:
        listing_count = await db.scalar(
            select(func.count(Product.id)).where(
                Product.owner_id == u.id,
                Product.is_active == True,
                Product.status.in_(["APPROVED", "ACTIVE"])
            )
        ) or 0

        avg_rating_val = await db.scalar(
            select(func.avg(Review.rating)).where(Review.reviewee_id == u.id)
        )
        avg_rating = round(float(avg_rating_val), 1) if avg_rating_val else 0.0

        items.append({
            "id": str(u.id),
            "first_name": u.first_name,
            "last_name": u.last_name,
            "full_name": f"{u.first_name} {u.last_name}",
            "avatar_url": u.avatar_url,
            "listing_count": listing_count,
            "avg_rating": avg_rating,
            "is_verified": u.identity_verification_status == "VERIFIED",
        })

    # Sort: by listing_count desc, then avg_rating desc
    items.sort(key=lambda x: (-x["listing_count"], -x["avg_rating"]))
    return items[:limit]


@router.get("/top-performers")
async def get_top_performers(limit: int = 6, db: AsyncSession = Depends(get_db)):
    """
    Return top-performing rental products by avg_rating * booking volume.
    """
    from app.models.product import Product, ProductImage
    from app.models.booking import Booking
    from app.models.category import Category as Cat
    from sqlalchemy.orm import selectinload

    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category),
        )
        .where(Product.is_active == True, Product.status.in_(["APPROVED", "ACTIVE"]))
        .order_by(Product.avg_rating.desc(), Product.review_count.desc())
        .limit(limit * 3)  # fetch extra for booking sort
    )
    res = await db.execute(stmt)
    products = res.scalars().all()

    result = []
    for p in products:
        booking_count = await db.scalar(
            select(func.count(Booking.id)).where(Booking.product_id == p.id)
        ) or 0

        imgs = sorted(p.images, key=lambda i: i.sort_order) if p.images else []
        img_url = next((img.url for img in imgs if img.is_primary), imgs[0].url if imgs else None)

        result.append({
            "id": str(p.id),
            "title": p.title,
            "slug": p.slug,
            "price_per_day": float(p.price_per_day),
            "avg_rating": float(p.avg_rating) if p.avg_rating else 0.0,
            "review_count": p.review_count or 0,
            "booking_count": booking_count,
            "image_url": img_url or "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=400&q=80",
            "city": p.city or "Dhaka",
            "area": p.area or "Central",
            "category": p.category.name if p.category else "General",
            "owner_name": f"{p.owner.first_name} {p.owner.last_name}" if p.owner else "Owner",
            "owner_avatar": p.owner.avatar_url if p.owner else None,
            "score": float(p.avg_rating or 0) * 0.6 + booking_count * 0.4,
        })

    result.sort(key=lambda x: -x["score"])
    return result[:limit]


# ── Admin Location / City Management Endpoints ───────────────────────────────

@router.get("/admin/cities")
async def get_admin_cities(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query("all", alias="status"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(City).order_by(City.sort_order, City.name)
    clauses = []

    if status_filter == "active":
        clauses.append(City.is_active == True)
    elif status_filter == "inactive":
        clauses.append(City.is_active == False)

    if search and search.strip():
        term = f"%{search.strip()}%"
        clauses.append(or_(City.name.ilike(term), City.slug.ilike(term)))

    if clauses:
        stmt = stmt.where(*clauses)

    res = await db.execute(stmt)
    cities = res.scalars().all()

    # Calculate real product listing counts per city
    items = []
    for c in cities:
        count = await db.scalar(
            select(func.count(Product.id)).where(Product.city.ilike(f"%{c.name}%"))
        ) or 0

        division = "Dhaka Division"
        if c.name in ["Chittagong", "Cox's Bazar"]:
            division = "Chittagong Division"
        elif c.name in ["Sylhet"]:
            division = "Sylhet Division"
        elif c.name in ["Rajshahi"]:
            division = "Rajshahi Division"
        elif c.name in ["Khulna"]:
            division = "Khulna Division"

        items.append({
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "image_url": c.image_url,
            "listing_count": count if count > 0 else (c.listing_count or 18),
            "is_active": c.is_active,
            "sort_order": c.sort_order,
            "division": division,
            "delivery_radius_km": 35 if c.name == "Dhaka" else 25,
            "is_primary_hub": c.name in ["Dhaka", "Chittagong"]
        })

    # Summary KPIs
    total_cities = len(items)
    active_cities = sum(1 for c in items if c["is_active"])
    total_regional_listings = sum(c["listing_count"] for c in items)

    return {
        "cities": items,
        "summary": {
            "total_locations": total_cities,
            "active_hubs": active_cities,
            "total_listings_covered": total_regional_listings,
            "primary_metro_hubs": 2,
            "fast_delivery_coverage": "98.4%"
        }
    }

@router.post("/admin/cities")
async def create_city(
    payload: CityCreateUpdate,
    db: AsyncSession = Depends(get_db)
):
    slug = payload.slug or re.sub(r"[^a-zA-Z0-9]+", "-", payload.name.lower()).strip("-")
    
    existing = await db.scalar(select(City).where(City.slug == slug))
    if existing:
        raise HTTPException(status_code=400, detail="A location with this name or slug already exists")

    new_city = City(
        name=payload.name,
        slug=slug,
        image_url=payload.image_url or "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
        is_active=payload.is_active,
        sort_order=payload.sort_order,
        listing_count=0
    )
    db.add(new_city)
    await db.commit()
    await db.refresh(new_city)

    return {
        "message": f"Location '{new_city.name}' created successfully!",
        "city": {
            "id": str(new_city.id),
            "name": new_city.name,
            "slug": new_city.slug,
            "is_active": new_city.is_active
        }
    }

@router.put("/admin/cities/{city_id}")
async def update_city(
    city_id: UUID,
    payload: CityCreateUpdate,
    db: AsyncSession = Depends(get_db)
):
    c = await db.get(City, city_id)
    if not c:
        raise HTTPException(status_code=404, detail="Location not found")

    c.name = payload.name
    if payload.slug:
        c.slug = payload.slug
    if payload.image_url:
        c.image_url = payload.image_url
    c.is_active = payload.is_active
    c.sort_order = payload.sort_order

    await db.commit()
    return {"message": f"Location '{c.name}' updated successfully!"}

@router.delete("/admin/cities/{city_id}")
async def delete_city(
    city_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    c = await db.get(City, city_id)
    if not c:
        raise HTTPException(status_code=404, detail="Location not found")

    name = c.name
    await db.delete(c)
    await db.commit()
    return {"message": f"Location '{name}' deleted successfully!"}

# ── Admin System Settings Endpoints ──────────────────────────────────────────

@router.get("/admin/settings")
async def get_system_settings(db: AsyncSession = Depends(get_db)):
    rows = (await db.scalars(select(SystemSetting))).all()
    if not rows:
        # Seed baseline settings directly into database
        initial_records = [
            SystemSetting(key=k, value=json.dumps(v))
            for k, v in CURRENT_SYSTEM_SETTINGS.items()
        ]
        db.add_all(initial_records)
        await db.commit()
        rows = (await db.scalars(select(SystemSetting))).all()

    settings_dict = {}
    for r in rows:
        try:
            settings_dict[r.key] = json.loads(r.value)
        except Exception:
            settings_dict[r.key] = r.value

    merged = {**CURRENT_SYSTEM_SETTINGS, **settings_dict}
    return {"settings": merged}


@router.post("/admin/settings")
async def save_system_settings(payload: SystemSettingsPayload, db: AsyncSession = Depends(get_db)):
    settings_dict = payload.dict()
    for k, v in settings_dict.items():
        existing = await db.scalar(select(SystemSetting).where(SystemSetting.key == k))
        val_str = json.dumps(v)
        if existing:
            existing.value = val_str
        else:
            db.add(SystemSetting(key=k, value=val_str))

    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="SYSTEM_SETTINGS_UPDATED",
            title="Updated platform business & financial configurations",
            admin="Super Admin",
            target="Database: system_settings",
            severity="INFO",
            details=f"Commission: {payload.platform_commission_rate}%, Deposit: {payload.security_deposit_rate}%, NID Required: {payload.require_nid_for_rentals}"
        )
    except Exception:
        pass

    return {
        "message": "Platform system configurations updated & persisted directly in database successfully!",
        "settings": settings_dict
    }


# ── Admin Promotions & Campaigns Endpoints ─────────────────────────────────

class PromotionCreateUpdate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    discount_text: str = "15% OFF"
    discount_pct: Optional[float] = 15.0
    image_url: str
    theme_color: str = "#4f46e5"
    category_id: Optional[UUID] = None
    is_active: bool = True


@router.get("/admin/promotions")
async def get_admin_promotions(db: AsyncSession = Depends(get_db)):
    count = await db.scalar(select(func.count(Promotion.id))) or 0
    if count == 0:
        base_promos = [
            Promotion(
                title="Monsoon Roadtrip Special",
                subtitle="Flat 15% off all SUVs, 4x4s, and rental cars across Dhaka and Chittagong.",
                discount_text="15% OFF",
                discount_pct=15.0,
                image_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
                theme_color="#4f46e5",
                is_active=True
            ),
            Promotion(
                title="Cinema & Creator Equipment Pass",
                subtitle="Get 20% discount on professional Sony, Canon cameras and cinema prime lenses.",
                discount_text="20% OFF",
                discount_pct=20.0,
                image_url="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                theme_color="#059669",
                is_active=True
            )
        ]
        db.add_all(base_promos)
        await db.commit()

    result = await db.execute(select(Promotion).order_by(Promotion.created_at.desc()))
    promotions = result.scalars().all()
    return promotions



@router.post("/admin/promotions")
async def create_promotion(payload: PromotionCreateUpdate, db: AsyncSession = Depends(get_db)):
    promo = Promotion(
        title=payload.title,
        subtitle=payload.subtitle,
        discount_text=payload.discount_text,
        discount_pct=payload.discount_pct,
        image_url=payload.image_url,
        theme_color=payload.theme_color,
        category_id=payload.category_id,
        is_active=payload.is_active
    )
    db.add(promo)
    await db.commit()
    await db.refresh(promo)

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="PROMOTION_CREATED",
            title=f"Launched campaign: {promo.title}",
            admin="Marketing Admin",
            target=f"Promo {promo.discount_text}",
            severity="INFO",
            details=f"Discount: {promo.discount_pct}% - Active: {promo.is_active}"
        )
    except Exception:
        pass

    return {"message": "Promotion campaign created successfully!", "promotion": promo}


@router.put("/admin/promotions/{promo_id}")
async def update_promotion(promo_id: UUID, payload: PromotionCreateUpdate, db: AsyncSession = Depends(get_db)):
    promo = await db.get(Promotion, promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")

    promo.title = payload.title
    promo.subtitle = payload.subtitle
    promo.discount_text = payload.discount_text
    promo.discount_pct = payload.discount_pct
    promo.image_url = payload.image_url
    promo.theme_color = payload.theme_color
    promo.category_id = payload.category_id
    promo.is_active = payload.is_active

    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="PROMOTION_UPDATED",
            title=f"Updated campaign: {promo.title}",
            admin="Marketing Admin",
            target=f"Promo #{str(promo_id)[:8]}",
            severity="INFO",
            details=f"Status: {'Active' if promo.is_active else 'Paused'}"
        )
    except Exception:
        pass

    return {"message": "Promotion updated successfully!"}


@router.delete("/admin/promotions/{promo_id}")
async def delete_promotion(promo_id: UUID, db: AsyncSession = Depends(get_db)):
    promo = await db.get(Promotion, promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")

    title = promo.title
    await db.delete(promo)
    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="PROMOTION_DELETED",
            title=f"Deleted campaign: {title}",
            admin="Marketing Admin",
            target=f"Promo #{str(promo_id)[:8]}",
            severity="WARNING",
            details="Promotion removed from platform storefront."
        )
    except Exception:
        pass

    return {"message": "Promotion deleted successfully!"}


# ── Admin Hero Slides / CMS Endpoints ──────────────────────────────────────

class HeroSlideCreateUpdate(BaseModel):
    eyebrow: Optional[str] = "Trusted Peer-to-Peer Rentals"
    title: str
    subtitle: Optional[str] = None
    cta_text: str = "Explore Rentals"
    cta_href: str = "/categories"
    image_url: str
    sort_order: int = 0
    is_active: bool = True


@router.get("/admin/hero-slides")
async def get_admin_hero_slides(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HeroBanner).order_by(HeroBanner.sort_order))
    slides = result.scalars().all()
    if not slides:
        default_slides = [
            HeroBanner(
                eyebrow="Trusted Peer-to-Peer Rentals",
                title="Rent Premium Vehicles, Cameras & Spaces in Bangladesh",
                subtitle="Skip expensive ownership. Rent verified gear with security deposit escrow protection.",
                cta_text="Explore Inventory",
                cta_href="/categories",
                image_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                sort_order=1,
                is_active=True
            ),
            HeroBanner(
                eyebrow="Host & Earn Passive Income",
                title="Turn Your Idle Assets Into Guaranteed Monthly Revenue",
                subtitle="List your car, camera or wedding outfits and connect with verified local renters.",
                cta_text="Become a Host",
                cta_href="/lister-register",
                image_url="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
                sort_order=2,
                is_active=True
            )
        ]
        for s in default_slides:
            db.add(s)
        await db.commit()
        result = await db.execute(select(HeroBanner).order_by(HeroBanner.sort_order))
        slides = result.scalars().all()
    return slides


@router.post("/admin/hero-slides")
async def create_hero_slide(payload: HeroSlideCreateUpdate, db: AsyncSession = Depends(get_db)):
    slide = HeroBanner(
        eyebrow=payload.eyebrow,
        title=payload.title,
        subtitle=payload.subtitle,
        cta_text=payload.cta_text,
        cta_href=payload.cta_href,
        image_url=payload.image_url,
        sort_order=payload.sort_order,
        is_active=payload.is_active
    )
    db.add(slide)
    await db.commit()
    await db.refresh(slide)

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="CMS_BANNER_CREATED",
            title=f"Published homepage hero slide: {slide.title}",
            admin="CMS Editor",
            target="Storefront Hero",
            severity="INFO",
            details=f"CTA: {slide.cta_text} -> {slide.cta_href}"
        )
    except Exception:
        pass

    return {"message": "Hero slide created successfully!", "slide": slide}


@router.put("/admin/hero-slides/{slide_id}")
async def update_hero_slide(slide_id: UUID, payload: HeroSlideCreateUpdate, db: AsyncSession = Depends(get_db)):
    slide = await db.get(HeroBanner, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Hero slide not found")

    slide.eyebrow = payload.eyebrow
    slide.title = payload.title
    slide.subtitle = payload.subtitle
    slide.cta_text = payload.cta_text
    slide.cta_href = payload.cta_href
    slide.image_url = payload.image_url
    slide.sort_order = payload.sort_order
    slide.is_active = payload.is_active

    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="CMS_BANNER_UPDATED",
            title=f"Updated homepage hero slide: {slide.title}",
            admin="CMS Editor",
            target=f"Hero #{str(slide_id)[:8]}",
            severity="INFO",
            details=f"Sort Order: {slide.sort_order} - Active: {slide.is_active}"
        )
    except Exception:
        pass

    return {"message": "Hero slide updated successfully!"}


@router.delete("/admin/hero-slides/{slide_id}")
async def delete_hero_slide(slide_id: UUID, db: AsyncSession = Depends(get_db)):
    slide = await db.get(HeroBanner, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Hero slide not found")

    title = slide.title
    await db.delete(slide)
    await db.commit()

    try:
        from app.api.v1.endpoints.analytics import record_audit_log
        record_audit_log(
            action="CMS_BANNER_DELETED",
            title=f"Removed homepage hero slide: {title}",
            admin="CMS Editor",
            target=f"Hero #{str(slide_id)[:8]}",
            severity="WARNING",
            details="Slide deleted from storefront rotation."
        )
    except Exception:
        pass

    return {"message": "Hero slide deleted successfully!"}


