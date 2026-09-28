"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Flame,
  Tag,
  Star,
  ExternalLink,
  Percent,
} from "lucide-react";

export interface DesignSpec {
  variation_id?: string;
  variation_label?: string;
  template: string;
  theme?: string;
  locked_content?: {
    headline: string;
    description: string;
    discount_display: string;
    promo_code: string;
    valid_until: string;
    cta_text: string;
    cta_url: string;
    categories?: string[];
    target_audience?: string;
  };
  palette: {
    bg_type?: string;
    bg_primary: string;
    bg_secondary?: string;
    accent: string;
    accent_glow?: string;
    accent_secondary?: string;
    text_headline: string;
    text_body: string;
    badge_bg?: string;
    badge_border?: string;
    badge_text?: string;
    cta_bg?: string;
    cta_text?: string;
    cta_hover_bg?: string;
    coupon_bg?: string;
    coupon_border?: string;
    coupon_text?: string;
  };
  typography?: {
    headline_scale?: string;
    headline_weight?: string;
    offer_scale?: string;
    offer_weight?: string;
    body_scale?: string;
  };
  layout?: {
    content_position?: string;
    visual_position?: string;
    text_align?: string;
    card_style?: string;
    border_radius?: string;
    padding?: string;
  };
  visual?: {
    asset_url: string;
    asset_tag?: string;
    composition?: string;
    aspect_ratio?: string;
    overlay_gradient?: string;
  };
  decorations?: {
    show_ambient_blob?: boolean;
    blob_color?: string;
    show_grid_pattern?: boolean;
    motif_type?: string;
    show_seasonal_motif?: boolean;
    offer_badge_style?: string;
    promo_code_style?: string;
    show_verified_badge?: boolean;
  };
}

export interface LockedOfferData {
  title: string;
  description: string;
  discount_display: string;
  promo_code: string;
  valid_until?: string;
  cta_text: string;
  cta_url: string;
  applicable_categories?: string[];
  target_audience?: string;
  placement?: string;
}

interface BannerRendererProps {
  spec: DesignSpec;
  businessData?: LockedOfferData;
  placement?: string;
  isPreview?: boolean;
  onCtaClick?: () => void;
  className?: string;
}

