import asyncio
import os
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, delete
from app.database.session import AsyncSessionLocal
from app.auth.password import hash_password
from app.models.user import User, Role, user_roles
from app.models.address import Address
from app.models.category import Category
from app.models.product import Product, ProductImage, Favorite
from app.models.booking import Booking, Review
from app.models.identity_verification import IdentityVerification, VerificationStatus

# ── Authentic Bangladeshi Datasets ──────────────────────────────────────────

BANGLADESH_USERS = [
    ("Tanvir", "Ahmed", "tanvir.ahmed@gmail.com", "+8801711234501", "VERIFIED", "owner"),
    ("Farhana", "Rahman", "farhana.rahman@yahoo.com", "+8801819234502", "VERIFIED", "owner"),
    ("Shakib", "Al Hasan", "shakib75@gmail.com", "+8801911234503", "VERIFIED", "customer"),
    ("Ayesha", "Siddiqua", "ayesha.siddiqua@hotmail.com", "+8801611234504", "VERIFIED", "customer"),
    ("Mehdi", "Hasan", "mehdi.hasan@gmail.com", "+8801712234505", "PENDING", "owner"),
    ("Tazreen", "Sultana", "tazreen.sultana@gmail.com", "+8801812234506", "VERIFIED", "customer"),
    ("Ariful", "Islam", "arif.hossain@gmail.com", "+8801912234507", "VERIFIED", "customer"),
    ("Nusrat", "Jahan", "nusrat.jahan@gmail.com", "+8801612234508", "MANUAL_REVIEW", "owner"),
    ("Salman", "Farsi", "salman.farsi@gmail.com", "+8801713234509", "VERIFIED", "customer"),
    ("Sadia", "Afrin", "sadia.afrin@gmail.com", "+8801813234510", "FAILED", "customer"),
    ("Mahfuzur", "Rahman", "mahfuz.rahman@gmail.com", "+8801913234511", "VERIFIED", "owner"),
    ("Rashedul", "Karim", "rashed.karim@gmail.com", "+8801613234512", "VERIFIED", "customer"),
    ("Sumaiya", "Akter", "sumaiya.akter@gmail.com", "+8801714234513", "VERIFIED", "customer"),
    ("Nazmul", "Huda", "nazmul.huda@gmail.com", "+8801814234514", "REVOKED", "owner"),
    ("Jannatul", "Ferdous", "jannat.ferdous@gmail.com", "+8801914234515", "VERIFIED", "customer"),
    ("Kazi", "Anisur", "kazi.anis@gmail.com", "+8801614234516", "VERIFIED", "owner"),
    ("Tanjina", "Chowdhury", "tanjina.c@gmail.com", "+8801715234517", "PENDING", "customer"),
    ("Faisal", "Mahmud", "faisal.mahmud@gmail.com", "+8801815234518", "VERIFIED", "owner"),
    ("Shirin", "Sharmin", "shirin.s@gmail.com", "+8801915234519", "VERIFIED", "customer"),
    ("Imran", "Kabir", "imran.kabir@gmail.com", "+8801615234520", "VERIFIED", "owner"),
    ("Tamanna", "Binte", "tamanna.b@gmail.com", "+8801716234521", "VERIFIED", "customer"),
    ("Zubair", "Hossain", "zubair.h@gmail.com", "+8801816234522", "VERIFIED", "owner"),
    ("Sabrina", "Momtaz", "sabrina.m@gmail.com", "+8801916234523", "VERIFIED", "customer"),
    ("Rakibul", "Hasan", "rakib.hasan@gmail.com", "+8801616234524", "MANUAL_REVIEW", "customer"),
    ("Rubel", "Hossain", "rubel.hossain@gmail.com", "+8801717234525", "VERIFIED", "customer"),
]

DHAKA_AREAS = [
    ("Gulshan 1", "Dhaka", "1212"),
    ("Gulshan 2", "Dhaka", "1212"),
    ("Banani", "Dhaka", "1213"),
    ("Dhanmondi", "Dhaka", "1209"),
    ("Uttara Sector 3", "Dhaka", "1230"),
    ("Uttara Sector 11", "Dhaka", "1230"),
    ("Mirpur DOHS", "Dhaka", "1216"),
    ("Bashundhara R/A", "Dhaka", "1229"),
    ("Mohakhali DOHS", "Dhaka", "1206"),
    ("Baridhara", "Dhaka", "1212"),
    ("Agrabad", "Chattogram", "4100"),
    ("Nasirabad", "Chattogram", "4000"),
    ("Kolatoli", "Cox's Bazar", "4700"),
    ("Zindabazar", "Sylhet", "3100"),
]

AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
]

