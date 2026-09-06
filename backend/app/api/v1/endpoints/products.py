from uuid import UUID
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.models.user import User
from app.auth.dependencies import get_current_user_optional
from app.schemas.product import (
    ProductOut,
    ProductCreate,
    ProductUpdate,
    ProductStatusUpdate,
    ProductOfferUpdate,
    BulkOfferPayload,
    ProductDetailOut
)

router = APIRouter()

@router.get("", response_model=list[ProductOut])
async def get_products(
    trending: bool = Query(False),
    recommended: bool = Query(False),
    status: str = Query("APPROVED"),
    owner_id: str = Query(None),
    category_slug: str = Query(None),
    limit: int = Query(60, le=200),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category)
        )
    )

    # Filter by category slug (join to categories)
    if category_slug:
        cat_result = await db.execute(
            select(Category).where(Category.slug == category_slug)
        )
        cat = cat_result.scalars().first()
        if cat:
            stmt = stmt.where(Product.category_id == cat.id)

    if trending:
        stmt = stmt.where(Product.is_trending == True)
    elif recommended:
        stmt = stmt.order_by(Product.created_at.desc())
        
    if status == "all":
        pass
    elif status == "PENDING":
        stmt = stmt.where(Product.status == "PENDING")
    elif status in ["APPROVED", "ACTIVE"]:
        stmt = stmt.where(Product.status.in_(["APPROVED", "ACTIVE"]), Product.is_active == True)
    else:
        stmt = stmt.where(Product.status == status)
        
    if owner_id and owner_id != "undefined":
        try:
            stmt = stmt.where(Product.owner_id == UUID(owner_id))
        except Exception:
            stmt = stmt.where(Product.owner_id == owner_id)
        
    stmt = stmt.order_by(Product.created_at.desc()).limit(limit)
    
    result = await db.execute(stmt)
    products = result.scalars().all()
    
    out = []
    for p in products:
        imgs = sorted(p.images, key=lambda i: i.sort_order)
        img_url = next((img.url for img in imgs if img.is_primary), imgs[0].url if imgs else None)
        
        owner_name = f"{p.owner.first_name} {p.owner.last_name}" if p.owner else "Verified Host"
        owner_email = p.owner.email if p.owner else None
        category_name = p.category.name if p.category else "General"

        out.append(ProductOut(
            id=p.id,
            title=p.title,
            slug=p.slug,
            description=p.description,
            price_per_day=p.price_per_day,
            security_deposit=p.security_deposit,
            condition=p.condition,
            city=p.city,
            area=p.area,
            avg_rating=p.avg_rating,
            review_count=p.review_count,
            category_id=p.category_id,
            owner_id=p.owner_id,
            is_featured=p.is_featured,
            is_trending=p.is_trending,
            discount_percentage=p.discount_percentage or 0,
            offer_title=p.offer_title,
            offer_active=p.offer_active or False,
            owner_name=owner_name,
            owner_email=owner_email,
            category_name=category_name,
            status=p.status,
            image_url=img_url,
            images=[{"url": img.url, "is_primary": img.is_primary} for img in imgs],
            is_wishlisted=False
        ))
        
    return out

