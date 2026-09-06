"""
Seed realistic owner products, bookings, payouts, and reviews for Jahid Hasan & Washim Akram
"""
import asyncio
import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select, func, and_
from app.database.session import AsyncSessionLocal
from app.models.user import User, Role
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.booking import Booking, Review
from app.models.payout import Payout
from app.models.payment import Payment

async def seed_owner_ecosystem():
    async with AsyncSessionLocal() as db:
        print("Finding or creating demo owners (Jahid Hasan & Washim Akram)...")
        
        # 1. Jahid Hasan
        jahid = await db.scalar(select(User).where(User.email == "jahid1234@gmail.com"))
        if not jahid:
            jahid = await db.scalar(select(User).where(User.email.ilike("%jahid%")))
        
        # 2. Washim Akram
        washim = await db.scalar(select(User).where(User.email == "washimakram013099@gmail.com"))

        # Find customers to rent from them
        customers_res = await db.execute(
            select(User).where(User.email.notin_(["jahid1234@gmail.com", "washimakram013099@gmail.com", "admin@renthub.com.bd"])).limit(10)
        )
        customers = customers_res.scalars().all()
        if not customers:
            print("No customer users found!")
            return

        # Categories
        cat_res = await db.execute(select(Category))
        categories = {c.slug: c for c in cat_res.scalars().all()}
        default_cat = list(categories.values())[0] if categories else None

        target_owners = [u for u in [jahid, washim] if u is not None]
        print(f"Target owners: {[u.first_name + ' ' + u.last_name for u in target_owners]}")

        # Items catalog to create if owner has few products
        catalog_templates = [
            ("Toyota Axio Hybrid 2020", "vehicles", 2800.0, "Dhaka", "Gulshan-2", "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"),
            ("Canon EOS R5 Full-Frame Camera + 24-70mm Lens", "cameras", 2200.0, "Dhaka", "Dhanmondi", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"),
            ("Sony Alpha A7 IV Mirrorless 4K Cinema Kit", "cameras", 2500.0, "Dhaka", "Banani", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"),
            ("DJI Mavic 3 Pro Cine Drone with 4K Hasselblad", "electronics", 3500.0, "Dhaka", "Uttara", "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80"),
            ("Apple MacBook Pro 16\" M3 Max (36GB RAM)", "electronics", 2000.0, "Dhaka", "Bashundhara R/A", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"),
            ("Yamaha R15 V4 Sports Bike 155cc", "vehicles", 1200.0, "Dhaka", "Mirpur-10", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"),
            ("Honda CB Hornet 160R Commuter Bike", "vehicles", 900.0, "Dhaka", "Mohammadpur", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"),
            ("Luxury Bridal Silk Wedding Lehenga by Sabyasachi", "clothing", 1800.0, "Dhaka", "Gulshan-1", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"),
            ("JBL PartyBox 310 Bluetooth Sound System", "electronics", 1500.0, "Dhaka", "Badda", "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"),
            ("PlayStation 5 Console + 2 DualSense Controllers & FIFA 24", "electronics", 1000.0, "Dhaka", "Khilgaon", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"),
            ("Trek Marlin 7 Gen 3 Hydraulic Mountain Bicycle", "sports", 600.0, "Dhaka", "Dhanmondi", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"),
            ("Luxury 3-BHK Furnished Serviced Apartment", "apartments", 4500.0, "Dhaka", "Baridhara DOHS", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"),
        ]

        today = date.today()

        for owner in target_owners:
            # Ensure owner role
            owner_role = await db.scalar(select(Role).where(Role.name.in_(["owner", "lister", "admin"])))
            if owner_role and owner_role not in owner.roles:
                owner.roles.append(owner_role)

            # Check owner products
            existing_products = (await db.execute(select(Product).where(Product.owner_id == owner.id))).scalars().all()
            if len(existing_products) < 6:
                print(f"Adding catalog products for {owner.first_name}...")
                for item in catalog_templates:
                    slug_base = item[0].lower().replace(" ", "-").replace('"', "").replace("+", "")
                    slug = f"{slug_base}-{str(uuid.uuid4())[:6]}"
                    cat_obj = categories.get(item[1], default_cat)
                    prod = Product(
                        owner_id=owner.id,
                        category_id=cat_obj.id if cat_obj else None,
                        title=item[0],
                        slug=slug,
                        description=f"Authentic {item[0]} available for rent in {item[3]}, {item[4]}. Fully sanitized, serviced, and ready for immediate pickup or delivery.",
                        price_per_day=item[2],
                        security_deposit=item[2] * 2,
                        condition="like_new",
                        delivery_option="both",
                        status="ACTIVE",
                        is_active=True,
                        city=item[3],
                        area=item[4],
                        avg_rating=4.9,
                        review_count=18,
                        is_featured=True,
                        is_trending=True
                    )
                    db.add(prod)
                    await db.flush()
                    img = ProductImage(product_id=prod.id, url=item[5], is_primary=True, sort_order=0)
                    db.add(img)
                await db.commit()

            # Refresh owner products
            owner_products = (await db.execute(select(Product).where(Product.owner_id == owner.id))).scalars().all()
            print(f"{owner.first_name} now has {len(owner_products)} products.")

            # Create realistic bookings for this owner
            # 1. 5 Pending Booking Requests
            # 2. 4 Active/Confirmed Bookings
            # 3. 12 Completed Bookings
            print(f"Creating bookings ecosystem for {owner.first_name}...")
            
            # 5 Pending Requests
            for idx in range(5):
                prod = owner_products[idx % len(owner_products)]
                cust = customers[idx % len(customers)]
                start = today + timedelta(days=idx + 1)
                end = start + timedelta(days=2 + idx % 3)
                total_days = (end - start).days
                subtotal = float(prod.price_per_day) * total_days
                deposit = float(prod.security_deposit)
                total = subtotal + deposit
                
                b = Booking(
                    product_id=prod.id,
                    renter_id=cust.id,
                    owner_id=owner.id,
                    start_date=start,
                    end_date=end,
                    total_days=total_days,
                    daily_rate=float(prod.price_per_day),
                    subtotal=subtotal,
                    security_deposit=deposit,
                    delivery_fee=0.0,
                    total_amount=total,
                    status="pending",
                    delivery_option="pickup",
                    notes="Looking forward to picking this up on schedule. Verified via NID."
                )
                db.add(b)

            # 4 Active Bookings
            for idx in range(4):
                prod = owner_products[(idx + 2) % len(owner_products)]
                cust = customers[(idx + 3) % len(customers)]
                start = today - timedelta(days=2)
                end = today + timedelta(days=3 + idx)
                total_days = (end - start).days
                subtotal = float(prod.price_per_day) * total_days
                deposit = float(prod.security_deposit)
                total = subtotal + deposit

                b = Booking(
                    product_id=prod.id,
                    renter_id=cust.id,
                    owner_id=owner.id,
                    start_date=start,
                    end_date=end,
                    total_days=total_days,
                    daily_rate=float(prod.price_per_day),
                    subtotal=subtotal,
                    security_deposit=deposit,
                    delivery_fee=0.0,
                    total_amount=total,
                    status="active",
                    delivery_option="delivery",
                    notes="Delivered to customer address."
                )
                db.add(b)

            # 12 Completed Bookings across this month & last month
            for idx in range(12):
                prod = owner_products[(idx + 4) % len(owner_products)]
                cust = customers[(idx + 1) % len(customers)]
                start = today - timedelta(days=15 + idx * 3)
                end = start + timedelta(days=2 + (idx % 2))
                total_days = (end - start).days
                subtotal = float(prod.price_per_day) * total_days
                deposit = float(prod.security_deposit)
                total = subtotal + deposit

                b = Booking(
                    product_id=prod.id,
                    renter_id=cust.id,
                    owner_id=owner.id,
                    start_date=start,
                    end_date=end,
                    total_days=total_days,
                    daily_rate=float(prod.price_per_day),
                    subtotal=subtotal,
                    security_deposit=deposit,
                    delivery_fee=0.0,
                    total_amount=total,
                    status="completed",
                    delivery_option="pickup",
                    notes="Rental completed safely and item returned in pristine condition."
                )
                db.add(b)
                await db.flush()

                # Add Review
                rev = Review(
                    booking_id=b.id,
                    reviewer_id=cust.id,
                    reviewee_id=owner.id,
                    product_id=prod.id,
                    rating=5.0 if idx % 3 != 0 else 4.8,
                    comment="Excellent condition, highly cooperative owner and smooth handover!",
                    type="product",
                    status="published"
                )
                db.add(rev)

            # Payout records for this owner
            p1 = Payout(
                payout_id=f"PO-{owner.first_name[:3].upper()}-2041",
                owner_id=owner.id,
                gross_amount=38500.0,
                commission_rate=10.0,
                commission_amount=3850.0,
                net_amount=34650.0,
                earnings_period="Aug 1–15, 2026",
                payout_method="bank_transfer",
                bank_name="BRAC Bank (Gulshan Branch)",
                account_number="150120...001",
                status="paid",
                disbursed_at=datetime.now(timezone.utc) - timedelta(days=5),
                notes="Automated bi-weekly settlement"
            )
            p2 = Payout(
                payout_id=f"PO-{owner.first_name[:3].upper()}-2042",
                owner_id=owner.id,
                gross_amount=24500.0,
                commission_rate=10.0,
                commission_amount=2450.0,
                net_amount=22050.0,
                earnings_period="Aug 16–25, 2026",
                payout_method="bkash",
                account_number="01712-345678",
                status="pending",
                notes="Current cycle settlement"
            )
            db.add(p1)
            db.add(p2)

        await db.commit()
        print("Successfully seeded owner ecosystem for Jahid Hasan & Washim Akram!")

if __name__ == "__main__":
    asyncio.run(seed_owner_ecosystem())
