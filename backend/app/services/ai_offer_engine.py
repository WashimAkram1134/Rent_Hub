from __future__ import annotations

import copy
import random
from typing import Any, Optional
from datetime import datetime


# ─── High-Resolution Rental Asset Library (Curated per Category) ────────────
CATEGORY_ASSET_LIBRARY: dict[str, list[dict[str, str]]] = {
    "Vehicles": [
        {
            "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
            "title": "Luxury Sports Car on Open Road",
            "tag": "Luxury Car"
        },
        {
            "url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
            "title": "Modern Performance Sedan Night Lights",
            "tag": "Sedan"
        },
        {
            "url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
            "title": "All-Terrain Adventure 4x4 SUV",
            "tag": "Adventure SUV"
        },
        {
            "url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
            "title": "Premium Touring Motorcycle",
            "tag": "Motorbike"
        }
    ],
    "Cameras": [
        {
            "url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
            "title": "Professional Mirrorless Cinema Rig",
            "tag": "Cinema Camera"
        },
        {
            "url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
            "title": "Vintage & Modern Lens Collection",
            "tag": "Prime Lenses"
        },
        {
            "url": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80",
            "title": "Aerial Cinema Drone Kit",
            "tag": "4K Drone"
        }
    ],
    "Electronics": [
        {
            "url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
            "title": "Pro Laptop & Studio Setup",
            "tag": "MacBook & Workstation"
        },
        {
            "url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
            "title": "High-End Gaming & Creator Laptop",
            "tag": "Performance Laptop"
        },
        {
            "url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80",
            "title": "Smart Audio & Wearables Kit",
            "tag": "Audio Gear"
        }
    ],
    "Apartments": [
        {
            "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "title": "Luxury Penthouse Living Room",
            "tag": "Penthouse"
        },
        {
            "url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "title": "Modern Cozy Studio Apartment",
            "tag": "City Studio"
        }
    ],
    "Furniture": [
        {
            "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
            "title": "Minimalist Emerald Velvet Sofa",
            "tag": "Designer Sofa"
        },
        {
            "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
            "title": "Ergonomic Office & Home Living",
            "tag": "Office Suite"
        }
    ],
    "Sports": [
        {
            "url": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
            "title": "Pro Mountain Bike & Fitness Gear",
            "tag": "Outdoor Cycling"
        },
        {
            "url": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80",
            "title": "Strength & Gym Equipment Kit",
            "tag": "Gym Equipment"
        }
    ],
    "Fashion": [
        {
            "url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
            "title": "Designer Festive & Wedding Collection",
            "tag": "Festive Wear"
        }
    ],
    "General": [
        {
            "url": "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80",
            "title": "Premium Verified Rentals Assortment",
            "tag": "Rent Anything"
        }
    ]
}


