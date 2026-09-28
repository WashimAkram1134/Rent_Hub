from __future__ import annotations

from datetime import datetime
from uuid import UUID
from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OfferCampaign(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    OfferCampaign represents a promotional campaign created via AI Offer Studio.
    Business facts (discount, promo code, validity dates, title) are locked and 
    serve as the source of truth, while design_spec_json defines the visual layout.
    """
    __tablename__ = "offer_campaigns"

    # Business Information (Locked Source of Truth)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    discount_type: Mapped[str] = mapped_column(String(20), default="PERCENTAGE", nullable=False)  # PERCENTAGE or FIXED_AMOUNT
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_display: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "20% OFF" or "৳500 OFF"
    promo_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    
    # Targeting & Scope
    applicable_categories: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    target_audience: Mapped[str] = mapped_column(String(50), default="CUSTOMERS", nullable=False)  # EVERYONE, CUSTOMERS, OWNERS, STUDENTS
    placement: Mapped[str] = mapped_column(String(50), default="HOMEPAGE_HERO", nullable=False)
    
    # CTA & Navigation
    cta_text: Mapped[str] = mapped_column(String(60), default="Explore Offers", nullable=False)
    cta_url: Mapped[str] = mapped_column(String(255), default="/offers", nullable=False)

    # Lifecycle & Scheduling
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT", index=True, nullable=False)  # DRAFT, SCHEDULED, PUBLISHED, PAUSED, EXPIRED

    # AI Design Specification
    selected_template: Mapped[str] = mapped_column(String(50), default="split_hero", nullable=False)
    design_spec_json: Mapped[dict] = mapped_column(JSON, nullable=False)  # Active Design Spec
    variations_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # 3 Generated Variations
    visual_asset_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    campaign_theme: Mapped[str] = mapped_column(String(50), default="festive_premium", nullable=False)

    # Analytics & Author
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_by: Mapped[str | None] = mapped_column(String(100), default="Business Admin", nullable=True)

    def __repr__(self) -> str:
        return f"<OfferCampaign {self.title} - {self.promo_code} ({self.status})>"
