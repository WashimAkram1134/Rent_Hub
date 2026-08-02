import asyncio
import uuid
from sqlalchemy import select, delete
from app.database.session import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User

VEHICLE_DATA = [
    # ── CARS ──
    {
        "title": "Toyota Axio 2018 (Automated Sedan)",
        "slug": "toyota-axio-2018-sedan",
        "description": "Car: Fuel-efficient sedan, perfect for city commutes and corporate travel in Dhaka. Air-conditioned with Bluetooth audio system.",
        "price_per_day": 2500.0,
        "security_deposit": 5000.0,
        "condition": "Excellent",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Dhanmondi",
        "avg_rating": 4.8,
        "review_count": 124,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Honda Grace 2017 (Hybrid Sedan)",
        "slug": "honda-grace-2017-hybrid",
        "description": "Car: Comfortable hybrid sedan with premium interior and excellent fuel economy. Well maintained and sanitized.",
        "price_per_day": 2400.0,
        "security_deposit": 4800.0,
        "condition": "Excellent",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Gulshan",
        "avg_rating": 4.7,
        "review_count": 98,
        "is_featured": False,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0729?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "BMW 320i 2019 (Luxury Sports Sedan)",
        "slug": "bmw-320i-2019-luxury",
        "description": "Car: Luxury sports sedan with twin-turbocharged engine. Leather seats, sunroof, and ultimate driving performance.",
        "price_per_day": 6500.0,
        "security_deposit": 15000.0,
        "condition": "Like New",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Banani",
        "avg_rating": 4.9,
        "review_count": 42,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── MOTORCYCLES ──
    {
        "title": "Yamaha YZF R15 V4 (Racing Blue)",
        "slug": "yamaha-r15-v4-racing",
        "description": "Motorcycle: 155cc Liquid Cooled FI Engine with Quickshifter & Traction Control. Smooth performance for city rides and highway touring.",
        "price_per_day": 1200.0,
        "security_deposit": 3000.0,
        "condition": "Like New",
        "delivery_option": "pickup",
        "city": "Dhaka",
        "area": "Mirpur",
        "avg_rating": 4.9,
        "review_count": 88,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Royal Enfield Hunter 350 (Dapper Grey)",
        "slug": "royal-enfield-hunter-350",
        "description": "Motorcycle: Retro cruiser bike with 349cc air-oil cooled engine. Deep thumping exhaust note and comfortable upright riding posture.",
        "price_per_day": 1500.0,
        "security_deposit": 4000.0,
        "condition": "Excellent",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Uttara",
        "avg_rating": 4.8,
        "review_count": 65,
        "is_featured": True,
        "is_trending": False,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── BICYCLES ──
    {
        "title": "Trek Marlin 7 Gen 2 Mountain Bike",
        "slug": "trek-marlin-7-mountain-bike",
        "description": "Bicycle: Lightweight aluminum frame with RockShox suspension fork & Shimano 10-speed drivetrain. Hydraulic disc brakes for steep trails.",
        "price_per_day": 400.0,
        "security_deposit": 1000.0,
        "condition": "Good",
        "delivery_option": "pickup",
        "city": "Dhaka",
        "area": "Dhanmondi",
        "avg_rating": 4.7,
        "review_count": 34,
        "is_featured": False,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "title": "Giant Talon 2 Off-Road Bicycle",
        "slug": "giant-talon-2-offroad-cycle",
        "description": "Bicycle: ALUXX-grade aluminum mountain bike. Double-walled alloy rims with Maxxis tires for hill tracks and urban commuting.",
        "price_per_day": 350.0,
        "security_deposit": 800.0,
        "condition": "Good",
        "delivery_option": "pickup",
        "city": "Chattogram",
        "area": "Agrabad",
        "avg_rating": 4.6,
        "review_count": 29,
        "is_featured": False,
        "is_trending": False,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── CNG ──
    {
        "title": "Bajaj RE 4-Stroke CNG Auto-Rickshaw",
        "slug": "bajaj-re-cng-auto-rickshaw",
        "description": "CNG: Fuel-efficient 4-stroke green CNG auto-rickshaw. Ideal for local passenger commuting, goods transfer, or city tour rentals.",
        "price_per_day": 900.0,
        "security_deposit": 2000.0,
        "condition": "Good",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Tejgaon",
        "avg_rating": 4.5,
        "review_count": 52,
        "is_featured": False,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── BUS ──
    {
        "title": "Hyundai County 29-Seater Luxury AC Bus",
        "slug": "hyundai-county-29-seater-ac-bus",
        "description": "Bus: 29-seater luxury tourist coach with dual air conditioning, reclining seats, microphone, and sound system. Ideal for corporate trips.",
        "price_per_day": 8500.0,
        "security_deposit": 10000.0,
        "condition": "Excellent",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Mohakhali",
        "avg_rating": 4.9,
        "review_count": 76,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
        ]
    },

    # ── TRUCK ──
    {
        "title": "Isuzu NPR 4-Ton Commercial Cargo Truck",
        "slug": "isuzu-npr-4ton-cargo-truck",
        "description": "Truck: 4-Ton heavy-duty diesel cargo truck with open bed container. Perfect for house shifting, factory goods, and commercial transport.",
        "price_per_day": 5500.0,
        "security_deposit": 10000.0,
        "condition": "Good",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Gazipur",
        "avg_rating": 4.7,
        "review_count": 41,
        "is_featured": True,
        "is_trending": False,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=800&q=80"
        ]
    }
]

async def seed_vehicles():
    async with AsyncSessionLocal() as db:
        # 1. Get vehicles category
        result = await db.execute(select(Category).where(Category.slug == "vehicles"))
        vehicles_cat = result.scalar_one_or_none()
        if not vehicles_cat:
            print("Vehicles category not found!")
            return

        # 2. Get an owner user
        result = await db.execute(select(User).limit(1))
        owner = result.scalar_one_or_none()
        if not owner:
            print("No user found for owner!")
            return

        print(f"Seeding vehicles under category: {vehicles_cat.name} ({vehicles_cat.id}) with owner: {owner.email}")

        # Insert items
        for item in VEHICLE_DATA:
            images = item.pop("images", [])
            
            # Check existing by slug
            res = await db.execute(select(Product).where(Product.slug == item["slug"]))
            existing_prod = res.scalar_one_or_none()

            if existing_prod:
                for k, v in item.items():
                    setattr(existing_prod, k, v)
                existing_prod.category_id = vehicles_cat.id
                prod = existing_prod
                print(f"Updated product: {prod.title}")
            else:
                prod = Product(
                    id=uuid.uuid4(),
                    owner_id=owner.id,
                    category_id=vehicles_cat.id,
                    **item
                )
                db.add(prod)
                await db.flush()
                print(f"Created product: {prod.title}")

            # Delete old images and add new
            await db.execute(delete(ProductImage).where(ProductImage.product_id == prod.id))
            for idx, img_url in enumerate(images):
                img = ProductImage(
                    id=uuid.uuid4(),
                    product_id=prod.id,
                    url=img_url,
                    sort_order=idx,
                    is_primary=(idx == 0)
                )
                db.add(img)

        await db.commit()
        print("Vehicle seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_vehicles())
