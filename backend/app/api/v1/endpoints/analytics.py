from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.models.product import Product
from app.models.booking import Booking

router = APIRouter()

@router.get("/owner-stats")
async def get_owner_stats(db: AsyncSession = Depends(get_db)):
    # Very simple stats for now
    products_count = await db.execute(select(func.count(Product.id)))
    bookings_count = await db.execute(select(func.count(Booking.id)))
    
    return {
        "total_listings": products_count.scalar() or 0,
        "active_rentals": bookings_count.scalar() or 0,
        "monthly_earnings": 82450, # Dummy for now
        "pending_requests": 9 # Dummy for now
    }

@router.get("/admin-stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    products_count = await db.execute(select(func.count(Product.id)))
    bookings_count = await db.execute(select(func.count(Booking.id)))
    # We don't have a user model imported here yet, so we'll mock the user count for now 
    # since this is just getting the UI up and running
    
    return {
        "total_users": 18452, # Dummy
        "total_listings": products_count.scalar() or 0,
        "total_bookings": bookings_count.scalar() or 0,
        "total_revenue": 124580, # Dummy
        "total_payouts": 87430, # Dummy
        "open_disputes": 32 # Dummy
    }