PRODUCT_TEMPLATES = {
    "vehicles": [
        ("Toyota Premio 2018 F-Package", 3500, 7000, "Excellent condition, octane driven, chilling AC, chauffeur available.", "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80"),
        ("Toyota Prado TX Limited 2021", 12000, 25000, "7-seater luxury SUV with sunroof, leather interior, perfect for VIP events and long tours.", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"),
        ("Toyota Hiace Super GL 2019", 5500, 10000, "11-seater microbus, double AC, push start, ideal for family trips and corporate tours.", "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80"),
        ("Yamaha R15 V4 Racing Blue", 1500, 3000, "Dual channel ABS, quick shifter, fully maintained with official Yamalube.", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80"),
        ("Royal Enfield Classic 350 Stealth Black", 2200, 5000, "Iconic retro cruiser, dual disc ABS, thumping sound, perfect for highway rides.", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"),
        ("Honda Civic Turbo 2020", 6500, 15000, "Sunroof, paddle shift, sports mode, red interior trims, showroom condition.", "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"),
        ("BMW 520i M Sport 2021", 18000, 40000, "Executive luxury sedan, ambient lighting, Harman Kardon sound, flawless ride.", "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=80"),
        ("Suzuki Gixxer SF Fi ABS", 1200, 2500, "Aerodynamic sports tourer, excellent fuel economy, disc brakes.", "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80"),
    ],
    "electronics": [
        ("Apple MacBook Pro 16\" M3 Max (36GB/1TB)", 3200, 15000, "Space Black, Liquid Retina XDR, monster performance for 4K/8K video editing and coding.", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"),
        ("Sony PlayStation 5 Console + 2 DualSense + 5 Games", 1200, 5000, "4K 120fps gaming, includes Spider-Man 2, FC 24, God of War Ragnarok.", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80"),
        ("DJI Mini 4 Pro Drone (Fly More Combo Plus)", 2500, 10000, "4K 60fps HDR, 20km transmission, omnidirectional obstacle sensing, 3 batteries included.", "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80"),
        ("Apple iPad Pro 12.9\" M2 (256GB) + Magic Keyboard & Pencil 2", 1800, 8000, "Mini-LED ProMotion display, desktop class productivity, paperlike screen protector installed.", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"),
        ("Meta Quest 3 512GB Mixed Reality VR Headset", 1600, 6000, "High-resolution color passthrough, touch plus controllers, loaded with top VR titles.", "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80"),
        ("Sony WH-1000XM5 Wireless Noise Cancelling Headphones", 600, 2500, "Industry leading noise cancellation, 30-hour battery, crystal clear hands-free calling.", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"),
    ],
    "cameras": [
        ("Canon EOS R6 Mark II + RF 24-70mm f/2.8L IS USM", 3500, 15000, "40fps continuous shooting, 6K oversampled 4K 60p, dual card slots, 2 extra LP-E6NH batteries.", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"),
        ("Sony Alpha A7 IV + FE 50mm f/1.2 GM Prime", 3000, 12000, "33MP full-frame sensor, BIONZ XR processor, 10-bit 4:2:2 video, unbeatable low-light autofocus.", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"),
        ("Blackmagic Pocket Cinema Camera 6K Pro", 4000, 18000, "Super 35 sensor, built-in motorized ND filters, tiltable HDR touchscreen, dual mini-XLR audio.", "https://images.unsplash.com/photo-1589872782352-7b561c28c89b?auto=format&fit=crop&w=800&q=80"),
        ("GoPro HERO12 Black Creator Edition Bundle", 1000, 4000, "Includes Volta battery grip, Media Mod, Light Mod, Enduro battery, waterproof casing.", "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80"),
        ("DJI RS 3 Pro 3-Axis Gimbal Stabilizer Combo", 1500, 5000, "Automated axis locks, carbon fiber arms, 4.5kg tested payload, LiDAR focusing system.", "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80"),
    ],
    "apartments": [
        ("3BHK Luxury Furnished Apartment in Gulshan 2", 6500, 20000, "2400 sqft, high floor, lake view, 3 master bedrooms with attached baths, modular kitchen, 24/7 generator.", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"),
        ("Modern 2BHK Designer Flat with Balcony in Banani", 4500, 15000, "Interior by top architectural firm, smart home automation, high-speed WiFi, gym and swimming pool access.", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"),
        ("Private Pool Vacation Beach Villa in Cox's Bazar", 14000, 30000, "4 master bedrooms right on Marine Drive, private infinity pool facing Bay of Bengal, chef on demand.", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"),
        ("Cozy Studio Apartment near Metro Station in Mirpur 10", 1800, 5000, "Compact modern studio, fully equipped kitchen, metro station 2 min walk, 100 Mbps fiber internet.", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"),
        ("Duplex Penthouse with Private Rooftop Garden in Uttara Sector 4", 8500, 25000, "3200 sqft duplex, 4 bedrooms, BBQ lounge on terrace, elevator, 2 dedicated car parking slots.", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"),
    ],
    "furniture": [
        ("Chittagong Teak Solid Wood 6-Seater Dining Set", 800, 3000, "Hand-carved premium Segun wood dining table with glass top and 6 cushioned matching chairs.", "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"),
        ("Herman Miller Aeron Ergonomic Office Chair", 500, 2000, "Fully adjustable lumbar support, breathable pellicle mesh, forward tilt, tilt limiter.", "https://images.unsplash.com/photo-1580481077195-c329a3a78993?auto=format&fit=crop&w=800&q=80"),
        ("Hatil Genuine Leather 3-Seater Recliner Sofa", 1200, 5000, "Electric motorized dual recliners, built-in USB charging ports, premium Italian top-grain leather.", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"),
        ("King Size Solid Wood Platform Bed with Luxury Spring Mattress", 900, 4000, "Modern low-profile acoustic headboard with integrated warm LED backlights and memory foam mattress.", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"),
    ]
}

async def seed_large_data():
    print("🌱 Commencing Large-Scale Bangladesh-Standard Seeding...")
    async with AsyncSessionLocal() as session:
        # 1. Fetch Roles
        roles_res = await session.execute(select(Role))
        roles_map = {r.name: r for r in roles_res.scalars().all()}
        
        # 2. Seed Users
        print(f"👤 Seeding {len(BANGLADESH_USERS)} authentic Bangladeshi users...")
        created_users = []
        default_pwd_hash = hash_password("Test@1234")
        
        for idx, (first, last, email, phone, verif_status, role_name) in enumerate(BANGLADESH_USERS):
            # Check if user already exists
            existing = await session.scalar(select(User).where(User.email == email))
            if existing:
                created_users.append(existing)
                continue
                
            avatar = AVATARS[idx % len(AVATARS)]
            u = User(
                email=email,
                phone=phone,
                password_hash=default_pwd_hash,
                first_name=first,
                last_name=last,
                avatar_url=avatar,
                is_email_verified=True,
                identity_verification_status=verif_status,
                is_active=True
            )
            target_role = roles_map.get(role_name) or roles_map.get("customer")
            if target_role:
                u.roles.append(target_role)
                
            session.add(u)
            created_users.append(u)
            
        await session.flush()
        
        # Add Bangladeshi Addresses for users
        print("📍 Adding Bangladeshi addresses & Identity Verifications...")
        for idx, u in enumerate(created_users):
            loc_area, loc_city, loc_post = DHAKA_AREAS[idx % len(DHAKA_AREAS)]
            # Check existing address
            existing_addr = await session.scalar(select(Address).where(Address.user_id == u.id))
            if not existing_addr:
                addr = Address(
                    user_id=u.id,
                    label="Home",
                    street_line1=f"House {random.randint(12, 120)}, Road {random.randint(1, 28)}, Block {chr(65 + (idx % 6))}",
                    city=loc_city,
                    state="Dhaka Division" if loc_city == "Dhaka" else f"{loc_city} Division",
                    postal_code=loc_post,
                    country="Bangladesh",
                    is_default=True
                )
                session.add(addr)
            
            # Identity Verification record
            if u.identity_verification_status != "NOT_STARTED":
                existing_iv = await session.scalar(select(IdentityVerification).where(IdentityVerification.user_id == u.id))
                if not existing_iv:
                    iv = IdentityVerification(
                        user_id=u.id,
                        status=u.identity_verification_status,
                        attempt_count=1,
                        document_type="NID",
                        document_number_masked=f"•••• •••• {random.randint(1000, 9999)}",
                        face_match_score=0.9650 if u.identity_verification_status == "VERIFIED" else 0.4200
                    )
                    session.add(iv)

        await session.flush()

        # 3. Fetch Categories
        cats_res = await session.execute(select(Category))
        categories = {c.slug: c for c in cats_res.scalars().all()}
        
        # 4. Seed Products
        print("📦 Seeding comprehensive product listings across all categories...")
        owners = [u for u in created_users if any(r.name == "owner" for r in u.roles)]
        if not owners:
            owners = created_users[:5]
            
        created_products = []
        for multiplier in range(4):
            for cat_slug, templates in PRODUCT_TEMPLATES.items():
                cat = categories.get(cat_slug)
                if not cat:
                    continue
                    
                for idx, (title, price, deposit, desc, img_url) in enumerate(templates):
                    loc_area, loc_city, _ = DHAKA_AREAS[(idx * 3 + multiplier * 2) % len(DHAKA_AREAS)]
                    owner = random.choice(owners)
                    display_title = f"{title}" if multiplier == 0 else f"{title} ({loc_area})"
                    base_slug = f"{cat_slug}-{title.lower().replace(' ', '-').replace('/', '-').replace('\"', '')[:35]}-{loc_area.lower().replace(' ', '-')[:10]}-{uuid.uuid4().hex[:6]}"
                    
                    status_choice = random.choices(["APPROVED", "PENDING", "APPROVED", "APPROVED"], k=1)[0]
                    p = Product(
                        owner_id=owner.id,
                        category_id=cat.id,
                        title=display_title,
                        slug=base_slug,
                        description=desc,
                        price_per_day=price,
                        security_deposit=deposit,
                        condition="Like New" if price > 2000 else "Good",
                        delivery_option="both",
                        city=loc_city,
                        area=loc_area,
                        avg_rating=round(random.uniform(4.6, 5.0), 1),
                        review_count=random.randint(12, 128),
                        is_featured=(idx % 3 == 0),
                        is_trending=(idx % 2 == 0),
                        status=status_choice,
                        is_active=(status_choice == "APPROVED"),
                        view_count=random.randint(80, 2400)
                    )
                    session.add(p)
                    created_products.append((p, img_url))

        await session.flush()
        
        for p, img_url in created_products:
            pimg = ProductImage(product_id=p.id, url=img_url, sort_order=0, is_primary=True)
            session.add(pimg)

        await session.flush()

        # 5. Seed Bookings distributed across all months of the year
        print("📅 Generating realistic monthly distributed booking transactions...")
        await session.execute(delete(Review))
        await session.execute(delete(Booking))
        await session.flush()

        customers = [u for u in created_users if not any(r.name == "owner" for r in u.roles)]
        if not customers:
            customers = created_users[5:]
            
        now_dt = datetime.now(timezone.utc)
        current_year = now_dt.year
        all_prods = [p for p, _ in created_products]
        bookings_count = 0
        
        # Seed 25-35 bookings per month from Jan (1) to Aug (8)
        for month_idx in range(1, 9):
            count_in_month = 20 + month_idx * 3
            for _ in range(count_in_month):
                prod = random.choice(all_prods)
                renter = random.choice(customers)
                if renter.id == prod.owner_id:
                    continue
                
                day_in_month = random.randint(1, 28)
                booking_created = datetime(current_year, month_idx, day_in_month, random.randint(8, 20), random.randint(0, 59), tzinfo=timezone.utc)
                
                if month_idx < 8:
                    status = random.choices(["completed", "completed", "completed", "cancelled"], weights=[75, 12, 8, 5])[0]
                else:
                    status = random.choices(["completed", "confirmed", "active", "pending", "cancelled"], weights=[40, 25, 20, 10, 5])[0]
                
                days = random.randint(2, 6)
                start_date = booking_created.date() + timedelta(days=random.randint(1, 3))
                end_date = start_date + timedelta(days=days)
                
                daily_rate = float(prod.price_per_day)
                subtotal = daily_rate * days
                deposit = float(prod.security_deposit)
                delivery_opt = random.choice(["pickup", "delivery"])
                deliv_fee = 250.0 if delivery_opt == "delivery" else 0.0
                total_amt = subtotal + deposit + deliv_fee
                booking_id = uuid.uuid4()
                
                b = Booking(
                    id=booking_id,
                    product_id=prod.id,
                    renter_id=renter.id,
                    owner_id=prod.owner_id,
                    start_date=start_date,
                    end_date=end_date,
                    total_days=days,
                    daily_rate=daily_rate,
                    subtotal=subtotal,
                    security_deposit=deposit,
                    delivery_fee=deliv_fee,
                    total_amount=total_amt,
                    status=status,
                    delivery_option=delivery_opt,
                    created_at=booking_created,
                    updated_at=booking_created,
                    notes="Standard rental booking via RentHub Bangladesh platform"
                )
                session.add(b)
                bookings_count += 1
                
                # If completed, add a customer review!
                if status == "completed" and random.random() > 0.4:
                    rev = Review(
                        id=uuid.uuid4(),
                        booking_id=booking_id,
                        reviewer_id=renter.id,
                        reviewee_id=prod.owner_id,
                        product_id=prod.id,
                        rating=random.choice([4.5, 4.8, 5.0]),
                        comment=random.choice([
                            "Super smooth experience! The item was in pristine condition and the owner was very cooperative.",
                            "Highly recommended. Prompt handover and received in top working order in Dhaka.",
                            "Excellent service! Everything was clean, well-packaged, and saved me a lot of money.",
                            "Great communication and hassle-free return. Will definitely rent again!"
                        ]),
                        type="product",
                        created_at=booking_created + timedelta(days=days + 1),
                        updated_at=booking_created + timedelta(days=days + 1)
                    )
                    session.add(rev)

        await session.commit()
        print(f"✅ Successfully seeded {len(created_users)} Bangladeshi Users, {len(created_products)} Listings, and {bookings_count} Bookings & Reviews across all 12 months!")

if __name__ == "__main__":
    asyncio.run(seed_large_data())
