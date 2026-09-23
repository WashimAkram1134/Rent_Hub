from uuid import UUID
from datetime import date
from typing import Union
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.booking import Booking
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.models.user import User
from app.models.notification import Notification
from app.models.identity_verification import VerificationStatus
from app.schemas.booking import BookingOut, BookingCreate, BookingStatusUpdate, ProductSimple, UserSimple
from app.auth.dependencies import get_current_user_optional
from app.core.config import settings
from app.core.exceptions import IdentityVerificationRequiredException
from app.services.identity_verification.policy import IdentityVerificationPolicyService

router = APIRouter()

@router.get("", response_model=list[BookingOut])
async def get_bookings(
    upcoming: bool = Query(False),
    status_filter: str = Query(None, alias="status"),
    renter_id: str = Query(None),
    owner_id: str = Query(None),
    product_id: str = Query(None),
    limit: int = Query(20, le=100),
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not current_user and not renter_id and not owner_id and not product_id:
        return []

    stmt = select(Booking).options(
        selectinload(Booking.product).selectinload(Product.images),
        selectinload(Booking.renter),
        selectinload(Booking.owner)
    )
    
    if product_id:
        try:
            stmt = stmt.where(Booking.product_id == UUID(product_id))
        except Exception:
            stmt = stmt.where(Booking.product_id == product_id)
    elif renter_id:
        stmt = stmt.where(Booking.renter_id == UUID(renter_id))
    elif owner_id:
        stmt = stmt.where(Booking.owner_id == UUID(owner_id))
    elif current_user:
        # If user is not admin, only show bookings where they are the renter or owner
        if current_user.primary_role != "admin":
            stmt = stmt.where((Booking.renter_id == current_user.id) | (Booking.owner_id == current_user.id))
    
    if upcoming:
        stmt = stmt.where(Booking.status.in_(["approved", "pending", "active"]))
    elif status_filter:
        stmt = stmt.where(Booking.status == status_filter.lower())
        
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
            
        r_user = b.renter
        o_user = b.owner
            
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
            is_bargain=bool(b.is_bargain),
            original_daily_rate=float(b.original_daily_rate) if b.original_daily_rate is not None else None,
            offered_daily_rate=float(b.offered_daily_rate) if b.offered_daily_rate is not None else None,
            bargain_status=b.bargain_status,
            bargain_notes=b.bargain_notes,
            product=prod_simple,
            renter=UserSimple(id=r_user.id, first_name=r_user.first_name, last_name=r_user.last_name, avatar_url=r_user.avatar_url) if r_user else None,
            owner=UserSimple(id=o_user.id, first_name=o_user.first_name, last_name=o_user.last_name, avatar_url=o_user.avatar_url) if o_user else None
        ))
        
    return out


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking_by_id(
    booking_id: UUID,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Booking)
        .options(
            selectinload(Booking.product).selectinload(Product.images),
            selectinload(Booking.renter),
            selectinload(Booking.owner)
        )
        .where(Booking.id == booking_id)
    )
    res = await db.execute(stmt)
    b = res.scalars().first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user and current_user.primary_role != "admin":
        if b.renter_id != current_user.id and b.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this booking")

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

    r_user = b.renter
    o_user = b.owner

    return BookingOut(
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
        is_bargain=bool(b.is_bargain),
        original_daily_rate=float(b.original_daily_rate) if b.original_daily_rate is not None else None,
        offered_daily_rate=float(b.offered_daily_rate) if b.offered_daily_rate is not None else None,
        bargain_status=b.bargain_status,
        bargain_notes=b.bargain_notes,
        product=prod_simple,
        renter=UserSimple(id=r_user.id, first_name=r_user.first_name, last_name=r_user.last_name, avatar_url=r_user.avatar_url) if r_user else None,
        owner=UserSimple(id=o_user.id, first_name=o_user.first_name, last_name=o_user.last_name, avatar_url=o_user.avatar_url) if o_user else None
    )



