import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, delete
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage, Favorite
from app.models.booking import Booking, Review
from app.models.cms import HeroBanner, Promotion, City

async def seed_db():
    print("Starting database seed...")
    async with AsyncSessionLocal() as session:
        # 1. Fetch Users
        result = await session.execute(select(User).limit(2))
        users = result.scalars().all()
        if len(users) < 2:
            print("Not enough users in DB to seed products and bookings. Please register at least 2 users.")
            return
            
        owner = users[0]
        renter = users[1]
        
        # 2. Clear existing seed data (Order matters due to foreign keys)
        print("Clearing old seed data...")
        await session.execute(delete(Review))
        await session.execute(delete(Booking))
        await session.execute(delete(Favorite))
        await session.execute(delete(ProductImage))
        await session.execute(delete(Product))
        await session.execute(delete(Category))
        await session.execute(delete(HeroBanner))
        await session.execute(delete(Promotion))
        await session.execute(delete(City))
        await session.commit()
        
        # 3. Seed CMS Data
        print("Seeding Hero Banners...")
        banners = [
            HeroBanner(eyebrow="Weekend Adventure", title="Starts Here", subtitle="Rent the best vehicles, gadgets, and more for your next adventure.", cta_text="Explore Now", cta_href="/categories/vehicles", image_url="/images/hero_1_new.png", sort_order=0),
            HeroBanner(eyebrow="Capture Every", title="Perfect Moment", subtitle="Professional DSLR cameras and lenses for photographers.", cta_text="Rent a Camera", cta_href="/categories/cameras", image_url="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=90", sort_order=1),
            HeroBanner(eyebrow="Your Perfect", title="Stay Awaits", subtitle="Luxury apartments and cozy homes for rent across Bangladesh.", cta_text="Find a Place", cta_href="/categories/apartments", image_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=90", sort_order=2),
            HeroBanner(eyebrow="Work Smarter", title="Anywhere", subtitle="MacBooks, laptops and tech gear for professionals on the go.", cta_text="Browse Tech", cta_href="/categories/electronics", image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=90", sort_order=3),
        ]
        session.add_all(banners)

        print("Seeding Cities...")
        cities = [
            City(name="Dhaka", slug="dhaka", image_url="https://images.unsplash.com/photo-1617850687395-620757feb1f3?auto=format&fit=crop&w=400&h=200&q=80", listing_count=1200, sort_order=0),
            City(name="Chattogram", slug="chattogram", image_url="https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=400&h=200&q=80", listing_count=850, sort_order=1),
            City(name="Sylhet", slug="sylhet", image_url="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&h=200&q=80", listing_count=650, sort_order=2),
            City(name="Cox's Bazar", slug="coxs-bazar", image_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=200&q=80", listing_count=500, sort_order=3),
            City(name="Rajshahi", slug="rajshahi", image_url="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&h=200&q=80", listing_count=400, sort_order=4),
        ]
        session.add_all(cities)

        # 4. Seed Categories
        print("Seeding Categories...")
        cats_data = [
            {
                "name": "Vehicles", "slug": "vehicles", "sort_order": 0,
                "description": "Cars, bikes, vans and more",
                "icon_url": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Electronics", "slug": "electronics", "sort_order": 1,
                "description": "Laptops, mobiles, tablets and more",
                "icon_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Cameras", "slug": "cameras", "sort_order": 2,
                "description": "DSLR, mirrorless, lenses and more",
                "icon_url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Apartments", "slug": "apartments", "sort_order": 3,
                "description": "Flats, houses and rooms",
                "icon_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Furniture", "slug": "furniture", "sort_order": 4,
                "description": "Sofa, tables, chairs and more",
                "icon_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Fashion", "slug": "fashion", "sort_order": 5,
                "description": "Men, women and kids fashion",
                "icon_url": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Sports", "slug": "sports", "sort_order": 6,
                "description": "Sports gear and equipment",
                "icon_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Books", "slug": "books", "sort_order": 7,
                "description": "Academic, novels and more",
                "icon_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=80&h=80&q=80",
                "image_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
            },
        ]
        
        categories = []
        for d in cats_data:
            c = Category(
                name=d["name"], slug=d["slug"], description=d["description"],
                icon_url=d["icon_url"], image_url=d["image_url"], sort_order=d["sort_order"]
            )
            session.add(c)
            categories.append(c)
            
        await session.flush()  # To get IDs
        
        print("Seeding Promotions...")
        promos = [
            Promotion(title="Canon Cameras", subtitle="Rent before Friday", discount_text="20% OFF", discount_pct=20.0, image_url="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=120&h=100&q=80", theme_color="emerald", category_id=categories[2].id),
            Promotion(title="Luxury Cars", subtitle="Weekend Special", discount_text="15% OFF", discount_pct=15.0, image_url="https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=120&h=100&q=80", theme_color="purple", category_id=categories[0].id),
            Promotion(title="Furniture", subtitle="Limited time offer", discount_text="10% OFF", discount_pct=10.0, image_url="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=120&h=100&q=80", theme_color="orange", category_id=categories[4].id),
        ]
        session.add_all(promos)

        # 5. Seed Products
        print("Seeding Products...")
        products_data = [
            (categories[0], "Toyota Axio 2018", "toyota-axio-2018", 2500, "Dhanmondi", "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80", 4.8, 134, True, True),
            (categories[2], "Canon EOS R6", "canon-eos-r6", 2200, "Baddarkhana", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=500&q=80", 4.9, 98, False, True),
            (categories[3], "2BHK Apartment", "2bhk-apartment", 18000, "Gulshan", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80", 4.7, 56, False, True),
            (categories[1], "MacBook Air M2", "macbook-air-m2", 1600, "Banani", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80", 4.9, 76, False, True),
            (categories[0], "BMW X5", "bmw-x5", 8000, "Uttara", "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=200&h=150&q=80", 4.9, 45, False, False),
            (categories[2], "Sony A7 IV", "sony-a7-iv", 2000, "Mirpur", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&h=150&q=80", 4.8, 60, False, False),
            (categories[4], "Office Chair", "office-chair", 300, "Mohakhali", "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=300&q=80", 4.3, 22, False, False),
            (categories[2], "GoPro Hero 10", "gopro-hero-10", 700, "Tejgaon", "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=300&q=80", 4.7, 87, False, False),
        ]
        
        products = []
        for cat, title, slug, price, area, img, rating, reviews_count, is_featured, is_trending in products_data:
            p = Product(
                owner_id=owner.id,
                category_id=cat.id,
                title=title,
                slug=slug,
                description=f"Great condition {title}",
                price_per_day=price,
                security_deposit=price*2,
                condition="good",
                delivery_option="both",
                city="Dhaka",
                area=area,
                avg_rating=rating,
                review_count=reviews_count,
                is_featured=is_featured,
                is_trending=is_trending
            )
            session.add(p)
            products.append(p)
            
        await session.flush()
        
        # Add Product Images
        for idx, p in enumerate(products):
            img = ProductImage(product_id=p.id, url=products_data[idx][5], sort_order=0, is_primary=True)
            session.add(img)

        # Add Favorites
        f1 = Favorite(user_id=renter.id, product_id=products[1].id)
        f2 = Favorite(user_id=renter.id, product_id=products[3].id)
        session.add_all([f1, f2])

        # 6. Seed Bookings & Reviews
        print("Seeding Bookings & Reviews...")
        now = datetime.now(timezone.utc).date()
        
        b1 = Booking(
            product_id=products[0].id,
            renter_id=renter.id,
            owner_id=owner.id,
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=3),
            total_days=2,
            daily_rate=2500,
            subtotal=5000,
            security_deposit=5000,
            delivery_fee=0,
            total_amount=10000,
            status="approved",
            delivery_option="pickup"
        )
        
        b2 = Booking(
            product_id=products[2].id,
            renter_id=renter.id,
            owner_id=owner.id,
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=5),
            total_days=5,
            daily_rate=18000,
            subtotal=90000,
            security_deposit=36000,
            delivery_fee=0,
            total_amount=126000,
            status="completed",
            delivery_option="pickup"
        )
        session.add_all([b1, b2])
        await session.flush()
        
        r1 = Review(
            booking_id=b2.id,
            reviewer_id=renter.id,
            reviewee_id=owner.id,
            product_id=products[2].id,
            rating=4.7,
            comment="Amazing apartment, great host!",
            type="product"
        )
        session.add(r1)

        await session.commit()
        print("Database seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
