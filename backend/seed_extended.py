import asyncio
import uuid
import random
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from faker import Faker
from app.database.session import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User

import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

fake = Faker()

CATEGORY_CONFIGS = {
    "electronics": {
        "titles": ["MacBook Pro M1", "Dell XPS 13", "iPad Air", "Samsung Galaxy Tab", "Sony PlayStation 5", "Xbox Series X", "Nintendo Switch", "Apple Watch Series 7", "Samsung 4K Smart TV", "Bose QuietComfort Earbuds"],
        "price_range": (100, 1000),
        "images": [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "cameras": {
        "titles": ["Canon EOS R5", "Sony A7 III", "Nikon Z6 II", "Fujifilm X-T4", "Panasonic Lumix GH5", "GoPro Hero 9", "DJI Mavic Air 2", "Sigma 35mm f/1.4 Art Lens", "Sony G Master 24-70mm", "Canon EF 70-200mm f/2.8L"],
        "price_range": (200, 1500),
        "images": [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "apartments": {
        "titles": ["2BHK Apartment", "3BHK Fully Furnished Flat", "Studio Apartment", "Luxury Penthouse", "Sublet Room", "Cozy 1BHK Flat", "Duplex House", "Shared Room for Students", "Office Space", "Commercial Shop"],
        "price_range": (500, 3000),
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1493809842364-78817add7ff6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1de24220e3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "furniture": {
        "titles": ["Wooden Dining Table", "L-Shaped Sofa", "Ergonomic Office Chair", "Queen Size Bed", "Wardrobe Almirah", "Coffee Table", "Bookshelf", "Study Desk", "Bean Bag", "Outdoor Patio Set"],
        "price_range": (50, 500),
        "images": [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "fashion": {
        "titles": ["Designer Lehenga", "Wedding Sherwani", "Party Dress", "Tuxedo Suit", "Bridal Saree", "Branded Leather Jacket", "Luxury Handbag", "Traditional Panjabi", "Winter Coat", "Designer Sunglasses"],
        "price_range": (50, 400),
        "images": [
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "sports": {
        "titles": ["Cricket Bat English Willow", "Football", "Tennis Racket", "Treadmill", "Dumbbell Set", "Cycling Helmet", "Camping Tent", "Badminton Racket", "Basketball", "Yoga Mat"],
        "price_range": (20, 250),
        "images": [
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526502769903-5df34213d2f9?auto=format&fit=crop&w=800&q=80"
        ]
    },
    "books": {
        "titles": ["Python Programming Coursebook", "Data Structures & Algorithms", "Harry Potter Box Set", "Lord of the Rings Collection", "Medical Anatomy Textbook", "Engineering Mathematics", "IELTS Preparation Book", "Self Development Guide", "Science Fiction Novel", "Historical Biography"],
        "price_range": (5, 50),
        "images": [
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"
        ]
    }
}

CITIES_AREAS = {
    "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohakhali", "Tejgaon", "Badda"],
    "Chattogram": ["Agrabad", "GEC Circle", "Halishahar", "Nasirabad"],
    "Sylhet": ["Zindabazar", "Ambarkhana", "Shibganj"]
}

async def create_fake_users(db: AsyncSession, count: int = 15):
    print(f"Creating {count} fake users...")
    users = []
    for i in range(count):
        profile_img_id = random.randint(1, 100)
        user = User(
            email=f"{fake.user_name()}{i}@example.com",
            password_hash=get_password_hash("password123"),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            phone=f"+8801{random.randint(300000000, 999999999)}",
            is_active=True,
            is_email_verified=True,
            is_identity_verified=True,
            avatar_url=f"https://randomuser.me/api/portraits/{random.choice(['men', 'women'])}/{profile_img_id}.jpg"
        )
        db.add(user)
        users.append(user)
    await db.flush()
    return users

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Fetch categories
        result = await db.execute(select(Category))
        categories = result.scalars().all()
        
        category_map = {c.slug: c for c in categories}
        
        # 2. Get/Create users
        result = await db.execute(select(User))
        existing_users = result.scalars().all()
        if len(existing_users) < 15:
            new_users = await create_fake_users(db, 15)
            existing_users.extend(new_users)
        
        owners = existing_users
        
        items_per_category = 25
        
        print("Seeding products for all categories...")
        for slug, config in CATEGORY_CONFIGS.items():
            cat = category_map.get(slug)
            if not cat:
                print(f"Category {slug} not found in DB, skipping...")
                continue
                
            print(f"Generating {items_per_category} items for category: {cat.name}")
            
            for i in range(items_per_category):
                title_base = random.choice(config["titles"])
                # Add some uniqueness to title to avoid slug collisions and add variety
                adjectives = ["Premium", "Reliable", "Affordable", "Branded", "Exclusive", "Best Condition", "Like New", "Slightly Used", "Genuine"]
                title = f"{random.choice(adjectives)} {title_base} - {fake.word().capitalize()} edition"
                
                slug_val = title.lower().replace(" ", "-").replace(",", "").replace(".", "") + f"-{random.randint(1000, 9999)}"
                
                owner = random.choice(owners)
                city = random.choice(list(CITIES_AREAS.keys()))
                area = random.choice(CITIES_AREAS[city])
                
                condition = random.choice(["Excellent", "Good"])
                
                base_price = random.randint(config["price_range"][0], config["price_range"][1])
                price_per_day = base_price * 1.5 if condition == "Excellent" else base_price * 1.0
                price_per_day = round(price_per_day, -1) # Round to nearest 10
                
                prod = Product(
                    id=uuid.uuid4(),
                    owner_id=owner.id,
                    category_id=cat.id,
                    title=title,
                    slug=slug_val,
                    description=f"{title}. {fake.paragraph(nb_sentences=3)}\nCondition: {condition}. Located in {area}, {city}.",
                    price_per_day=price_per_day,
                    security_deposit=price_per_day * random.choice([2, 3, 5]),
                    condition=condition.lower(),
                    delivery_option=random.choice(["pickup", "delivery", "both"]),
                    city=city,
                    area=area,
                    avg_rating=round(random.uniform(3.5, 5.0), 1),
                    review_count=random.randint(0, 150),
                    is_featured=random.random() > 0.8,
                    is_trending=random.random() > 0.7,
                    status="APPROVED"
                )
                db.add(prod)
                await db.flush()
                
                # Add images (1 to 3 images)
                num_images = random.randint(1, 3)
                selected_images = random.sample(config["images"], num_images)
                
                for idx, img_url in enumerate(selected_images):
                    img = ProductImage(
                        id=uuid.uuid4(),
                        product_id=prod.id,
                        url=img_url,
                        sort_order=idx,
                        is_primary=(idx == 0)
                    )
                    db.add(img)

        await db.commit()
        print("Seeding extended data completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
