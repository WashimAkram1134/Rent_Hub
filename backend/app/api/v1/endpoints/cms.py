from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.cms import HeroBanner, Promotion, City
from app.models.category import Category
from app.schemas.cms import HeroBannerOut, PromotionOut, CityOut, CategoryOut

router = APIRouter()

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
