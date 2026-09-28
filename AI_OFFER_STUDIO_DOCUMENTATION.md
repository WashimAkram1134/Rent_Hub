# RentHub AI Offer Studio — Architecture, Implementation & User Guide

## 1. Executive Summary

The **AI Offer Studio** is a business-facing marketing automation system built directly inside RentHub's **Business Admin Panel** (`/admin/offer-studio`). 

It enables non-technical platform administrators to create promotional offer banners in under 30 seconds by providing only business facts (title, discount, promo code, dates, categories, placement). The AI engine takes these facts, analyzes seasonal and product context, and automatically generates brand-compliant, high-converting design specifications that are rendered deterministically using RentHub's React & CSS design system.

---

## 2. Core Architectural Philosophy: "Template + AI" Hybrid

### Why AI Image Generation Alone Fails for E-Commerce
Traditional generative AI banner tools (e.g., prompting DALL-E or Midjourney to create flat images) fail in production because:
1. **Fact Hallucination**: AI frequently misspells promo codes (`EID20` becomes `EID25` or gibberish), distorts discount figures, or changes dates.
2. **Brand Drift**: Without programmatic constraints, colors, margins, and typography randomly drift away from brand guidelines.
3. **Static & Inaccessible**: Flat pixel images cannot be responsive, cannot be selected or copied, have zero SEO value, and degrade on mobile screens.

### The RentHub Solution: Separating Fact from Design
In RentHub's **AI Offer Studio**:
* **Critical Business Facts are Locked**: The database is the single source of truth for Title, Discount Value, Promo Code, Valid Until Dates, and CTA Link. The AI is structurally prohibited from altering these values.
* **AI Generates Design Specifications (JSON)**: The AI engine chooses layout, typography hierarchy, responsive breakpoints, color treatment, glassmorphism tokens, and visual assets.
* **Deterministic React/SVG Renderer**: The `<RentHubBannerRenderer />` component receives the design JSON alongside the locked business facts and renders real HTML/CSS elements with one-click clipboard copying, high responsiveness, and silky smooth micro-animations.

---

## 3. System Architecture & Components

```text
 Business Admin (Inputs Only)
   │
   ├─ Offer Title (e.g. "Eid Rental Festival 2026")
   ├─ Short Description
   ├─ Discount Value & Type (e.g. "20% OFF")
   ├─ Promo Coupon Code (e.g. "EID20")
   ├─ Start & Expiration Dates
   ├─ Applicable Categories (e.g. Vehicles, Cameras)
   ├─ Target Audience & Banner Placement
   │
   ▼
FastAPI AI Offer Engine (/api/v1/offer-studio/generate)
   │
   ├─ Context Extractor (Detects Season, Category, Urgency, Aesthetic)
   ├─ Curated Asset Repository (High-Resolution Unsplash Rental Photography)
   ├─ RentHub Design Token Generator (Mesh Gradients, Glassmorphism, Badges)
   │
   ▼
Outputs 3 Distinct Design Specifications (JSON)
   │
   ├─ Design 01: Split Hero (Signature Layout)
   ├─ Design 02: High Impact Deal (Massive Centered Offer)
   ├─ Design 03: Dark Luxury / Obsidian Showcase
   │
   ▼
Business Admin Review & AI Actions (/admin/offer-studio)
   │
   ├─ Live Interactive Canvas Preview
   ├─ AI Tweak Actions:
   │    * 💎 Make More Premium
   │    * ⚡ Make Offer Bigger
   │    * ⚪ Make More Minimal
   │    * 🖼️ Change Visual Asset
   │    * 📐 Switch Template Layout
   │    * 🌙 Dark Theme / ☀️ Light Theme
   │
   ▼
Safety Approval Modal & Audit Log (/api/v1/offer-studio/campaigns)
   │
   ├─ Validates locked business terms
   ├─ Records immutable entry in audit_logs
   │
   ▼
Storefront Public Delivery (/api/v1/offer-studio/active)
   │
   ├─ Live rendering on Homepage Hero, Deals & Offers (/offers), Category headers
```

---

## 4. Reusable Template Catalog

The studio features 8 core, responsive templates:

| # | Template ID | Description & Visual Composition | Primary Use Cases |
|---|---|---|---|
| **01** | `split_hero` | High-impact copy, discount pill, and coupon box on left; floating 3D perspective rental asset on right. | Homepage Hero, Eid & Holiday Mega Sales |
| **02** | `large_offer` | Massive centered discount typography (`20% OFF`), glowing promo code coupon, centered CTA. | Flash Sales, Weekend Specials, Urgent Deals |
| **03** | `product_focus` | Left-side editorial copy; prominent product cut-out/visual on clean gradient backdrop. | Vehicles, Cinema Cameras, Tech Gear |
| **04** | `dark_luxury` | Deep obsidian navy (`#05070E`) + emerald/gold accents + dark glassmorphic panels. | Luxury Cars, Cinema Rig packages, Penthouse spaces |
| **05** | `minimal_premium` | Clean light-slate or neutral aesthetic, generous whitespace, crisp coupon tag. | Daily rentals, Student discounts, Furniture |
| **06** | `seasonal_festive` | Ambient warm or emerald/indigo festive backlight, celebratory badges, seasonal motifs. | Religious & Cultural holidays (Eid, Puja, Boishakh) |
| **07** | `category_promo` | Headline with category pills/tags (`[Vehicles] [Cameras]`) and a dynamic preview collage. | Multi-category platform promotions |
| **08** | `flash_deal` | High-urgency styling with burning flame icon, pulsing badge, and countdown timer. | Limited-time platform discounts |

