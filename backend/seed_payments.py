import asyncio
import os
import sys
import random
from datetime import datetime, timedelta, timezone
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.session import AsyncSessionLocal
from app.models.booking import Booking
from app.models.payment import Payment
from sqlalchemy import select, text

METHODS = [
    ("bkash", "bKash Merchant Checkout", "BK-"),
    ("nagad", "Nagad Digital PGW", "NG-"),
    ("card", "SSLCommerz Visa/MasterCard", "SSL-"),
    ("rocket", "DBBL Rocket Payment", "RK-"),
    ("bank_transfer", "BRAC Bank Directwire", "BT-"),
]

FAILED_REASONS = [
    ("ERR_INSUFFICIENT_FUNDS", "Customer account balance was insufficient for this rental amount."),
    ("ERR_PIN_TIMEOUT", "Customer failed to enter bKash/Nagad PIN within the 120s window."),
    ("ERR_OTP_EXPIRED", "One-Time Password expired before verification."),
    ("ERR_CARD_DECLINED", "Card issuing bank declined international or high-value online transaction."),
    ("ERR_NETWORK_TIMEOUT", "Gateway communication interrupted during payment verification."),
]

REFUND_REASONS = [
    "Booking cancelled by renter within the 100% full refund grace period.",
    "Owner was unable to handover vehicle on requested date.",
    "Item condition disputed and verified upon inspection.",
    "Security deposit returned after seamless rental completion.",
]

async def seed_payments():
    async with AsyncSessionLocal() as db:
        b_res = await db.execute(select(Booking))
        bookings = b_res.scalars().all()

        if not bookings:
            print("No bookings found to create payments.")
            return

        print(f"Generating realistic payment records for {len(bookings)} bookings...")
        await db.execute(text("DELETE FROM payments;"))
        await db.commit()

        created_payments = []
        now = datetime.now(timezone.utc)

        for i, b in enumerate(bookings):
            if not b.renter_id or not b.owner_id:
                continue

            method_key, channel, prefix = random.choice(METHODS)
            trx_num = 1026 + i
            txn_id = f"TXN-{trx_num}"
            gateway_trx = f"{prefix}{random.randint(1000000, 9999999)}"

            amt = float(b.total_amount or random.randint(1500, 45000))
            subtotal = round(amt * 0.85, 2)
            service_fee = round(subtotal * 0.06, 2)
            deposit = round(amt * 0.09, 2)

            created_time = b.created_at or (now - timedelta(days=random.randint(1, 180)))

            # Determine status
            if b.status in ["confirmed", "active", "completed"]:
                p_status = "paid"
                escrow = "held" if b.status in ["confirmed", "active"] else "released"
                fail_reason = None
                fail_code = None
                ref_amt = None
                ref_reason = None
                ref_trx = None
                ref_at = None
            elif b.status in ["cancelled", "rejected"]:
                if random.random() < 0.6:
                    p_status = "refunded"
                    escrow = "refunded"
                    fail_reason = None
                    fail_code = None
                    ref_amt = amt
                    ref_reason = random.choice(REFUND_REASONS)
                    ref_trx = f"REF-{random.randint(100000, 999999)}"
                    ref_at = created_time + timedelta(hours=random.randint(2, 24))
                else:
                    p_status = "failed"
                    escrow = "disputed"
                    f_code, f_reason = random.choice(FAILED_REASONS)
                    fail_code = f_code
                    fail_reason = f_reason
                    ref_amt = None
                    ref_reason = None
                    ref_trx = None
                    ref_at = None
            else:  # pending
                p_status = "pending"
                escrow = "held"
                fail_reason = None
                fail_code = None
                ref_amt = None
                ref_reason = None
                ref_trx = None
                ref_at = None

            pm = Payment(
                transaction_id=txn_id,
                gateway_trx_id=gateway_trx,
                booking_id=b.id,
                customer_id=b.renter_id,
                owner_id=b.owner_id,
                amount=amt,
                subtotal=subtotal,
                service_fee=service_fee,
                security_deposit=deposit,
                delivery_fee=0.0,
                payment_method=method_key,
                payment_channel=channel,
                status=p_status,
                currency="BDT",
                escrow_status=escrow,
                failure_reason=fail_reason,
                failure_code=fail_code,
                refund_amount=ref_amt,
                refund_reason=ref_reason,
                refund_trx_id=ref_trx,
                refunded_at=ref_at,
                created_at=created_time,
                updated_at=created_time
            )
            created_payments.append(pm)

        # Add specific highlighted payments matching user demo
        if len(bookings) >= 2:
            b1, b2 = bookings[0], bookings[1]
            created_payments.insert(0, Payment(
                transaction_id="TXN-1024",
                gateway_trx_id="BK-9482711",
                booking_id=b1.id,
                customer_id=b1.renter_id,
                owner_id=b1.owner_id,
                amount=2500.00,
                subtotal=2200.00,
                service_fee=132.00,
                security_deposit=168.00,
                payment_method="bkash",
                payment_channel="bKash Merchant Checkout",
                status="paid",
                currency="BDT",
                escrow_status="held",
                created_at=now - timedelta(minutes=15),
                updated_at=now - timedelta(minutes=15)
            ))
            created_payments.insert(1, Payment(
                transaction_id="TXN-1025",
                gateway_trx_id="SSL-8821903",
                booking_id=b2.id,
                customer_id=b2.renter_id,
                owner_id=b2.owner_id,
                amount=1800.00,
                subtotal=1600.00,
                service_fee=96.00,
                security_deposit=104.00,
                payment_method="card",
                payment_channel="SSLCommerz Visa/MasterCard",
                status="pending",
                currency="BDT",
                escrow_status="held",
                created_at=now - timedelta(minutes=45),
                updated_at=now - timedelta(minutes=45)
            ))

        db.add_all(created_payments)
        await db.commit()
        print(f"Successfully seeded {len(created_payments)} payment transactions!")

if __name__ == "__main__":
    asyncio.run(seed_payments())
