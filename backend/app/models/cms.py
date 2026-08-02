from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class HeroBanner(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "hero_banners"

    eyebrow: Mapped[str | None] = mapped_column(String(100), nullable=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(Text, nullable=True)
    cta_text: Mapped[str] = mapped_column(String(50), nullable=False)
    cta_href: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<HeroBanner {self.title}>"


class Promotion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "promotions"

    title: Mapped[str] = mapped_column(String(100), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(200), nullable=True)
    discount_text: Mapped[str] = mapped_column(String(20), nullable=False)
    discount_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    theme_color: Mapped[str] = mapped_column(String(20), nullable=False)
    
    category_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Promotion {self.title}>"


class City(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cities"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    
    listing_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<City {self.name}>"