---

## 5. Supported Placements & Dimensions

1. **Homepage Hero Banner (`HOMEPAGE_HERO`)**: Prime 1920×600 top storefront hero banner.
2. **Homepage Offer Card (`OFFER_CARD`)**: High conversion 600×400 compact card.
3. **Category Page Banner (`CATEGORY_BANNER`)**: Header banner across selected category pages.
4. **Deals & Offers Page (`DEALS_PAGE`)**: Featured spotlight banner on `/offers`.
5. **Popup Modal Offer (`POPUP`)**: High-intent overlay modal.
6. **Mobile Banner (`MOBILE_BANNER`)**: Optimized mobile screen card (1080×1350 or compact card).

---

## 6. Implementation Summary

### 1. Database Model (`backend/app/models/offer_campaign.py`)
- Created `OfferCampaign` model registered in SQLAlchemy `Base` and `backend/app/models/__init__.py`.
- Includes locked business data (`title`, `discount_display`, `promo_code`, `start_at`, `end_at`), targeting data, design specification JSON (`design_spec_json`), variations JSON (`variations_json`), and analytics metrics (`views_count`, `clicks_count`).

### 2. AI Offer Engine Service (`backend/app/services/ai_offer_engine.py`)
- **Semantic Context Extractor**: Recognizes holiday keywords (Eid, Ramadan, Summer, Monsoon, Winter, Student, Luxury), mapping them to appropriate motifs, palettes, and typography.
- **Curated Asset Library**: High-resolution rental photography for Vehicles, Cameras, Electronics, Apartments, Furniture, Sports, and Fashion.
- **Variation Generator**: Produces 3 diverse specifications per generation request while strictly locking business values.
- **AI Tweak Engine**: Executes real-time modifications (`make_more_premium`, `make_more_minimal`, `make_offer_prominent`, `change_visual`, `change_layout`, `switch_dark_theme`, `switch_light_theme`).

### 3. API Endpoints (`backend/app/api/v1/endpoints/offer_studio.py`)
- `POST /api/v1/offer-studio/generate`: Generates 3 design variations from business inputs.
- `POST /api/v1/offer-studio/tweak`: Adjusts active design specification without altering business facts.
- `GET /api/v1/offer-studio/campaigns`: Lists campaigns with status, search, and placement filters.
- `POST /api/v1/offer-studio/campaigns`: Persists campaign draft or schedules launch.
- `POST /api/v1/offer-studio/campaigns/{id}/publish`: Approves and publishes offer live, recording audit log.
- `POST /api/v1/offer-studio/campaigns/{id}/pause`: Pauses campaign.
- `DELETE /api/v1/offer-studio/campaigns/{id}`: Deletes campaign.
- `GET /api/v1/offer-studio/active`: Public storefront endpoint serving active published banners filtered by placement.

### 4. Deterministic React Banner Renderer (`frontend/src/components/banners/RentHubBannerRenderer.tsx`)
- Pure, reusable component rendering design JSON specs deterministically.
- Includes interactive copy-to-clipboard coupon box with animated feedback.
- Fluid responsive layouts across mobile, tablet, and desktop.

### 5. Business Admin UI (`frontend/src/app/(dashboard)/admin/offer-studio/page.tsx`)
- Intuitive two-column layout: Form inputs on left, 3 variations + live canvas preview on right.
- AI Quick Action Bar for instant micro-adjustments.
- Safety Approval Modal verifying locked facts prior to publishing.
- Integrated Campaign Management table for viewing, pausing, and editing past campaigns.

### 6. Admin Navigation (`frontend/src/app/(dashboard)/layout.tsx`)
- Added **MARKETING** section to the Business Admin Sidebar:
  - `AI Offer Studio` (`/admin/offer-studio`) with shiny `AI ✨` badge.
  - `Offers & Promotions` (`/admin/promotions`).

### 7. Public Storefront Integration (`frontend/src/app/offers/page.tsx`)
- Integrated `/offer-studio/active` endpoint into `/offers`.
- Automatically displays active AI-generated banners at the top of the deals page, seamlessly falling back to default banners when no AI campaign is active.

---

## 7. How to Use the AI Offer Studio

1. Navigate to **Business Admin Panel → Marketing → AI Offer Studio**.
2. Fill out the business fields:
   * **Title**: e.g., `Eid Rental Festival 2026`
   * **Description**: e.g., `Get 20% off selected rentals`
   * **Discount**: `20` `% OFF`
   * **Promo Code**: `EID20`
   * **Valid Until**: Select your expiration date
   * **Categories**: Check `Vehicles`, `Cameras`, etc.
   * **Placement**: Select `Homepage Hero Banner` or `Deals & Offers Page`
3. Click **✨ Generate 3 Design Variations**.
4. Select one of the 3 preview cards (**Design 01**, **Design 02**, or **Design 03**).
5. (Optional) Use **AI Quick Actions** to tweak:
   * Click **💎 Make More Premium** or **⚡ Make Offer Bigger**.
6. Click **Review & Publish Live 🚀**.
7. Confirm the locked business terms in the Safety Modal.
8. Your banner is immediately live across the designated placement on RentHub!
