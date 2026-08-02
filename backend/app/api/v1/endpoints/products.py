from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.schemas.product import ProductOut

router = APIRouter()

@router.get("", response_model=list[ProductOut])
async def get_products(
    trending: bool = Query(False),
    recommended: bool = Query(False),
    status: str = Query("APPROVED"),
    owner_id: str = Query(None),
    category_slug: str = Query(None),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).options(selectinload(Product.images))

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
        
    if status != "all":
        stmt = stmt.where(Product.status == status)
        
    if owner_id:
        stmt = stmt.where(Product.owner_id == owner_id)
        
    stmt = stmt.where(Product.is_active == True).limit(limit)
    
    result = await db.execute(stmt)
    products = result.scalars().all()
    
    out = []
    for p in products:
        # Get all images for this product
        imgs = sorted(p.images, key=lambda i: i.sort_order)
        img_url = next((img.url for img in imgs if img.is_primary), imgs[0].url if imgs else None)
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
            status=p.status,
            image_url=img_url,
            images=[{"url": img.url, "is_primary": img.is_primary} for img in imgs],
            is_wishlisted=False
        ))
        
    return out

@router.post("", response_model=ProductOut)
async def create_product(
    product_in: __import__('app.schemas.product', fromlist=['ProductCreate']).ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    import re
    import uuid
    # Create URL friendly slug
    base_slug = re.sub(r'[^a-z0-9]+', '-', product_in.title.lower()).strip('-')
    unique_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
    
    # Mock an owner ID for now since auth dependency isn't fully set up in this file
    # We'll use the ID of the first user in the DB
    from app.models.user import User
    owner_result = await db.execute(select(User).limit(1))
    owner = owner_result.scalars().first()
    owner_id = owner.id if owner else uuid.uuid4()

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
        status="PENDING",
    )
    
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    if product_in.image_url:
        new_image = ProductImage(
            product_id=new_product.id,
            url=product_in.image_url,
            is_primary=True
        )
        db.add(new_image)
        await db.commit()
    
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
        status=new_product.status,
        image_url=product_in.image_url,
        is_wishlisted=False
    )

@router.get("/{slug}", response_model=__import__('app.schemas.product', fromlist=['ProductDetailOut']).ProductDetailOut)
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.owner),
            selectinload(Product.category)
        )
        .where(Product.slug == slug)
    )
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return product

@router.patch("/{id}/status", response_model=ProductOut)
async def update_product_status(
    id: str,
    status_update: __import__('app.schemas.product', fromlist=['ProductStatusUpdate']).ProductStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == id)
    result = await db.execute(stmt)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if status_update.status not in ["PENDING", "APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    product.status = status_update.status
    await db.commit()
    await db.refresh(product)
    
    return product

