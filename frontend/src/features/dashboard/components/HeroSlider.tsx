"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Tag, ShieldCheck } from "lucide-react";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_href: string;
  image_url: string;
  is_offer?: boolean;
  discount_display?: string;
  promo_code?: string;
  applicable_categories?: string[];
  design_spec_json?: any;
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!slides || slides.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides, isHovered]);

  if (!slides || slides.length === 0) {
    return <div className="relative rounded-2xl overflow-hidden h-[240px] bg-slate-200 animate-pulse shadow-sm" />;
  }

  const handleSlideClick = (href: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl overflow-hidden h-[240px] shadow-md group select-none"
    >
      {slides.map((slide, i) => {
        const isActive = i === heroIndex;
        const isOffer = Boolean(slide.is_offer);

        return (
          <div
            key={slide.id}
            onClick={() => handleSlideClick(slide.cta_href)}
            className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Gradient Overlays */}
            <div
              className={`absolute inset-0 ${
                isOffer
                  ? "bg-gradient-to-r from-[#070b18]/95 via-[#0b1329]/80 to-transparent"
                  : "bg-gradient-to-r from-black/80 via-black/45 to-transparent"
              }`}
            />

            {/* Ambient Radial Accent for Offer Slides */}
            {isOffer && (
              <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
            )}

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-7 sm:px-10 py-5 max-w-lg z-10">
              {/* Eyebrow / Offer Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isOffer ? (
                  <>
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      <Sparkles size={11} className="fill-slate-950" />
                      <span>{slide.discount_display || "SPECIAL OFFER"}</span>
                    </span>

                    {slide.promo_code && (
                      <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        <Tag size={10} className="text-amber-300" />
                        <span>Code: {slide.promo_code}</span>
                      </span>
                    )}

                    {slide.applicable_categories && slide.applicable_categories.length > 0 && (
                      <span className="hidden sm:inline-flex text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                        {slide.applicable_categories.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-0.5">
                    {slide.eyebrow}
                  </p>
                )}
              </div>

              {/* Title */}
              <h1 className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight drop-shadow-md mb-1.5">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-white/80 text-xs sm:text-[13px] leading-relaxed line-clamp-2 max-w-md mb-4">
                {slide.subtitle}
              </p>

              {/* CTA Action Button */}
              <div className="flex items-center gap-3">
                <Link
                  href={slide.cta_href || "/categories"}
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${
                    isOffer
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25"
                  }`}
                >
                  <span>{slide.cta_text || "Explore Offers"}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {isOffer && (
                  <span className="text-[11px] text-slate-300 font-medium hidden sm:inline-flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Verified Rentals</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-7 sm:left-10 flex items-center gap-1.5 z-20">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setHeroIndex(i);
            }}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === heroIndex
                ? "w-6 h-2 bg-white shadow-sm"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrow Controls */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setHeroIndex((i) => (i - 1 + slides.length) % slides.length);
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-20 cursor-pointer shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setHeroIndex((i) => (i + 1) % slides.length);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-20 cursor-pointer shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