class AIOfferEngine:
    """
    Intelligent design engine that converts business offer facts into
    high-converting, brand-compliant RentHub design specifications in JSON.
    """

    @classmethod
    def detect_context(cls, title: str, description: str, categories: list[str]) -> dict[str, str]:
        text = f"{title} {description}".lower()
        
        # 1. Seasonality & Holiday Motif
        if any(w in text for w in ["eid", "ramadan", "roza", "iftar", "chand", "qurbani"]):
            season = "festive_eid"
            motif = "crescent_stars"
        elif any(w in text for w in ["boishakh", "pohela", "noboborsho", "puja", "diwali"]):
            season = "cultural_festive"
            motif = "floral_mandala"
        elif any(w in text for w in ["summer", "monsoon", "rain", "roadtrip", "weekend", "escape"]):
            season = "monsoon_roadtrip"
            motif = "water_mesh"
        elif any(w in text for w in ["winter", "december", "holiday", "new year", "january"]):
            season = "winter_wonder"
            motif = "crystalline_glow"
        elif any(w in text for w in ["student", "campus", "semester", "exam"]):
            season = "student_season"
            motif = "geometric_dots"
        elif any(w in text for w in ["flash", "urgent", "midnight", "today only", "super deal"]):
            season = "flash_surge"
            motif = "speed_stripes"
        else:
            season = "all_season_premium"
            motif = "ambient_orbs"

        # 2. Primary Category
        primary_cat = "General"
        if categories and len(categories) > 0:
            first = categories[0]
            for cat_key in CATEGORY_ASSET_LIBRARY.keys():
                if cat_key.lower() in first.lower() or first.lower() in cat_key.lower():
                    primary_cat = cat_key
                    break
        else:
            for cat_key in CATEGORY_ASSET_LIBRARY.keys():
                if cat_key.lower() in text:
                    primary_cat = cat_key
                    break

        # 3. Tone & Aesthetic
        if any(w in text for w in ["luxury", "vip", "exclusive", "supercar", "cinema"]):
            tone = "dark_luxury"
        elif any(w in text for w in ["student", "budget", "affordable", "save", "minimal"]):
            tone = "minimal_clean"
        elif season == "festive_eid":
            tone = "festive_celebration"
        else:
            tone = "modern_bold"

        return {
            "season": season,
            "motif": motif,
            "primary_category": primary_cat,
            "tone": tone
        }

    @classmethod
    def pick_asset(cls, category: str, custom_url: Optional[str] = None) -> str:
        if custom_url and custom_url.startswith("http"):
            return custom_url
        
        assets = CATEGORY_ASSET_LIBRARY.get(category) or CATEGORY_ASSET_LIBRARY["General"]
        chosen = random.choice(assets)
        return chosen["url"]

    @classmethod
    def generate_variations(
        cls,
        title: str,
        description: str,
        discount_display: str,
        promo_code: str,
        valid_until: str,
        categories: list[str],
        cta_text: str,
        cta_url: str,
        target_audience: str = "CUSTOMERS",
        placement: str = "HOMEPAGE_HERO",
        campaign_theme: Optional[str] = None,
        custom_image_url: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """
        Creates 3 distinct, high-impact design specifications for RentHub.
        Every variation locks critical business facts and alters composition,
        palette, typography scale, badges, and decorative accents.
        """
        context = cls.detect_context(title, description, categories)
        primary_cat = context["primary_category"]
        season = campaign_theme or context["season"]

        # Base locked business facts (AI is structurally prohibited from modifying these)
        locked_content = {
            "headline": title,
            "description": description,
            "discount_display": discount_display,
            "promo_code": promo_code,
            "valid_until": valid_until,
            "cta_text": cta_text,
            "cta_url": cta_url,
            "categories": categories if categories else [primary_cat],
            "target_audience": target_audience,
        }

        image_1 = cls.pick_asset(primary_cat, custom_image_url)
        # Select distinct 2nd and 3rd images if available
        cat_assets = CATEGORY_ASSET_LIBRARY.get(primary_cat) or CATEGORY_ASSET_LIBRARY["General"]
        image_2 = cat_assets[1]["url"] if len(cat_assets) > 1 else image_1
        image_3 = cat_assets[2]["url"] if len(cat_assets) > 2 else image_1

        # ─────────────────────────────────────────────────────────────────────
        # VARIATION 1: Split Hero / Festive & Category Signature
        # ─────────────────────────────────────────────────────────────────────
        var_1_template = "seasonal_festive" if season == "festive_eid" else "split_hero"
        var_1_bg_primary = "#090D1A" if season != "festive_eid" else "#081024"
        var_1_accent = "#4F46E5" if season != "festive_eid" else "#6366F1"

        var_1 = {
            "variation_id": "var_01",
            "variation_label": "Design 01 — Split Hero (Signature)",
            "template": var_1_template,
            "theme": season,
            "locked_content": locked_content,
            "palette": {
                "bg_type": "gradient_mesh",
                "bg_primary": var_1_bg_primary,
                "bg_secondary": "#1E1B4B",
                "accent": var_1_accent,
                "accent_glow": "#818CF8",
                "accent_secondary": "#06B6D4",
                "text_headline": "#FFFFFF",
                "text_body": "#94A3B8",
                "badge_bg": "rgba(99, 102, 241, 0.18)",
                "badge_border": "rgba(129, 140, 248, 0.35)",
                "badge_text": "#C7D2FE",
                "cta_bg": "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                "cta_text": "#FFFFFF",
                "cta_hover_bg": "#4338CA",
                "coupon_bg": "rgba(15, 23, 42, 0.75)",
                "coupon_border": "rgba(99, 102, 241, 0.4)",
                "coupon_text": "#E0E7FF",
            },
            "typography": {
                "headline_scale": "text-2xl sm:text-3xl md:text-5xl",
                "headline_weight": "font-black tracking-tight",
                "offer_scale": "text-3xl sm:text-4xl md:text-6xl",
                "offer_weight": "font-black tracking-tight",
                "body_scale": "text-xs sm:text-sm md:text-base",
            },
            "layout": {
                "content_position": "left",
                "visual_position": "right",
                "text_align": "left",
                "card_style": "glassmorphic_deep",
                "border_radius": "rounded-2xl md:rounded-3xl",
                "padding": "p-6 sm:p-8 md:p-12",
            },
            "visual": {
                "asset_url": image_1,
                "asset_tag": f"{primary_cat} Special",
                "composition": "floating_card_with_shadow",
                "aspect_ratio": "16/9",
                "overlay_gradient": "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(10,15,29,0.85) 100%)",
            },
            "decorations": {
                "show_ambient_blob": True,
                "blob_color": "rgba(99, 102, 241, 0.25)",
                "show_grid_pattern": True,
                "motif_type": context["motif"],
                "show_seasonal_motif": True,
                "offer_badge_style": "pulsing_pill",
                "promo_code_style": "dashed_coupon_box",
                "show_verified_badge": True,
            }
        }

        # ─────────────────────────────────────────────────────────────────────
        # VARIATION 2: Large Offer Focus (High-Conversion Centered)
        # ─────────────────────────────────────────────────────────────────────
        var_2 = {
            "variation_id": "var_02",
            "variation_label": "Design 02 — High Impact Deal",
            "template": "large_offer",
            "theme": "high_conversion_deal",
            "locked_content": locked_content,
            "palette": {
                "bg_type": "radial_burst",
                "bg_primary": "#0B0F19",
                "bg_secondary": "#172554",
                "accent": "#2563EB",
                "accent_glow": "#38BDF8",
                "accent_secondary": "#F59E0B",
                "text_headline": "#FFFFFF",
                "text_body": "#CBD5E1",
                "badge_bg": "rgba(245, 158, 11, 0.2)",
                "badge_border": "rgba(245, 158, 11, 0.5)",
                "badge_text": "#FDE68A",
                "cta_bg": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                "cta_text": "#FFFFFF",
                "cta_hover_bg": "#1E40AF",
                "coupon_bg": "rgba(30, 41, 59, 0.9)",
                "coupon_border": "rgba(56, 189, 248, 0.5)",
                "coupon_text": "#BAE6FD",
            },
            "typography": {
                "headline_scale": "text-xl sm:text-2xl md:text-3xl",
                "headline_weight": "font-bold tracking-tight",
                "offer_scale": "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
                "offer_weight": "font-black tracking-tighter drop-shadow-xl",
                "body_scale": "text-xs sm:text-sm md:text-base",
            },
            "layout": {
                "content_position": "center",
                "visual_position": "background_ambient",
                "text_align": "center",
                "card_style": "high_contrast_radial",
                "border_radius": "rounded-2xl md:rounded-3xl",
                "padding": "p-6 sm:p-10 md:p-14",
            },
            "visual": {
                "asset_url": image_2,
                "asset_tag": "Verified Deals",
                "composition": "ambient_backdrop_blur",
                "aspect_ratio": "16/9",
                "overlay_gradient": "linear-gradient(180deg, rgba(11,15,25,0.7) 0%, rgba(11,15,25,0.95) 100%)",
            },
            "decorations": {
                "show_ambient_blob": True,
                "blob_color": "rgba(56, 189, 248, 0.22)",
                "show_grid_pattern": False,
                "motif_type": "glow_spotlight",
                "show_seasonal_motif": False,
                "offer_badge_style": "golden_ribbon",
                "promo_code_style": "neon_ticket",
                "show_verified_badge": True,
            }
        }

        # ─────────────────────────────────────────────────────────────────────
        # VARIATION 3: Dark Luxury / Modern Minimalist Showcase
        # ─────────────────────────────────────────────────────────────────────
        var_3_template = "dark_luxury" if primary_cat in ["Vehicles", "Cameras", "Apartments"] else "product_focus"
        var_3 = {
            "variation_id": "var_03",
            "variation_label": f"Design 03 — {var_3_template.replace('_', ' ').title()}",
            "template": var_3_template,
            "theme": "dark_luxury_obsidian",
            "locked_content": locked_content,
            "palette": {
                "bg_type": "linear_sleek",
                "bg_primary": "#05070E",
                "bg_secondary": "#0D111E",
                "accent": "#10B981",
                "accent_glow": "#34D399",
                "accent_secondary": "#8B5CF6",
                "text_headline": "#FFFFFF",
                "text_body": "#94A3B8",
                "badge_bg": "rgba(16, 185, 129, 0.15)",
                "badge_border": "rgba(16, 185, 129, 0.4)",
                "badge_text": "#6EE7B7",
                "cta_bg": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                "cta_text": "#FFFFFF",
                "cta_hover_bg": "#047857",
                "coupon_bg": "rgba(15, 23, 42, 0.8)",
                "coupon_border": "rgba(16, 185, 129, 0.35)",
                "coupon_text": "#A7F3D0",
            },
            "typography": {
                "headline_scale": "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
                "headline_weight": "font-extrabold tracking-tight",
                "offer_scale": "text-4xl sm:text-5xl md:text-6xl",
                "offer_weight": "font-black tracking-tight",
                "body_scale": "text-xs sm:text-sm md:text-base",
            },
            "layout": {
                "content_position": "left",
                "visual_position": "right",
                "text_align": "left",
                "card_style": "minimal_obsidian_slate",
                "border_radius": "rounded-2xl md:rounded-3xl",
                "padding": "p-6 sm:p-8 md:p-12",
            },
            "visual": {
                "asset_url": image_3,
                "asset_tag": f"RentHub {primary_cat}",
                "composition": "sleek_cutout_card",
                "aspect_ratio": "16/9",
                "overlay_gradient": "linear-gradient(90deg, rgba(5,7,14,0.9) 0%, rgba(5,7,14,0) 70%)",
            },
            "decorations": {
                "show_ambient_blob": True,
                "blob_color": "rgba(16, 185, 129, 0.2)",
                "show_grid_pattern": True,
                "motif_type": "fine_hairline_grid",
                "show_seasonal_motif": False,
                "offer_badge_style": "emerald_pill",
                "promo_code_style": "dashed_coupon_box",
                "show_verified_badge": True,
            }
        }

        return [var_1, var_2, var_3]

    @classmethod
    def apply_tweak(cls, spec: dict[str, Any], action: str, category: Optional[str] = None) -> dict[str, Any]:
        """
        Dynamically applies an AI action to adjust the design specification.
        Crucially, locked_content is strictly preserved.
        """
        tweaked = copy.deepcopy(spec)
        palette = tweaked.setdefault("palette", {})
        layout = tweaked.setdefault("layout", {})
        decorations = tweaked.setdefault("decorations", {})
        typography = tweaked.setdefault("typography", {})
        visual = tweaked.setdefault("visual", {})

        cat = category or "Vehicles"

        if action == "make_more_premium":
            palette["bg_primary"] = "#05070E"
            palette["bg_secondary"] = "#0B0F19"
            palette["accent"] = "#6366F1"
            palette["accent_glow"] = "#818CF8"
            palette["accent_secondary"] = "#F59E0B"
            palette["badge_bg"] = "rgba(245, 158, 11, 0.12)"
            palette["badge_border"] = "rgba(245, 158, 11, 0.4)"
            palette["badge_text"] = "#FDE68A"
            decorations["motif_type"] = "fine_hairline_grid"
            decorations["offer_badge_style"] = "golden_ribbon"
            layout["card_style"] = "minimal_obsidian_slate"
            typography["headline_weight"] = "font-black tracking-tight"

        elif action == "make_more_minimal":
            decorations["show_ambient_blob"] = False
            decorations["show_grid_pattern"] = False
            decorations["show_seasonal_motif"] = False
            palette["bg_type"] = "solid_subtle"
            palette["bg_primary"] = "#0F172A"
            palette["bg_secondary"] = "#1E293B"
            palette["accent"] = "#3B82F6"
            palette["badge_bg"] = "rgba(255, 255, 255, 0.08)"
            palette["badge_border"] = "rgba(255, 255, 255, 0.15)"
            palette["badge_text"] = "#F8FAFC"
            layout["card_style"] = "clean_slate_minimal"

        elif action == "make_offer_prominent":
            tweaked["template"] = "large_offer"
            layout["content_position"] = "center"
            layout["text_align"] = "center"
            typography["offer_scale"] = "text-6xl sm:text-7xl md:text-8xl"
            typography["offer_weight"] = "font-black tracking-tighter drop-shadow-2xl"
            palette["accent"] = "#EF4444"
            palette["accent_glow"] = "#F87171"
            palette["badge_bg"] = "rgba(239, 68, 68, 0.2)"
            palette["badge_border"] = "rgba(239, 68, 68, 0.5)"
            palette["badge_text"] = "#FECACA"
            decorations["offer_badge_style"] = "pulsing_pill"
            decorations["promo_code_style"] = "neon_ticket"

        elif action == "switch_dark_theme":
            palette["bg_primary"] = "#090D1A"
            palette["bg_secondary"] = "#111827"
            palette["text_headline"] = "#FFFFFF"
            palette["text_body"] = "#94A3B8"
            palette["coupon_bg"] = "rgba(15, 23, 42, 0.85)"
            palette["coupon_text"] = "#E2E8F0"

        elif action == "switch_light_theme":
            palette["bg_primary"] = "#F8FAFC"
            palette["bg_secondary"] = "#EEF2F6"
            palette["text_headline"] = "#0F172A"
            palette["text_body"] = "#475569"
            palette["badge_bg"] = "rgba(79, 70, 229, 0.1)"
            palette["badge_border"] = "rgba(79, 70, 229, 0.25)"
            palette["badge_text"] = "#4338CA"
            palette["coupon_bg"] = "rgba(255, 255, 255, 0.95)"
            palette["coupon_text"] = "#1E293B"
            palette["coupon_border"] = "#CBD5E1"

        elif action == "change_visual":
            assets = CATEGORY_ASSET_LIBRARY.get(cat) or CATEGORY_ASSET_LIBRARY["General"]
            curr_url = visual.get("asset_url")
            other_assets = [a for a in assets if a["url"] != curr_url]
            chosen = random.choice(other_assets) if other_assets else assets[0]
            visual["asset_url"] = chosen["url"]
            visual["asset_tag"] = chosen.get("tag", f"{cat} Special")

        elif action == "change_layout":
            templates_order = ["split_hero", "large_offer", "product_focus", "dark_luxury", "seasonal_festive"]
            curr_template = tweaked.get("template", "split_hero")
            try:
                next_idx = (templates_order.index(curr_template) + 1) % len(templates_order)
            except ValueError:
                next_idx = 0
            new_template = templates_order[next_idx]
            tweaked["template"] = new_template
            if new_template == "large_offer":
                layout["content_position"] = "center"
                layout["text_align"] = "center"
            else:
                layout["content_position"] = "left"
                layout["text_align"] = "left"

        elif action == "regenerate":
            # Re-generate with refreshed visual and slight variation
            visual["asset_url"] = cls.pick_asset(cat)
            decorations["show_ambient_blob"] = not decorations.get("show_ambient_blob", True)

        return tweaked
