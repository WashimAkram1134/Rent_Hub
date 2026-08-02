import asyncio
from app.db.session import async_session
from app.models.cms import HeroBanner
from sqlalchemy import select

async def main():
    async with async_session() as session:
        result = await session.execute(select(HeroBanner))
        banners = result.scalars().all()
        for b in banners:
            print(f"ID: {b.id}, Title: {b.title}, URL: {b.image_url}")

if __name__ == "__main__":
    asyncio.run(main())