export default function RentHubBannerRenderer({
  spec,
  businessData,
  placement = "HOMEPAGE_HERO",
  isPreview = false,
  onCtaClick,
  className = "",
}: BannerRendererProps) {
  const [copied, setCopied] = useState(false);

  // Business facts come strictly from businessData if passed, fallback to spec.locked_content
  const headline = businessData?.title || spec.locked_content?.headline || "Exclusive Rental Promotion";
  const description = businessData?.description || spec.locked_content?.description || "Book verified rentals with instant escrow deposit protection.";
  const discount = businessData?.discount_display || spec.locked_content?.discount_display || "20% OFF";
  const promoCode = businessData?.promo_code || spec.locked_content?.promo_code || "RENTHUB20";
  const validUntil = businessData?.valid_until || spec.locked_content?.valid_until || "Limited Time Offer";
  const ctaText = businessData?.cta_text || spec.locked_content?.cta_text || "Explore Offers";
  const categories = businessData?.applicable_categories || spec.locked_content?.categories || ["Vehicles", "Cameras"];
  const defaultCategoryHref = categories && categories.length > 0
    ? `/search?categories=${encodeURIComponent(categories.join(","))}&promo=${encodeURIComponent(promoCode)}`
    : "/offers";
  const ctaUrl = (businessData?.cta_url && businessData.cta_url !== "/offers" && !businessData.cta_url.startsWith("/search?categories="))
    ? businessData.cta_url
    : defaultCategoryHref;

  const palette = spec.palette || {
    bg_primary: "#0A0F1D",
    bg_secondary: "#1E1B4B",
    accent: "#4F46E5",
    text_headline: "#FFFFFF",
    text_body: "#94A3B8",
  };

  const visual = spec.visual || {
    asset_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    asset_tag: "Verified Special",
  };

  const decorations = spec.decorations || {
    show_ambient_blob: true,
    show_grid_pattern: true,
    show_verified_badge: true,
  };

  const copyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Determine container styling based on placement
  const isCard = placement === "OFFER_CARD" || placement === "POPUP";
  const isCompact = placement === "MOBILE_BANNER" || placement === "OFFER_CARD";
  const isCentered = spec.template === "large_offer" || spec.layout?.content_position === "center";

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-300 shadow-2xl border ${
        spec.layout?.border_radius || "rounded-2xl md:rounded-3xl"
      } ${className}`}
      style={{
        background:
          palette.bg_type === "gradient_mesh" || palette.bg_secondary
            ? `radial-gradient(circle at 15% 25%, ${palette.accent}22 0%, transparent 45%), linear-gradient(135deg, ${palette.bg_primary} 0%, ${palette.bg_secondary || palette.bg_primary} 100%)`
            : palette.bg_primary,
        borderColor: palette.badge_border || "rgba(255,255,255,0.1)",
      }}
    >
      {/* ── Background Decorative Layer ─────────────────────────────────────── */}
      {decorations.show_ambient_blob && (
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 animate-pulse"
          style={{
            backgroundColor: decorations.blob_color || palette.accent,
          }}
        />
      )}

      {decorations.show_grid_pattern && (
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${palette.text_headline} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Seasonal Crescent / Motif for Eid & Festive Campaigns */}
      {decorations.motif_type === "crescent_stars" && (
        <div className="absolute top-4 right-6 opacity-20 pointer-events-none hidden sm:block">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={palette.accent} strokeWidth="1.5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
      )}

      {/* ── Template 02: Large Offer (Centered High Impact) ────────────────── */}
      {isCentered ? (
        <div className="relative z-10 py-10 px-6 sm:px-12 md:py-16 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Eyebrow / Campaign Theme Tag */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border backdrop-blur-md"
            style={{
              backgroundColor: palette.badge_bg || "rgba(255,255,255,0.1)",
              borderColor: palette.badge_border || "rgba(255,255,255,0.2)",
              color: palette.badge_text || palette.accent,
            }}
          >
            <Sparkles size={14} className="animate-spin-slow" />
            <span>Special Promotional Deal</span>
          </div>

          {/* Huge Discount Display */}
          <div
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight drop-shadow-2xl my-2 leading-none"
            style={{
              color: palette.accent_glow || palette.accent,
              textShadow: `0 0 40px ${palette.accent}66`,
            }}
          >
            {discount}
          </div>

          {/* Headline */}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-2"
            style={{ color: palette.text_headline }}
          >
            {headline}
          </h2>

          {/* Description */}
          <p
            className="text-sm sm:text-base max-w-xl mb-6 leading-relaxed"
            style={{ color: palette.text_body }}
          >
            {description}
          </p>

          {/* Interactive Coupon Box & CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
            {/* Promo Code Box */}
            <div
              onClick={copyCoupon}
              className="group cursor-pointer flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: palette.coupon_bg || "rgba(15,23,42,0.8)",
                borderColor: palette.coupon_border || palette.accent,
                color: palette.coupon_text || "#FFFFFF",
              }}
              title="Click to copy code"
            >
              <Tag size={15} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-400">Use Code:</span>
              <span className="font-mono font-black tracking-wider text-sm sm:text-base">
                {promoCode}
              </span>
              <button
                type="button"
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors ml-1"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            {/* CTA Button */}
            {isPreview ? (
              <button
                type="button"
                onClick={onCtaClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: palette.cta_bg || palette.accent,
                  color: palette.cta_text || "#FFFFFF",
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: palette.cta_bg || palette.accent,
                  color: palette.cta_text || "#FFFFFF",
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Valid until note */}
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
            <Clock size={13} className="text-slate-500" />
            <span>Valid until {validUntil}</span>
            {categories.length > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span>Applies to: {categories.join(", ")}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ── Template 01, 03, 04: Split Hero / Dark Luxury / Product Focus ───── */
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8 md:p-12">
          {/* Left Column: Business Content & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Badge & Discount Pill */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-sm"
                style={{
                  backgroundColor: palette.badge_bg || "rgba(79, 70, 229, 0.15)",
                  borderColor: palette.badge_border || "rgba(79, 70, 229, 0.3)",
                  color: palette.badge_text || palette.accent,
                }}
              >
                <Sparkles size={13} />
                <span>{discount}</span>
              </span>

              {decorations.show_verified_badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Escrow Protected</span>
                </span>
              )}

              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Campaign Headline */}
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight mb-3"
              style={{ color: palette.text_headline }}
            >
              {headline}
            </h2>

            {/* Short Description */}
            <p
              className="text-sm sm:text-base leading-relaxed mb-6 max-w-xl line-clamp-3"
              style={{ color: palette.text_body }}
            >
              {description}
            </p>

            {/* Interactive Coupon Box & CTA Button Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full">
              {/* Promo Code Box */}
              <div
                onClick={copyCoupon}
                className="group cursor-pointer flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-dashed transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{
                  backgroundColor: palette.coupon_bg || "rgba(15,23,42,0.8)",
                  borderColor: palette.coupon_border || palette.accent,
                  color: palette.coupon_text || "#FFFFFF",
                }}
                title="Click to copy coupon code"
              >
                <Tag size={14} className="text-amber-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
                    Coupon Code
                  </span>
                  <span className="font-mono font-extrabold tracking-wider text-sm sm:text-base leading-tight mt-0.5">
                    {promoCode}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-1"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} className="text-slate-300" />
                  )}
                </button>
              </div>

              {/* CTA Action */}
              {isPreview ? (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: palette.cta_bg || palette.accent,
                    color: palette.cta_text || "#FFFFFF",
                  }}
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  href={ctaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: palette.cta_bg || palette.accent,
                    color: palette.cta_text || "#FFFFFF",
                  }}
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* Validity Footer */}
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
              <Calendar size={13} className="text-slate-500" />
              <span>Valid through {validUntil}</span>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src={visual.asset_url}
                alt={headline}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    visual.overlay_gradient ||
                    "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(10,15,29,0.75) 100%)",
                }}
              />

              {/* Floating Asset Pill */}
              {visual.asset_tag && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span>{visual.asset_tag}</span>
                </div>
              )}

              {/* Floating Guarantee Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wide uppercase shadow-lg">
                100% Verified
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
