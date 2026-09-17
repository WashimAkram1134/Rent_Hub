import asyncio
from app.database.session import AsyncSessionLocal
from app.models.product import Product
from app.models.booking import Review
from sqlalchemy import select, func

async def sync_reviews():
    async with AsyncSessionLocal() as db:
        print("Starting review sync...")
        # Get count and avg for each product from reviews table
        rev_stats = (await db.execute(
            select(
                Review.product_id,
                func.count(Review.id).label("cnt"),
                func.avg(Review.rating).label("avg_r")
            )
            .where(Review.status == "published")
            .group_by(Review.product_id)
        )).all()

        stats_map = {row[0]: (row[1], round(float(row[2]), 1)) for row in rev_stats if row[0]}
        print(f"Products with published reviews in DB: {len(stats_map)}")

        # Fetch all products
        all_prods = (await db.execute(select(Product))).scalars().all()
        updated = 0
        for p in all_prods:
            if p.id in stats_map:
                actual_cnt, actual_avg = stats_map[p.id]
            else:
                actual_cnt, actual_avg = 0, 0.0

            if p.review_count != actual_cnt or float(p.avg_rating or 0) != actual_avg:
                p.review_count = actual_cnt
                p.avg_rating = actual_avg
                updated += 1

        await db.commit()
        print(f"Successfully synchronized {updated} products out of {len(all_prods)} total products.")

if __name__ == "__main__":
    asyncio.run(sync_reviews())
