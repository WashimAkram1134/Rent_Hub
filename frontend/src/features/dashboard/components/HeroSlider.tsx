"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_href: string;
  image_url: string;
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return <div className="relative rounded-2xl overflow-hidden h-[230px] bg-slate-200 animate-pulse shadow-sm" />;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden h-[230px] shadow-sm group">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === heroIndex ? "opacity-100" : "opacity-0"}`}
        >
          <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 py-6 max-w-sm">
            <p className="text-white/80 text-sm font-medium mb-1">{slide.eyebrow}</p>
            <h1 className="text-white text-3xl font-extrabold leading-tight mb-2">{slide.title}</h1>
            <p className="text-white/80 text-xs leading-relaxed mb-5">{slide.subtitle}</p>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl w-fit transition-colors shadow-lg">
              {slide.cta_text} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}
      {/* Dots */}
      <div className="absolute bottom-4 left-8 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setHeroIndex(i)}
            className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
      {/* Arrow controls */}
      <button
        onClick={() => setHeroIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => setHeroIndex((i) => (i + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