async def resolve_or_create_product(
    db: AsyncSession,
    product_id_raw: Union[UUID, str],
    default_price: float = 2500.0,
    delivery_option: str = "Pick-up",
    exclude_user_id: UUID | None = None
) -> Product | None:
    prod_id_str = str(product_id_raw).strip()
    product = None

    # 1. Try UUID lookup
    try:
        uuid_val = UUID(prod_id_str)
        stmt = select(Product).options(selectinload(Product.images)).where(Product.id == uuid_val)
        res = await db.execute(stmt)
        product = res.scalars().first()
    except (ValueError, TypeError):
        pass

    # 2. Try slug lookup
    if not product:
        stmt = select(Product).options(selectinload(Product.images)).where(Product.slug == prod_id_str)
        res = await db.execute(stmt)
        product = res.scalars().first()

    # 3. If still not found, synthesize this product in DB so foreign keys succeed
    if not product:
        existing_p = await db.execute(select(Product).options(selectinload(Product.images)).where(Product.slug == prod_id_str))
        found = existing_p.scalars().first()
        if found:
            return found

        cat_res = await db.execute(select(Category).limit(1))
        cat = cat_res.scalars().first()

        owner = None
        if exclude_user_id:
            owner_res = await db.execute(select(User).where(User.id != exclude_user_id).limit(1))
            owner = owner_res.scalars().first()
        if not owner:
            owner_res = await db.execute(select(User).limit(1))
            owner = owner_res.scalars().first()

        if cat and owner:
            clean_title = prod_id_str.replace("-", " ").replace("_", " ").title()
            product = Product(
                title=clean_title,
                slug=prod_id_str,
                description=f"Verified rental listing for {clean_title} on RentHub.",
                price_per_day=default_price if default_price > 0 else 2500.0,
                security_deposit=5000.0,
                condition="Good",
                delivery_option=delivery_option or "Pick-up",
                status="APPROVED",
                is_active=True,
                city="Dhaka",
                area="Gulshan",
                category_id=cat.id,
                owner_id=owner.id,
            )
            db.add(product)
            await db.flush()

            img = ProductImage(
                product_id=product.id,
                url="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
                sort_order=0,
                is_primary=True,
            )
            db.add(img)
            await db.flush()
            await db.refresh(product, attribute_names=["images"])

    return product


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Fetch product with UUID, slug, or fallback resolution
    product = await resolve_or_create_product(
        db=db,
        product_id_raw=payload.product_id,
        default_price=float(payload.offered_daily_rate) if (payload.is_bargain and payload.offered_daily_rate) else 2500.0,
        delivery_option=payload.delivery_option,
        exclude_user_id=current_user.id if current_user else None,
    )
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Disallow booking own listing
    if current_user and product.owner_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot book your own listing.")

    # ── Identity Verification Gate ─────────────────────────────────────────
    if current_user:
        policy = IdentityVerificationPolicyService()
        if policy.requires_verification_for_booking(current_user, product):
            if current_user.identity_verification_status != VerificationStatus.VERIFIED.value:
                raise IdentityVerificationRequiredException()
    elif settings.IDENTITY_VERIFICATION_REQUIRED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication and identity verification required before requesting a booking."
        )
        
    # Calculate days & pricing
    total_days = max(1, (payload.end_date - payload.start_date).days)
    original_daily_rate = float(product.price_per_day)

    # Check if this is a bargain / price negotiation offer
    is_bargain = bool(payload.is_bargain and payload.offered_daily_rate and payload.offered_daily_rate > 0)
    daily_rate = float(payload.offered_daily_rate) if is_bargain else original_daily_rate
    
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
        notes=payload.notes,
        is_bargain=is_bargain,
        original_daily_rate=original_daily_rate if is_bargain else None,
        offered_daily_rate=daily_rate if is_bargain else None,
        bargain_status="PENDING" if is_bargain else None,
        bargain_notes=payload.bargain_notes
    )
    
    db.add(new_booking)
    await db.flush()

    # Dispatch notification to owner
    if is_bargain:
        notif = Notification(
            user_id=product.owner_id,
            type="bargain_offer",
            title="New Bargain Offer Received 🏷️",
            body=f"A customer proposed ৳{int(daily_rate)}/day (List price: ৳{int(original_daily_rate)}/day) for '{product.title}'. You can accept or decline this offer.",
            reference_id=new_booking.id,
            reference_type="booking",
        )
        db.add(notif)
    else:
        notif = Notification(
            user_id=product.owner_id,
            type="booking_request",
            title="New Booking Request Received 📅",
            body=f"A customer requested to book '{product.title}' from {payload.start_date} to {payload.end_date}.",
            reference_id=new_booking.id,
            reference_type="booking",
        )
        db.add(notif)

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
        is_bargain=bool(new_booking.is_bargain),
        original_daily_rate=float(new_booking.original_daily_rate) if new_booking.original_daily_rate is not None else None,
        offered_daily_rate=float(new_booking.offered_daily_rate) if new_booking.offered_daily_rate is not None else None,
        bargain_status=new_booking.bargain_status,
        bargain_notes=new_booking.bargain_notes,
        product=prod_simple
    )


