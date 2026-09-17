"""
migrate_images_to_cloudinary.py  (v2 — correct schema)

Re-uploads all localhost images from product_images.url and users.avatar_url
to Cloudinary and patches the DB rows with permanent public URLs.

Run:
    python migrate_images_to_cloudinary.py
"""
import asyncio
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import cloudinary
import cloudinary.uploader
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.core.config import get_settings
get_settings.cache_clear()
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

UPLOAD_DIR = Path(settings.LOCAL_STORAGE_PATH)
LOCAL_URL_PREFIX = "http://localhost:8000/uploads"


def local_path_from_url(url: str) -> Path | None:
    if not url or LOCAL_URL_PREFIX not in url:
        return None
    rel = url.replace(LOCAL_URL_PREFIX + "/", "")
    return UPLOAD_DIR / rel


def upload_file(filepath: Path, folder: str) -> str | None:
    if not filepath or not filepath.exists():
        print(f"  ⚠️  File not found: {filepath}")
        return None
    try:
        with open(filepath, "rb") as f:
            data = f.read()
        result = cloudinary.uploader.upload(
            io.BytesIO(data),
            folder=f"renthub/{folder}",
            resource_type="image",
            unique_filename=True,
            overwrite=False,
        )
        return result["secure_url"]
    except Exception as e:
        print(f"  ❌ Upload failed for {filepath}: {e}")
        return None


async def migrate():
    # Use direct URL to avoid pgbouncer transaction-mode issues
    db_url = settings.DIRECT_DATABASE_URL or settings.DATABASE_URL
    engine = create_async_engine(db_url, echo=False, connect_args={"statement_cache_size": 0})
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:

        # ── 1. product_images.url ─────────────────────────────────────────────
        print("\n🖼️  Migrating product images (product_images.url)...")
        result = await session.execute(
            text("SELECT id, url FROM product_images WHERE url LIKE :p"),
            {"p": f"{LOCAL_URL_PREFIX}%"},
        )
        rows = result.fetchall()
        print(f"   Found {len(rows)} rows")

        for row in rows:
            img_id, old_url = row.id, row.url
            filepath = local_path_from_url(old_url)
            print(f"  → {old_url}")
            new_url = upload_file(filepath, "products")
            if new_url:
                await session.execute(
                    text("UPDATE product_images SET url = :url WHERE id = :id"),
                    {"url": new_url, "id": img_id},
                )
                print(f"     ✅ {new_url}")

        # ── 2. users.avatar_url ───────────────────────────────────────────────
        print("\n👤  Migrating user avatars (users.avatar_url)...")
        result = await session.execute(
            text("SELECT id, avatar_url FROM users WHERE avatar_url LIKE :p"),
            {"p": f"{LOCAL_URL_PREFIX}%"},
        )
        rows = result.fetchall()
        print(f"   Found {len(rows)} rows")

        for row in rows:
            user_id, old_url = row.id, row.avatar_url
            filepath = local_path_from_url(old_url)
            print(f"  → {old_url}")
            new_url = upload_file(filepath, "avatars")
            if new_url:
                await session.execute(
                    text("UPDATE users SET avatar_url = :url WHERE id = :id"),
                    {"url": new_url, "id": user_id},
                )
                print(f"     ✅ {new_url}")

        await session.commit()
        print("\n🎉 Migration complete! All images now live on Cloudinary CDN.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