@router.post("", response_model=ProductOut)
async def create_product(
    product_in: ProductCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    import re
    base_slug = re.sub(r'[^a-z0-9]+', '-', product_in.title.lower()).strip('-')
    unique_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
    
    if current_user:
        owner_id = current_user.id
    elif product_in.owner_id:
        owner_id = product_in.owner_id
    else:
        owner_result = await db.execute(select(User).limit(1))
        owner = owner_result.scalars().first()
        owner_id = owner.id if owner else uuid.uuid4()

    init_status = product_in.status if product_in.status else "PENDING"

    new_product = Product(
        owner_id=owner_id,
        category_id=product_in.category_id,
        title=product_in.title,
        slug=unique_slug,
        description=product_in.description,
        price_per_day=product_in.price_per_day,
        security_deposit=product_in.security_deposit,
        condition=product_in.condition,
        delivery_option=product_in.delivery_option,
        city=product_in.city,
        area=product_in.area,
        discount_percentage=0,
        offer_active=False,
        status=init_status,
        is_active=(init_status in ["APPROVED", "ACTIVE"]),
    )
    
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    # Process multiple images or single image_url
    image_list: list[str] = []
    if product_in.images:
        image_list = [img for img in product_in.images if img and img.strip()]
    elif product_in.image_url:
        image_list = [product_in.image_url.strip()]

    for idx, img_url in enumerate(image_list):
        new_image = ProductImage(
            product_id=new_product.id,
            url=img_url,
            sort_order=idx,
            is_primary=(idx == 0)
        )
        db.add(new_image)
    
    if image_list:
        await db.commit()
    
    primary_url = image_list[0] if image_list else product_in.image_url

    return ProductOut(
        id=new_product.id,
        title=new_product.title,
        slug=new_product.slug,
        price_per_day=new_product.price_per_day,
        city=new_product.city,
        area=new_product.area,
        avg_rating=new_product.avg_rating,
        review_count=new_product.review_count,
        category_id=new_product.category_id,
        owner_id=new_product.owner_id,
        is_featured=new_product.is_featured,
        is_trending=new_product.is_trending,
        discount_percentage=0,
        offer_active=False,
        status=new_product.status,
        image_url=primary_url,
        images=[{"url": url, "is_primary": (i == 0)} for i, url in enumerate(image_list)],
        is_wishlisted=False
    )

# ── Admin Bulk Offer Endpoint ──────────────────────────────────────────────────
@router.post("/admin/bulk-offer")
async def apply_bulk_offer(
    payload: BulkOfferPayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Applies discount/offer to all items or category-wise, or removes active offers.
    """
    if payload.action == "remove":
        stmt = update(Product)
        if payload.scope == "category" and payload.category_id:
            stmt = stmt.where(Product.category_id == payload.category_id)
        
        stmt = stmt.values(discount_percentage=0, offer_title=None, offer_active=False)
        result = await db.execute(stmt)
        await db.commit()
        return {
            "message": f"Successfully removed offers from {result.rowcount} listings!",
            "updated_count": result.rowcount
        }

    # Apply offer
    stmt = update(Product)
    if payload.scope == "category" and payload.category_id:
        stmt = stmt.where(Product.category_id == payload.category_id)

    stmt = stmt.values(
        discount_percentage=payload.discount_percentage,
        offer_title=payload.offer_title or f"{payload.discount_percentage}% OFF Campaign",
        offer_active=True
    )
    result = await db.execute(stmt)
    await db.commit()

    scope_text = "all platform listings" if payload.scope == "all" else "selected category listings"
    return {
        "message": f"Successfully applied {payload.discount_percentage}% discount to {result.rowcount} {scope_text}!",
        "updated_count": result.rowcount,
        "discount_percentage": payload.discount_percentage,
        "offer_title": payload.offer_title
    }

# ── Owner / Admin Single Item Offer Update ─────────────────────────────────────
@router.patch("/{id}/offer")
async def update_product_offer(
    id: str,
    payload: ProductOfferUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(id)
        condition = (Product.id == uuid_val) | (Product.slug == id)
    except (ValueError, AttributeError):
        condition = (Product.slug == id)

    stmt = select(Product).where(condition)
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.discount_percentage = payload.discount_percentage
    product.offer_title = payload.offer_title
    product.offer_active = payload.offer_active
    
    await db.commit()
    await db.refresh(product)
    
    return {
        "message": "Listing offer updated successfully!",
        "product_id": str(product.id),
        "discount_percentage": product.discount_percentage,
        "offer_title": product.offer_title,
        "offer_active": product.offer_active
    }

@router.post("/{id}/view")
async def record_product_view(
    id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    from app.models.recently_viewed import RecentlyViewed
    from datetime import datetime, timezone

    try:
        uuid_val = uuid.UUID(id)
        condition = (Product.slug == id) | (Product.id == uuid_val)
    except (ValueError, AttributeError):
        condition = (Product.slug == id)

    stmt = select(Product).where(condition)
    result = await db.execute(stmt)
    product = result.scalars().first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Increment view count
    product.view_count = (product.view_count or 0) + 1

    # If user is logged in, upsert into recently_viewed
    if current_user:
        rv_stmt = select(RecentlyViewed).where(
            RecentlyViewed.user_id == current_user.id,
            RecentlyViewed.product_id == product.id
        )
        rv_res = await db.execute(rv_stmt)
        existing_rv = rv_res.scalars().first()

        now = datetime.now(timezone.utc)
        if existing_rv:
            existing_rv.viewed_at = now
        else:
            new_rv = RecentlyViewed(
                user_id=current_user.id,
                product_id=product.id,
                viewed_at=now
            )
            db.add(new_rv)

    await db.commit()
    return {
        "status": "success",
        "product_id": str(product.id),
        "title": product.title,
        "view_count": product.view_count
    }

@router.get("/{slug}", response_model=ProductDetailOut)
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(slug)
        condition = (Product.slug == slug) | (Product.id == uuid_val)
    except (ValueError, AttributeError):
        condition = (Product.slug == slug)

    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category)
        )
        .where(condition)
    )
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return product

@router.patch("/{id}/status", response_model=ProductOut)
async def update_product_status(
    id: str,
    status_update: ProductStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        target_uuid = uuid.UUID(id)
        condition = (Product.id == target_uuid) | (Product.slug == id)
    except (ValueError, AttributeError):
        condition = (Product.slug == id)

    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category)
        )
        .where(condition)
    )
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if status_update.status not in ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    product.status = status_update.status
    if status_update.status in ["SUSPENDED", "REJECTED"]:
        product.is_active = False
    elif status_update.status == "APPROVED":
        product.is_active = True
        
    await db.commit()
    await db.refresh(product)
    
    imgs = sorted(product.images, key=lambda i: i.sort_order) if product.images else []
    img_url = next((img.url for img in imgs if img.is_primary), imgs[0].url if imgs else None)
    owner_name = f"{product.owner.first_name} {product.owner.last_name}" if product.owner else "Verified Host"
    owner_email = product.owner.email if product.owner else None
    category_name = product.category.name if product.category else "General"

    return ProductOut(
        id=product.id,
        title=product.title,
        slug=product.slug,
        description=product.description,
        price_per_day=product.price_per_day,
        security_deposit=product.security_deposit,
        condition=product.condition,
        city=product.city,
        area=product.area,
        avg_rating=product.avg_rating,
        review_count=product.review_count,
        category_id=product.category_id,
        owner_id=product.owner_id,
        is_featured=product.is_featured,
        is_trending=product.is_trending,
        discount_percentage=product.discount_percentage or 0,
        offer_title=product.offer_title,
        offer_active=product.offer_active or False,
        owner_name=owner_name,
        owner_email=owner_email,
        category_name=category_name,
        status=product.status,
        image_url=img_url,
        images=[{"url": img.url, "is_primary": img.is_primary} for img in imgs],
        is_wishlisted=False
    )

@router.patch("/{id}", response_model=ProductOut)
async def update_product(
    id: str,
    product_update: ProductUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(id)
        condition = (Product.id == uuid_val) | (Product.slug == id)
    except (ValueError, AttributeError):
        condition = (Product.slug == id)

    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category)
        )
        .where(condition)
    )
    result = await db.execute(stmt)
    product = result.scalars().first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.model_dump(exclude_unset=True)
    images_data = update_data.pop("images", None)
    
    for key, val in update_data.items():
        if hasattr(product, key) and val is not None:
            setattr(product, key, val)

    if images_data is not None and len(images_data) > 0:
        for old_img in list(product.images):
            await db.delete(old_img)
        for idx, img_url in enumerate(images_data):
            if img_url and img_url.strip():
                new_img = ProductImage(
                    product_id=product.id,
                    url=img_url.strip(),
                    sort_order=idx,
                    is_primary=(idx == 0)
                )
                db.add(new_img)
        product.image_url = images_data[0]

    await db.commit()
    await db.refresh(product)
    
    imgs = sorted(product.images, key=lambda i: i.sort_order) if product.images else []
    img_url = next((img.url for img in imgs if img.is_primary), imgs[0].url if imgs else None)
    owner_name = f"{product.owner.first_name} {product.owner.last_name}" if product.owner else "Verified Host"
    owner_email = product.owner.email if product.owner else None
    category_name = product.category.name if product.category else "General"

    return ProductOut(
        id=product.id,
        title=product.title,
        slug=product.slug,
        description=product.description,
        price_per_day=product.price_per_day,
        security_deposit=product.security_deposit,
        condition=product.condition,
        city=product.city,
        area=product.area,
        avg_rating=product.avg_rating,
        review_count=product.review_count,
        category_id=product.category_id,
        owner_id=product.owner_id,
        is_featured=product.is_featured,
        is_trending=product.is_trending,
        discount_percentage=product.discount_percentage or 0,
        offer_title=product.offer_title,
        offer_active=product.offer_active or False,
        owner_name=owner_name,
        owner_email=owner_email,
        category_name=category_name,
        status=product.status,
        image_url=img_url,
        images=[{"url": img.url, "is_primary": img.is_primary} for img in imgs],
        is_wishlisted=False
    )

@router.delete("/{id}", status_code=204)
async def delete_product(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        target_uuid = uuid.UUID(id)
        condition = (Product.id == target_uuid) | (Product.slug == id)
    except (ValueError, AttributeError):
        condition = (Product.slug == id)

    stmt = select(Product).where(condition)
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await db.delete(product)
    await db.commit()
