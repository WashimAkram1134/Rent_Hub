import asyncio
import uuid
from sqlalchemy import select, delete
from app.database.session import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User

DEMO_CARS = [
    {
        "title": "Range Rover Velar R-Dynamic 2024 (360° View)",
        "slug": "range-rover-velar-360",
        "description": "Car: Flagship luxury SUV with intelligent AWD, panoramic sliding sunroof, 3D surround camera, Meridian sound system, and perforated Windsor leather interior. Includes full 360° interactive rotation and dedicated front, back, inside, outside viewing angles. Perfect for executive transport, VIP events, and weddings.",
        "price_per_day": 14000.0,
        "security_deposit": 25000.0,
        "condition": "Like New",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Gulshan",
        "avg_rating": 4.95,
        "review_count": 86,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", # Front
            "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", # Front-Side
            "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=85", # Outside Side
            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", # Back Rear
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=85", # Inside Cockpit
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", # Inside Luxury Cabin
        ]
    },
    {
        "title": "BMW M5 Competition 2024 (360° View)",
        "slug": "bmw-m5-competition-360",
        "description": "Car: High performance sports executive sedan with 617hp twin-turbo V8, carbon ceramic brakes, Bowers & Wilkins audio, and Merino leather bucket seats. Interactive 360° view with front, back, interior, and exterior angles.",
        "price_per_day": 16500.0,
        "security_deposit": 30000.0,
        "condition": "Brand New",
        "delivery_option": "both",
        "city": "Dhaka",
        "area": "Banani",
        "avg_rating": 5.0,
        "review_count": 52,
        "is_featured": True,
        "is_trending": True,
        "status": "APPROVED",
        "images": [
            "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85", # Front
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", # Front-Side
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85", # Outside Side
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=85", # Back Rear
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", # Inside Cockpit
        ]
    }
]

async def seed_demo_cars():
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

        print(f"Seeding demo 360 cars into category '{vehicles_cat.name}' with owner '{owner.email}'...")

        for item in DEMO_CARS:
            images = item.pop("images", [])
            
            res = await db.execute(select(Product).where(Product.slug == item["slug"]))
            existing_prod = res.scalar_one_or_none()

            if existing_prod:
                for k, v in item.items():
                    setattr(existing_prod, k, v)
                existing_prod.category_id = vehicles_cat.id
                existing_prod.owner_id = owner.id
                prod = existing_prod
                print(f"  Updated product: {prod.title}")
            else:
                prod = Product(
                    id=uuid.uuid4(),
                    owner_id=owner.id,
                    category_id=vehicles_cat.id,
                    **item
                )
                db.add(prod)
                await db.flush()
                print(f"  Created product: {prod.title}")

            # Clear old images and re-add in order
            await db.execute(delete(ProductImage).where(ProductImage.product_id == prod.id))
            for i, img_url in enumerate(images):
                prod_img = ProductImage(
                    id=uuid.uuid4(),
                    product_id=prod.id,
                    url=img_url,
                    sort_order=i,
                    is_primary=(i == 0)
                )
                db.add(prod_img)

        await db.commit()
        print("✅ Demo 360 cars seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_demo_cars())