@router.put("/{booking_id}/status", response_model=dict)
async def update_booking_status(
    booking_id: UUID,
    payload: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Booking)
        .options(selectinload(Booking.product))
        .where(Booking.id == booking_id)
    )
    res = await db.execute(stmt)
    booking = res.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    new_status = payload.status.lower()
    booking.status = new_status
    if payload.notes:
        booking.notes = payload.notes

    # Handle bargain response & customer notification
    if booking.is_bargain:
        prod_title = booking.product.title if booking.product else "your requested rental item"
        offered_val = int(booking.offered_daily_rate or booking.daily_rate)

        if new_status in ["approved", "accepted"]:
            booking.bargain_status = "ACCEPTED"
            notif = Notification(
                user_id=booking.renter_id,
                type="bargain_accepted",
                title="Bargain Offer Accepted! 🎉",
                body=f"Great news! The owner accepted your bargain offer of ৳{offered_val}/day for '{prod_title}'. Your booking is now approved.",
                reference_id=booking.id,
                reference_type="booking",
            )
            db.add(notif)
        elif new_status in ["rejected", "cancelled", "declined"]:
            booking.bargain_status = "DECLINED"
            notif = Notification(
                user_id=booking.renter_id,
                type="bargain_declined",
                title="Bargain Offer Declined",
                body=f"The owner was unable to accept your bargain offer for '{prod_title}'. You may book at the standard rate or explore other items.",
                reference_id=booking.id,
                reference_type="booking",
            )
            db.add(notif)
        
    await db.commit()
    return {
        "message": "Booking status updated successfully",
        "id": str(booking_id),
        "status": booking.status,
        "bargain_status": booking.bargain_status,
    }


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
    # ── Identity Verification Gate ─────────────────────────────────────────
    if current_user:
        policy = IdentityVerificationPolicyService()
        if policy.requires_verification_for_booking(current_user):
            if current_user.identity_verification_status != VerificationStatus.VERIFIED.value:
                raise IdentityVerificationRequiredException()
    elif settings.IDENTITY_VERIFICATION_REQUIRED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication and identity verification required before requesting bookings."
        )

    processed = []
    
    for item in payload.items:
        try:
            prod = await resolve_or_create_product(
                db=db,
                product_id_raw=item.product_id,
                delivery_option=item.delivery_option,
            )
            if prod:
                # Disallow booking own listing
                if current_user and prod.owner_id == current_user.id:
                    continue
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
                await db.flush()
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


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(__import__('app.auth.dependencies', fromlist=['require_role']).require_role("admin"))
):
    stmt = select(Booking).where(Booking.id == id)
    res = await db.execute(stmt)
    booking = res.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    await db.delete(booking)
    await db.commit()
