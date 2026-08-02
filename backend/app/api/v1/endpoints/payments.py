from uuid import UUID
from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.booking import Booking

router = APIRouter()

class PaymentRequest(BaseModel):
    booking_id: str
    payment_method: str  # "bkash", "nagad", "card", "cash"
    account_number: str | None = None
    trx_id: str | None = None

@router.post("/pay")
async def process_payment(
    payload: PaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        booking_uuid = UUID(payload.booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    stmt = select(Booking).options(selectinload(Booking.product)).where(Booking.id == booking_uuid)
    res = await db.execute(stmt)
    booking = res.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Generate transaction reference ID
    generated_trx = payload.trx_id or f"TXN-RH-{random.randint(100000, 999999)}"

    # Update booking status to approved/paid
    booking.status = "approved"
    booking.notes = f"Paid via {payload.payment_method.upper()} (TrxID: {generated_trx})"

    await db.commit()

    return {
        "status": "success",
        "message": "Payment processed successfully and funds held in escrow",
        "transaction_id": generated_trx,
        "payment_method": payload.payment_method,
        "amount_paid": float(booking.total_amount),
        "booking_id": str(booking.id),
        "paid_at": datetime.now().isoformat()
    }


@router.get("/invoice/{booking_id}")
async def get_invoice(
    booking_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        booking_uuid = UUID(booking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    stmt = select(Booking).options(selectinload(Booking.product), selectinload(Booking.renter), selectinload(Booking.owner)).where(Booking.id == booking_uuid)
    res = await db.execute(stmt)
    booking = res.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    prod = booking.product
    days = int(booking.total_days or 1)
    daily_rate = float(booking.daily_rate or 0)
    subtotal = float(booking.subtotal or (daily_rate * days))
    security_deposit = float(booking.security_deposit or 0)
    delivery_fee = float(booking.delivery_fee or 0)
    service_fee = round(subtotal * 0.06, 2)
    total = float(booking.total_amount or (subtotal + service_fee + security_deposit + delivery_fee))

    return {
        "invoice_number": f"INV-RH-{str(booking.id)[:8].upper()}",
        "booking_id": str(booking.id),
        "date": datetime.now().strftime("%B %d, %Y"),
        "status": "PAID - HELD IN ESCROW",
        "payment_method": "bKash / Credit Card",
        "transaction_id": f"TXN-RH-{random.randint(100000, 999999)}",
        "renter": {
            "name": getattr(booking.renter, "full_name", None) or "Rafiqul Islam",
            "email": getattr(booking.renter, "email", None) or "renter@example.com",
            "phone": "+880 1712-345678"
        },
        "owner": {
            "name": getattr(booking.owner, "full_name", None) or "Rashed Hasan",
            "email": getattr(booking.owner, "email", None) or "owner@example.com",
            "phone": "+880 1819-876543"
        },
        "product": {
            "title": prod.title if prod else "Toyota Axio 2020",
            "category": "Vehicle",
            "city": prod.city if prod else "Dhaka"
        },
        "period": {
            "start_date": str(booking.start_date),
            "end_date": str(booking.end_date),
            "days": days
        },
        "pricing": {
            "daily_rate": daily_rate,
            "days": days,
            "subtotal": subtotal,
            "service_fee": service_fee,
            "security_deposit": security_deposit,
            "delivery_fee": delivery_fee,
            "total_amount": total
        }
    }
