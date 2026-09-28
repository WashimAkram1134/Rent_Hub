from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class OfferCampaignGenerateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Campaign title, e.g. Eid Rental Festival")
    description: str = Field(..., max_length=500, description="Short promotional description")
    discount_type: str = Field(default="PERCENTAGE", description="PERCENTAGE or FIXED_AMOUNT")
    discount_value: float = Field(..., gt=0, description="Discount numeric value, e.g. 20 or 500")
    promo_code: str = Field(..., min_length=2, max_length=30, description="Promo coupon code, e.g. EID20")
    start_at: Optional[datetime] = Field(default=None, description="Offer start datetime")
    end_at: Optional[datetime] = Field(default=None, description="Offer validity expiration datetime")
    applicable_categories: list[str] = Field(default_factory=list, description="List of categories, e.g. ['Vehicles', 'Cameras']")
    target_audience: str = Field(default="CUSTOMERS", description="Target audience: EVERYONE, CUSTOMERS, OWNERS, STUDENTS")
    cta_text: str = Field(default="Explore Offers", max_length=50, description="Button call to action")
    cta_url: str = Field(default="/offers", max_length=255, description="CTA redirection link")
    placement: str = Field(default="HOMEPAGE_HERO", description="Placement: HOMEPAGE_HERO, OFFER_CARD, CATEGORY_BANNER, DEALS_PAGE, POPUP, MOBILE_BANNER")
    campaign_theme: Optional[str] = Field(default=None, description="Optional theme override: festive_eid, dark_luxury, summer_vibes, minimal_clean, etc.")
    custom_image_url: Optional[str] = Field(default=None, description="Optional direct visual asset link")


class OfferCampaignTweakRequest(BaseModel):
    design_spec: dict[str, Any] = Field(..., description="Current design specification JSON")
    action: str = Field(..., description="Tweak action: make_more_premium, make_more_minimal, make_offer_prominent, switch_dark_theme, switch_light_theme, change_visual, change_layout, regenerate")
    category: Optional[str] = Field(default=None, description="Primary category hint")
    campaign_theme: Optional[str] = Field(default=None, description="Theme hint")


class OfferCampaignCreate(BaseModel):
    title: str
    description: str
    discount_type: str = "PERCENTAGE"
    discount_value: float
    promo_code: str
    start_at: datetime
    end_at: datetime
    applicable_categories: list[str] = []
    target_audience: str = "CUSTOMERS"
    cta_text: str = "Explore Offers"
    cta_url: str = "/offers"
    placement: str = "HOMEPAGE_HERO"
    status: str = "DRAFT"  # DRAFT, SCHEDULED, PUBLISHED
    selected_template: str = "split_hero"
    design_spec_json: dict[str, Any]
    variations_json: list[dict[str, Any]] = []
    visual_asset_url: Optional[str] = None
    campaign_theme: str = "festive_premium"


class OfferCampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    promo_code: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    applicable_categories: Optional[list[str]] = None
    target_audience: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    placement: Optional[str] = None
    status: Optional[str] = None
    selected_template: Optional[str] = None
    design_spec_json: Optional[dict[str, Any]] = None
    variations_json: Optional[list[dict[str, Any]]] = None
    visual_asset_url: Optional[str] = None
    campaign_theme: Optional[str] = None


class OfferCampaignOut(BaseModel):
    id: UUID
    title: str
    description: str
    discount_type: str
    discount_value: float
    discount_display: str
    promo_code: str
    applicable_categories: list[str]
    target_audience: str
    placement: str
    cta_text: str
    cta_url: str
    start_at: datetime
    end_at: datetime
    status: str
    selected_template: str
    design_spec_json: dict[str, Any]
    variations_json: list[dict[str, Any]]
    visual_asset_url: Optional[str] = None
    campaign_theme: str
    views_count: int
    clicks_count: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GenerateResponse(BaseModel):
    campaign_theme: str
    detected_season: str
    primary_category: str
    variations: list[dict[str, Any]]
    locked_business_data: dict[str, Any]
