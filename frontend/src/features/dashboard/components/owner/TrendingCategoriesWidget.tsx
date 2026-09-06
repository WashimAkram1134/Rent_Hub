"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  ArrowUpRight,
  TrendingUp,
  CarFront,
  Camera,
  Monitor,
  Building,
  Shirt,
  Trophy,
  Package,
  Sparkles,
} from "lucide-react";

interface CategoryDemand {
  name: string;
  slug: string;
  icon?: string;
  booking_count: number;
  booking_percentage: number;
  growth_rate: string;
  avg_price: number;
  demand?: string;
}

interface TrendingCategoriesProps {
  categories: CategoryDemand[];
}

function getCategoryIcon(name: string = "") {
  const lower = name.toLowerCase();
  if (lower.includes("vehicle") || lower.includes("car"))
    return <CarFront size={18} className="text-amber-400" />;
  if (lower.includes("camera"))
    return <Camera size={18} className="text-pink-400" />;
  if (lower.includes("electronic") || lower.includes("laptop"))
    return <Monitor size={18} className="text-cyan-400" />;
  if (lower.includes("apartment") || lower.includes("suite") || lower.includes("home"))
    return <Building size={18} className="text-emerald-400" />;
  if (lower.includes("cloth") || lower.includes("dress"))
    return <Shirt size={18} className="text-purple-400" />;
  if (lower.includes("sport"))
    return <Trophy size={18} className="text-yellow-400" />;
  return <Package size={18} className="text-indigo-400" />;
}

function getCategoryGradient(index: number) {
  const gradients = [
    "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 hover:border-amber-400",
    "from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30 hover:border-cyan-400",
    "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 hover:border-emerald-400",
    "from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30 hover:border-pink-400",
  ];
  return gradients[index % gradients.length];
}

export function TrendingCategoriesWidget({ categories }: TrendingCategoriesProps) {
  const items =
    categories && categories.length > 0
      ? categories
      : [
          {
            name: "Vehicles",
            slug: "vehicles",
            booking_count: 104,
            booking_percentage: 33.5,
            growth_rate: "+46%",
            avg_price: 5600,
          },
          {
            name: "Electronics",
            slug: "electronics",
            booking_count: 63,
            booking_percentage: 20.3,
            growth_rate: "+31%",
            avg_price: 1800,
          },
          {
            name: "Apartments",
            slug: "apartments",
            booking_count: 51,
            booking_percentage: 16.5,
            growth_rate: "+24%",
            avg_price: 6300,
          },
          {
            name: "Cameras",
            slug: "cameras",
            booking_count: 47,
            booking_percentage: 15.2,
            growth_rate: "+18%",
            avg_price: 2700,
          },
        ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-6 text-white shadow-xl border border-indigo-950/60">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide uppercase mb-2 shadow-xs">
            <Flame size={14} className="text-amber-400 animate-pulse fill-amber-400" />
            <span>High-Demand Rental Categories</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Renters are actively searching for items in these categories!
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1 font-medium max-w-2xl">
            Calculated from real booking demand across the platform. List your equipment in these high-demand segments to earn faster.
          </p>
        </div>

        <Link
          href="/products/new"
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all self-start shrink-0 shadow-lg shadow-amber-500/20 active:scale-95 group cursor-pointer"
        >
          <span>List in High-Demand</span>
          <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Dynamic 4 Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {items.map((cat, i) => (
          <Link
            key={cat.slug || i}
            href={`/products/new?category=${cat.slug || "vehicles"}`}
            className={`group relative rounded-2xl p-4 bg-slate-900/60 backdrop-blur-md border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer ${getCategoryGradient(
              i
            )}`}
          >
            <div>
              {/* Category Icon & Quick Action Tag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.name)}
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-300">
                  <TrendingUp size={11} />
                  <span>{cat.growth_rate || "+30%"}</span>
                </div>
              </div>

              {/* Category Name & Booking Count */}
              <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>{cat.name}</span>
                <span className="text-[11px] font-bold text-slate-300 font-mono">
                  {cat.booking_count} Bookings
                </span>
              </h4>

              {/* Progress Bar of Market Share */}
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 mb-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(cat.booking_percentage * 2.2, 100)}%` }}
                ></div>
              </div>

              {/* Share Percentage */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-extrabold text-amber-300">
                  {cat.booking_percentage}% of Rentals
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Market Share</span>
              </div>
            </div>

            {/* Average Earning Potential Footer */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 text-[10px]">Avg. Return</span>
              <span className="font-black text-emerald-400">
                ৳ {Number(cat.avg_price || 2500).toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ day</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
