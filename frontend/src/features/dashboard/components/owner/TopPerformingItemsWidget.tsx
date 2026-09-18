"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Star, ChevronRight, TrendingUp } from "lucide-react";

interface TopPerformingProps {
  items?: Array<{
    id?: string;
    title: string;
    image_url?: string;
    rentals_count: number;
    total_earned: number;
    rating: number;
  }>;
}

export function TopPerformingItemsWidget({ items }: TopPerformingProps) {
  const topList =
    items && items.length > 0
      ? items
      : [
          {
            title: "Toyota Axio Hybrid 2020",
            image_url:
              "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80",
            rentals_count: 8,
            total_earned: 44800,
            rating: 5.0,
          },
          {
            title: "DJI Mavic 3 Pro Cine Drone",
            image_url:
              "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80",
            rentals_count: 5,
            total_earned: 35000,
            rating: 4.9,
          },
          {
            title: "Canon EOS R5 Cinema Kit",
            image_url:
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80",
            rentals_count: 6,
            total_earned: 26400,
            rating: 4.9,
          },
          {
            title: "Sony FX3 Cinema Camera",
            image_url:
              "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=300&q=80",
            rentals_count: 6,
            total_earned: 22500,
            rating: 4.8,
          },
        ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Top Performing Items</h2>
              <span className="bg-amber-100/70 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Top Earners
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Your highest revenue earners and most requested rental assets</p>
          </div>
        </div>

        <Link
          href="/listings"
          className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 hover:underline self-start sm:self-auto group"
        >
          <span>View All Listings</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Horizontal 4-Column Grid — Fills Width Completely */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topList.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl p-3.5 bg-slate-50/80 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200 group-hover:scale-105 transition-transform">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Item
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold mb-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{item.rentals_count} Rentals</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors" title={item.title}>
                    {item.title}
                  </h4>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-flex items-center gap-0.5">
                    <TrendingUp size={9} />
                    #{idx + 1} Top Earner
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Total Earned</span>
              <span className="text-sm font-black text-emerald-600">
                ৳ {Number(item.total_earned).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
