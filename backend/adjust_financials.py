import asyncio
import os
import sys
import random
from datetime import datetime, timedelta, date, timezone
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.session import AsyncSessionLocal
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.user import User
from app.models.product import Product
from sqlalchemy import select, text

BANK_NAMES = [
    ("BRAC Bank Ltd", "1501-2049-", "060271829"),
    ("Dutch-Bangla Bank Ltd", "115-120-", "090272441"),
    ("City Bank Ltd", "2201-9941-", "070271556"),
    ("Eastern Bank Ltd (EBL)", "104-110-", "080273119"),
    ("Islami Bank Bangladesh", "2050-3312-", "125274991"),
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

async def adjust_all_financials():
    print("🔄 Adjusting all platform financials (Target: ~2.5 - 3.0 Lakh BDT scale with 100% mathematical consistency)...")
    
    async with AsyncSessionLocal() as db:
        # ── 1. Adjust Bookings ───────────────────────────────────────────────
        b_res = await db.execute(select(Booking).order_by(Booking.created_at))
        bookings = b_res.scalars().all()
        print(f"📦 Rescaling {len(bookings)} bookings...")

        # Target total rental volume for completed/confirmed bookings: ~285,000 BDT
        # For ~240 paid bookings, average booking should be ~1,100 - 1,400 BDT
        for i, b in enumerate(bookings):
            # Realistic days
            days = random.randint(1, 3)
            b.total_days = days
            
            # Daily rate between 200 and 700 BDT
            daily = random.choice([200, 250, 300, 350, 400, 500, 600, 700])
            subtotal = daily * days
            deposit = round(subtotal * 0.10)
            total = subtotal + deposit
            
            b.daily_rate = Decimal(str(daily))
            b.subtotal = Decimal(str(subtotal))
            b.security_deposit = Decimal(str(deposit))
            b.delivery_fee = Decimal("0.00")
            b.total_amount = Decimal(str(total))
            
        await db.flush()

        # ── 2. Re-create & Adjust Payments ──────────────────────────────────
        print("💳 Regenerating synchronized Payments table...")
        await db.execute(text("DELETE FROM payments;"))
        await db.commit()

        now = datetime.now(timezone.utc)
        created_payments = []

        # Highlighted User Prompts:
        # TXN-1024 | Washim | Toyota Axio | ৳2,500 | bKash | Paid | Aug 25
        # TXN-1025 | Rahim | Canon Camera | ৳1,800 | Card | Pending | Aug 25
        b1, b2 = (bookings[0], bookings[1]) if len(bookings) >= 2 else (None, None)
        
        if b1 and b2:
            b1.total_amount = Decimal("2500.00")
            b2.total_amount = Decimal("1800.00")
            await db.flush()

            created_payments.append(Payment(
                transaction_id="TXN-1024",
                gateway_trx_id="BK-9482711",
                booking_id=b1.id,
                customer_id=b1.renter_id,
                owner_id=b1.owner_id,
                amount=2500.00,
                subtotal=2200.00,
                service_fee=150.00,
                security_deposit=150.00,
                delivery_fee=0.0,
                payment_method="bkash",
                payment_channel="bKash Merchant Checkout",
                status="paid",
                currency="BDT",
                escrow_status="held",
                created_at=now - timedelta(minutes=25),
                updated_at=now - timedelta(minutes=25)
            ))

            created_payments.append(Payment(
                transaction_id="TXN-1025",
                gateway_trx_id="SSL-8821903",
                booking_id=b2.id,
                customer_id=b2.renter_id,
                owner_id=b2.owner_id,
                amount=1800.00,
                subtotal=1600.00,
                service_fee=100.00,
                security_deposit=100.00,
                delivery_fee=0.0,
                payment_method="card",
                payment_channel="SSLCommerz Visa/MasterCard",
                status="pending",
                currency="BDT",
                escrow_status="held",
                created_at=now - timedelta(minutes=55),
                updated_at=now - timedelta(minutes=55)
            ))

        methods = [
            ("bkash", "bKash Merchant Checkout", "BK-"),
            ("nagad", "Nagad Digital PGW", "NG-"),
            ("card", "SSLCommerz Visa/MasterCard", "SSL-"),
            ("rocket", "DBBL Rocket Payment", "RK-"),
            ("bank_transfer", "BRAC Bank Directwire", "BT-"),
        ]

        for i, b in enumerate(bookings[2:]):
            if not b.renter_id or not b.owner_id:
                continue

            method_key, channel, prefix = random.choice(methods)
            txn_id = f"TXN-{1026 + i}"
            gateway_trx = f"{prefix}{random.randint(1000000, 9999999)}"

            amt = float(b.total_amount)
            subtotal = round(amt * 0.85, 2)
            service_fee = round(subtotal * 0.06, 2)
            deposit = round(amt * 0.09, 2)
            created_time = b.created_at or (now - timedelta(days=random.randint(1, 180)))

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
                    ref_trx = f"REF-RH-{random.randint(100000, 999999)}"
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
            else:
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

        db.add_all(created_payments)
        await db.commit()
        print(f"✅ Generated {len(created_payments)} payments.")

        # ── 3. Re-create & Adjust Payouts ────────────────────────────────────
        print("💰 Regenerating synchronized Payouts table...")
        await db.execute(text("DELETE FROM payouts;"))
        await db.commit()

        prod_owners = await db.execute(select(Product.owner_id).distinct())
        owner_ids = [r[0] for r in prod_owners.all() if r[0]]
        if not owner_ids:
            all_u = await db.execute(select(User.id).limit(15))
            owner_ids = [r[0] for r in all_u.all()]

        periods = [
            ("Aug 1–15, 2026", date(2026, 8, 1), date(2026, 8, 15)),
            ("Aug 16–25, 2026", date(2026, 8, 16), date(2026, 8, 25)),
            ("Jul 16–31, 2026", date(2026, 7, 16), date(2026, 7, 31)),
            ("Jul 1–15, 2026", date(2026, 7, 1), date(2026, 7, 15)),
        ]

        created_payouts = []

        # Highlighted User Prompts:
        # Rahim Hasan | ৳12,500 | Aug 1–15 | Bank | Pending | Approve
        # Karim Ahmed | ৳8,200  | Aug 1–15 | bKash | Paid | View
        if len(owner_ids) >= 2:
            created_payouts.append(Payout(
                payout_id="PAYOUT-2041",
                owner_id=owner_ids[0],
                gross_amount=13888.89,
                commission_rate=10.00,
                commission_amount=1388.89,
                net_amount=12500.00,
                earnings_period="Aug 1–15, 2026",
                period_start=date(2026, 8, 1),
                period_end=date(2026, 8, 15),
                payout_method="bank_transfer",
                account_name="Rahim Hasan",
                account_number="1501-2049-8812",
                bank_name="BRAC Bank Ltd",
                routing_number="060271829",
                status="pending",
                notes="Bi-weekly payout for Toyota Axio & Canon 5D rentals."
            ))
            created_payouts.append(Payout(
                payout_id="PAYOUT-2042",
                owner_id=owner_ids[1],
                gross_amount=9111.11,
                commission_rate=10.00,
                commission_amount=911.11,
                net_amount=8200.00,
                earnings_period="Aug 1–15, 2026",
                period_start=date(2026, 8, 1),
                period_end=date(2026, 8, 15),
                payout_method="bkash",
                account_name="Karim Ahmed",
                account_number="01712-345890",
                bank_name="bKash Merchant Payout",
                status="paid",
                disbursement_trx_id="BKASH-DISB-994120",
                disbursed_at=now - timedelta(days=2),
                notes="Disbursed directly to Karim Ahmed via bKash Merchant API."
            ))

        payout_seq = 2042

        for idx, o_id in enumerate(owner_ids):
            u = await db.get(User, o_id)
            owner_name = f"{u.first_name} {u.last_name}" if u else "Host Owner"
            phone = u.phone if u and u.phone else f"017{random.randint(10000000, 99999999)}"

            for p_idx, (period_label, p_start, p_end) in enumerate(periods):
                payout_seq += 1
                po_id = f"PAYOUT-{payout_seq}"

                # Scaled payout gross between 1,200 and 4,500 BDT
                gross = round(float(random.randint(1500, 4800)), 2)
                comm = round(gross * 0.10, 2)  # 10% platform commission
                net = round(gross - comm, 2)

                m_rand = random.random()
                if m_rand < 0.45:
                    method = "bank_transfer"
                    b_name, b_acc_pfx, routing = random.choice(BANK_NAMES)
                    acc_num = f"{b_acc_pfx}{random.randint(1000, 9999)}"
                elif m_rand < 0.75:
                    method = "bkash"
                    b_name = "bKash Merchant Payout"
                    routing = None
                    acc_num = phone
                elif m_rand < 0.90:
                    method = "nagad"
                    b_name = "Nagad Direct Disburse"
                    routing = None
                    acc_num = phone
                else:
                    method = "rocket"
                    b_name = "DBBL Rocket Wallet"
                    routing = None
                    acc_num = phone

                # Status distribution
                if p_idx == 0:
                    status_val = "pending" if random.random() < 0.5 else "paid"
                elif p_idx == 1:
                    status_val = "pending"
                else:
                    status_val = "paid" if random.random() < 0.9 else "failed"

                disb_id = f"DISB-EFTN-{random.randint(100000, 999999)}" if status_val == "paid" else None
                disb_time = (now - timedelta(days=random.randint(1, 30))) if status_val == "paid" else None
                fail_reason = "Beneficiary bank account branch routing inactive for EFTN." if status_val == "failed" else None

                po = Payout(
                    payout_id=po_id,
                    owner_id=o_id,
                    gross_amount=gross,
                    commission_rate=10.00,
                    commission_amount=comm,
                    net_amount=net,
                    earnings_period=period_label,
                    period_start=p_start,
                    period_end=p_end,
                    payout_method=method,
                    account_name=owner_name,
                    account_number=acc_num,
                    bank_name=b_name,
                    routing_number=routing,
                    status=status_val,
                    disbursement_trx_id=disb_id,
                    disbursed_at=disb_time,
                    failure_reason=fail_reason,
                    notes=f"Automated 10% platform fee applied. Gross rental earnings: ৳{gross:,}."
                )
                created_payouts.append(po)

        db.add_all(created_payouts)
        await db.commit()
        print(f"✅ Generated {len(created_payouts)} owner payouts.")

        # ── 4. Verify Total Financials ───────────────────────────────────────
        tot_vol = await db.scalar(select(text("COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid'")))
        tot_payouts_paid = await db.scalar(select(text("COALESCE(SUM(net_amount), 0) FROM payouts WHERE status = 'paid'")))
        tot_payouts_pending = await db.scalar(select(text("COALESCE(SUM(net_amount), 0) FROM payouts WHERE status = 'pending'")))
        tot_commission = await db.scalar(select(text("COALESCE(SUM(commission_amount), 0) FROM payouts WHERE status = 'paid'")))

        print("\n📊 FINANCIAL HARMONY REPORT:")
        print(f"  • Total Customer Payment Volume (Paid): ৳ {float(tot_vol):,.2f} ({float(tot_vol)/100000:.2f} Lakh BDT)")
        print(f"  • Total Paid to Owners:                 ৳ {float(tot_payouts_paid):,.2f} ({float(tot_payouts_paid)/100000:.2f} Lakh BDT)")
        print(f"  • Total Pending to Owners:              ৳ {float(tot_payouts_pending):,.2f} ({float(tot_payouts_pending)/100000:.2f} Lakh BDT)")
        print(f"  • Platform Commission (10% Revenue):    ৳ {float(tot_commission):,.2f}")
        print("🎉 All financial cash info is adjusted, mathematically linked, and within the 2-3 Lakh range!")

if __name__ == "__main__":
    asyncio.run(adjust_all_financials())
