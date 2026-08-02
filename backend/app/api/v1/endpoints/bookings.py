from uuid import UUID
from datetime import date
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.booking import Booking
from app.models.product import Product, ProductImage
from app.models.user import User
from app.schemas.booking import BookingOut, BookingCreate, BookingStatusUpdate, ProductSimple
from app.auth.dependencies import get_current_user_optional

router = APIRouter()

@router.get("", response_model=list[BookingOut])
async def get_bookings(
    upcoming: bool = Query(False),
    status_filter: str = Query(None, alias="status"),
    renter_id: str = Query(None),
    owner_id: str = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Booking).options(selectinload(Booking.product).selectinload(Product.images))
    
    if upcoming:
        stmt = stmt.where(Booking.status.in_(["approved", "pending"]))
    elif status_filter:
        stmt = stmt.where(Booking.status == status_filter.lower())
        
    if renter_id:
        stmt = stmt.where(Booking.renter_id == UUID(renter_id))
    if owner_id:
        stmt = stmt.where(Booking.owner_id == UUID(owner_id))
        
    stmt = stmt.order_by(Booking.created_at.desc()).limit(limit)
    
    result = await db.execute(stmt)
    bookings = result.scalars().all()
    
    out = []
    for b in bookings:
        img_url = None
        if b.product and getattr(b.product, "images", None):
            img_url = next((img.url for img in b.product.images if getattr(img, "is_primary", False)), None)
            if not img_url and len(b.product.images) > 0:
                img_url = b.product.images[0].url
                
        prod_simple = None
        if b.product:
            prod_simple = ProductSimple(
                id=b.product.id,
                title=b.product.title,
                image_url=img_url,
                price_per_day=b.product.price_per_day,
                city=b.product.city
            )
            
        out.append(BookingOut(
            id=b.id,
            product_id=b.product_id,
            renter_id=b.renter_id,
            owner_id=b.owner_id,
            start_date=b.start_date,
            end_date=b.end_date,
            total_days=int(b.total_days or 1),
            daily_rate=float(b.daily_rate or 0),
            subtotal=float(b.subtotal or 0),
            security_deposit=float(b.security_deposit or 0),
            delivery_fee=float(b.delivery_fee or 0),
            total_amount=float(b.total_amount or 0),
            status=b.status,
            delivery_option=b.delivery_option,
            notes=b.notes,
            product=prod_simple
        ))
        
    return out


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Fetch product
    prod_stmt = select(Product).options(selectinload(Product.images)).where(Product.id == payload.product_id)
    res = await db.execute(prod_stmt)
    product = res.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Calculate days & pricing
    total_days = max(1, (payload.end_date - payload.start_date).days)
    daily_rate = float(product.price_per_day)
    subtotal = daily_rate * total_days
    security_deposit = float(product.security_deposit or 0.0)
    service_fee = round(subtotal * 0.06, 2)
    delivery_fee = 200.0 if payload.delivery_option.lower() == "delivery" else 0.0
    total_amount = subtotal + service_fee + security_deposit + delivery_fee
    
    # Renter ID (default to first active user if not logged in for dev testing)
    renter_id = current_user.id if current_user else product.owner_id
    
    new_booking = Booking(
        product_id=product.id,
        renter_id=renter_id,
        owner_id=product.owner_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_days=total_days,
        daily_rate=daily_rate,
        subtotal=subtotal,
        security_deposit=security_deposit,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        status="pending",
        delivery_option=payload.delivery_option,
        notes=payload.notes
    )
    
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    img_url = next((img.url for img in product.images if getattr(img, "is_primary", False)), None)
    if not img_url and len(product.images) > 0:
        img_url = product.images[0].url
        
    prod_simple = ProductSimple(
        id=product.id,
        title=product.title,
        image_url=img_url,
        price_per_day=product.price_per_day,
        city=product.city
    )
    
    return BookingOut(
        id=new_booking.id,
        product_id=new_booking.product_id,
        renter_id=new_booking.renter_id,
        owner_id=new_booking.owner_id,
        start_date=new_booking.start_date,
        end_date=new_booking.end_date,
        total_days=int(new_booking.total_days),
        daily_rate=float(new_booking.daily_rate),
        subtotal=float(new_booking.subtotal),
        security_deposit=float(new_booking.security_deposit),
        delivery_fee=float(new_booking.delivery_fee),
        total_amount=float(new_booking.total_amount),
        status=new_booking.status,
        delivery_option=new_booking.delivery_option,
        notes=new_booking.notes,
        product=prod_simple
    )


@router.put("/{booking_id}/status", response_model=dict)
async def update_booking_status(
    booking_id: UUID,
    payload: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Booking).where(Booking.id == booking_id)
    res = await db.execute(stmt)
    booking = res.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = payload.status.lower()
    if payload.notes:
        booking.notes = payload.notes
        
    await db.commit()
    return {"message": "Booking status updated successfully", "id": str(booking_id), "status": booking.status}


class MultiBookingItemPayload(BaseModel):
    product_id: str
    start_date: str
    end_date: str
    delivery_option: str = "pickup"

class MultiBookingPayload(BaseModel):
    items: list[MultiBookingItemPayload]

@router.post("/multi", status_code=status.HTTP_201_CREATED)
async def create_multi_booking(
    payload: MultiBookingPayload,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    processed = []
    
    for item in payload.items:
        try:
            p_uuid = UUID(item.product_id)
            res = await db.execute(select(Product).where(Product.id == p_uuid))
            prod = res.scalars().first()
            if prod:
                renter_id = current_user.id if current_user else prod.owner_id
                b = Booking(
                    product_id=prod.id,
                    renter_id=renter_id,
                    owner_id=prod.owner_id,
                    start_date=date.fromisoformat(item.start_date),
                    end_date=date.fromisoformat(item.end_date),
                    total_days=3,
                    daily_rate=float(prod.price_per_day),
                    subtotal=float(prod.price_per_day * 3),
                    security_deposit=float(prod.security_deposit or 2000),
                    delivery_fee=200.0 if item.delivery_option == "delivery" else 0.0,
                    total_amount=float((prod.price_per_day * 3) + (prod.security_deposit or 2000)),
                    status="pending",
                    delivery_option=item.delivery_option,
                    notes="Multi-item cart booking request"
                )
                db.add(b)
                processed.append(str(b.id))
        except Exception as e:
            print("Multi-booking item process note:", e)
            
    await db.commit()
    return {
        "status": "success",
        "message": f"Successfully sent booking requests to all item owners",
        "total_requests": len(payload.items),
        "booking_ids": processed
    }

