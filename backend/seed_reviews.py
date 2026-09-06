import asyncio
import os
import sys
import random
from datetime import datetime, timedelta, timezone
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database.session import AsyncSessionLocal
from app.models.booking import Booking, Review
from app.models.product import Product
from app.models.user import User
from sqlalchemy import select, text

AUTHENTIC_REVIEWS_5 = [
    ("Good car and smooth experience. Owner was very helpful.", "product"),
    ("The camera quality is excellent. 100% Recommended for wedding shoots!", "product"),
    ("Amazing host! Very cooperative and provided clean accessories.", "owner"),
    ("Renter returned the DSLR in pristine condition. Highly trusted customer.", "customer"),
    ("Vehicle was well maintained, smooth AC and very fuel efficient.", "product"),
    ("Apartment in Sylhet had wonderful views and prompt WiFi.", "product"),
    ("Top notch audio gears. Saved our sound engineering event!", "product"),
    ("Punctual and very respectful renter. Will gladly rent again.", "customer"),
    ("Sony Alpha 7 IV was spotless with all prime lenses included.", "product"),
    ("Great generator backup during our outdoor photoshoot.", "product"),
    ("The tent and hiking gear were top quality for Sajek valley trip.", "product"),
    ("Extremely professional owner, guided me through camera settings.", "owner"),
]

AUTHENTIC_REVIEWS_4 = [
    ("Everything was good, slight delay in pickup but overall great.", "product"),
    ("Nice experience with the bike, helmet was slightly worn.", "product"),
    ("Comfortable stay, could improve bathroom lighting slightly.", "product"),
    ("Good laptop performance, battery life was around 4 hours.", "product"),
    ("Cooperative owner, quick handover in Banani.", "owner"),
]

AUTHENTIC_REVIEWS_3 = [
    ("Average experience. The drone battery ran out faster than expected.", "product"),
    ("Car was okay, but needed washing before handover.", "product"),
    ("Renter was slightly late for return, but communicated in advance.", "customer"),
]

AUTHENTIC_REVIEWS_LOW = [
    ("The apartment was not clean and the AC was not working properly.", "product", "reported", "Misleading amenities description and unclean room."),
    ("Very bad behavior from the owner. Not recommended at all!", "owner", "hidden", "Rude behavior and unexpected extra charges demanded."),
    ("The camera had sensor spots visible in daylight shots.", "product", "published", None),
    ("Speaker stopped working after 30 minutes. Ruined our party.", "product", "reported", "Defective equipment provided."),
    ("Vehicle broke down on highway due to overdue engine oil.", "product", "reported", "Vehicle was not properly serviced before rental."),
    ("Renter scratched the bike silencer and refused to acknowledge.", "customer", "reported", "Physical damage to rented vehicle."),
]

async def seed_reviews():
    async with AsyncSessionLocal() as db:
        # Check existing bookings
        b_res = await db.execute(
            select(Booking).options(
                selectinload(Booking.product),
                selectinload(Booking.renter),
                selectinload(Booking.owner)
            )
        )
        bookings = b_res.scalars().all()
        
        if not bookings:
            print("No bookings found to attach reviews.")
            return

        print(f"Found {len(bookings)} bookings. Generating rich authentic reviews...")

        # Clear existing reviews to ensure clean state
        await db.execute(text("DELETE FROM reviews;"))
        await db.commit()

        users_res = await db.execute(select(User))
        all_users = users_res.scalars().all()
        user_ids = [u.id for u in all_users]

        created_reviews = []
        now = datetime.now(timezone.utc)

        # 1. Generate 5-star & 4-star positive reviews
        for i, b in enumerate(bookings):
            if not b.product or not b.renter_id or not b.owner_id:
                continue

            # Randomize review date within booking range
            b_date = b.created_at or (now - timedelta(days=random.randint(1, 180)))
            r_date = b_date + timedelta(days=random.randint(1, 3), hours=random.randint(1, 12))

            # Distribute ratings
            tier_rand = random.random()
            if tier_rand < 0.62:  # 62% 5-Star
                comm, r_type = random.choice(AUTHENTIC_REVIEWS_5)
                rating = 5.0
                status_val = "published"
                rep_by = None
                rep_reason = None
            elif tier_rand < 0.85:  # 23% 4-Star
                comm, r_type = random.choice(AUTHENTIC_REVIEWS_4)
                rating = 4.0
                status_val = "published"
                rep_by = None
                rep_reason = None
            elif tier_rand < 0.93:  # 8% 3-Star
                comm, r_type = random.choice(AUTHENTIC_REVIEWS_3)
                rating = 3.0
                status_val = "published"
                rep_by = None
                rep_reason = None
            else:  # 7% Low / Reported (1 or 2 Star)
                item = random.choice(AUTHENTIC_REVIEWS_LOW)
                comm = item[0]
                r_type = item[1]
                status_val = item[2]
                rep_reason = item[3]
                rating = random.choice([1.0, 2.0])
                rep_by = random.choice(user_ids) if status_val == "reported" else None

            rev = Review(
                booking_id=b.id,
                reviewer_id=b.renter_id if r_type in ["product", "owner"] else b.owner_id,
                reviewee_id=b.owner_id if r_type in ["product", "owner"] else b.renter_id,
                product_id=b.product_id,
                rating=rating,
                comment=comm,
                type=r_type,
                status=status_val,
                reported_by=rep_by,
                report_reason=rep_reason,
                created_at=r_date,
                updated_at=r_date
            )
            created_reviews.append(rev)

        # 2. Add extra specific highlighted reviews matching the screenshot
        if len(bookings) >= 4:
            b1, b2, b3, b4 = bookings[0], bookings[1], bookings[2], bookings[3]
            
            extra_custom = [
                Review(
                    booking_id=b1.id,
                    reviewer_id=b1.renter_id,
                    reviewee_id=b1.owner_id,
                    product_id=b1.product_id,
                    rating=5.0,
                    comment="Good car and smooth experience. Owner was very helpful.",
                    type="product",
                    status="published",
                    created_at=now - timedelta(hours=2)
                ),
                Review(
                    booking_id=b2.id,
                    reviewer_id=b2.renter_id,
                    reviewee_id=b2.owner_id,
                    product_id=b2.product_id,
                    rating=5.0,
                    comment="The camera quality is excellent. Recommended!",
                    type="product",
                    status="published",
                    created_at=now - timedelta(hours=14)
                ),
                Review(
                    booking_id=b3.id,
                    reviewer_id=b3.renter_id,
                    reviewee_id=b3.owner_id,
                    product_id=b3.product_id,
                    rating=2.0,
                    comment="The apartment was not clean and the AC was not working properly.",
                    type="product",
                    status="reported",
                    reported_by=b3.owner_id,
                    report_reason="Unfair review, guest damaged remote control.",
                    created_at=now - timedelta(days=1, hours=4)
                ),
                Review(
                    booking_id=b4.id,
                    reviewer_id=b4.renter_id,
                    reviewee_id=b4.owner_id,
                    product_id=b4.product_id,
                    rating=1.0,
                    comment="Very bad behavior from the owner. Not recommended!",
                    type="owner",
                    status="hidden",
                    report_reason="Inappropriate language and abusive remarks.",
                    created_at=now - timedelta(days=2, hours=6)
                ),
            ]
            created_reviews.extend(extra_custom)

        db.add_all(created_reviews)
        await db.commit()
        print(f"Successfully seeded {len(created_reviews)} authentic reviews!")

if __name__ == "__main__":
    from sqlalchemy.orm import selectinload
    asyncio.run(seed_reviews())
