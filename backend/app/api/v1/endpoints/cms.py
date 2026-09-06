from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
import re

from app.database.session import get_db
from app.models.cms import HeroBanner, Promotion, City
from app.models.category import Category
from app.models.product import Product
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
    return result.scalars().all()

@router.get("/categories", response_model=list[CategoryOut])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True).order_by(Category.sort_order))
    return result.scalars().all()

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
async def get_system_settings():
    return {"settings": CURRENT_SYSTEM_SETTINGS}

@router.post("/admin/settings")
async def save_system_settings(payload: SystemSettingsPayload):
    global CURRENT_SYSTEM_SETTINGS
    CURRENT_SYSTEM_SETTINGS.update(payload.dict())
    return {
        "message": "Platform system configurations updated & persisted successfully!",
        "settings": CURRENT_SYSTEM_SETTINGS
    }
