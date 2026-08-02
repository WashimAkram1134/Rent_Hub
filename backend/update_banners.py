import asyncio
from app.database.session import AsyncSessionLocal as async_session
from app.models.cms import HeroBanner
from sqlalchemy import select

async def main():
    async with async_session() as session:
        result = await session.execute(select(HeroBanner))
        banners = result.scalars().all()
        
        for b in banners:
            if "Perfect Moment" in b.title or "Capture Every" in b.eyebrow:
                b.image_url = "/images/camera_hero.png"
            elif "Anywhere" in b.title or "Work Smarter" in b.eyebrow:
                b.image_url = "/images/laptop_hero.png"
            elif "Perfect Stay" in b.title or "Your Perfect" in b.eyebrow:
                b.image_url = "/images/apartment_hero.png"
                
        await session.commit()
        print("Banners updated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
