import asyncio
import os
import sys
import random
from datetime import datetime, timedelta, date, timezone
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.session import AsyncSessionLocal
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

PERIODS = [
    ("Aug 1–15, 2026", date(2026, 8, 1), date(2026, 8, 15)),
    ("Aug 16–25, 2026", date(2026, 8, 16), date(2026, 8, 25)),
    ("Jul 16–31, 2026", date(2026, 7, 16), date(2026, 7, 31)),
    ("Jul 1–15, 2026", date(2026, 7, 1), date(2026, 7, 15)),
]

async def seed_payouts():
    async with AsyncSessionLocal() as db:
        # Find owners who have products or bookings
        prod_owners = await db.execute(select(Product.owner_id).distinct())
        owner_ids = [r[0] for r in prod_owners.all() if r[0]]

        if not owner_ids:
            all_u = await db.execute(select(User.id).limit(15))
            owner_ids = [r[0] for r in all_u.all()]

        print(f"Generating realistic payout records for {len(owner_ids)} owners...")
        await db.execute(text("DELETE FROM payouts;"))
        await db.commit()

        created_payouts = []
        now = datetime.now(timezone.utc)
        payout_seq = 2042

        for idx, o_id in enumerate(owner_ids):
            # Fetch user details
            u = await db.get(User, o_id)
            owner_name = f"{u.first_name} {u.last_name}" if u else "Host Owner"
            phone = u.phone if u and u.phone else f"017{random.randint(10000000, 99999999)}"

            for p_idx, (period_label, p_start, p_end) in enumerate(PERIODS):
                payout_seq += 1
                po_id = f"PAYOUT-{payout_seq}"

                gross = round(float(random.randint(6000, 48000)), 2)
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
                if p_idx == 0:  # Aug 1–15
                    status_val = "pending" if random.random() < 0.6 else "paid"
                elif p_idx == 1:  # Aug 16–25
                    status_val = "pending"
                else:  # July
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

        # Highlighted records matching user prompt:
        # Rahim Hasan ৳12,500 Aug 1–15 Bank Pending Approve
        # Karim Ahmed ৳8,200 Aug 1–15 bKash Paid View
        if len(owner_ids) >= 2:
            created_payouts.insert(0, Payout(
                payout_id="PAYOUT-2041",
                owner_id=owner_ids[0],
                gross_amount=13888.88,
                commission_rate=10.00,
                commission_amount=1388.88,
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
            created_payouts.insert(1, Payout(
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

        db.add_all(created_payouts)
        await db.commit()
        print(f"Successfully seeded {len(created_payouts)} owner payout records!")

if __name__ == "__main__":
    asyncio.run(seed_payouts())
