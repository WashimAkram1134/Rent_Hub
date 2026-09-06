"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Star, ChevronRight, Eye, Sparkles } from "lucide-react";

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
              "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
            rentals_count: 8,
            total_earned: 44800,
            rating: 5.0,
          },
          {
            title: "DJI Mavic 3 Pro Cine Drone",
            image_url:
              "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=150&q=80",
            rentals_count: 5,
            total_earned: 35000,
            rating: 4.9,
          },
          {
            title: "Canon EOS R5 Cinema Kit",
            image_url:
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80",
            rentals_count: 6,
            total_earned: 26400,
            rating: 4.9,
          },
        ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Trophy size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Performing Items</h3>
            <p className="text-[10px] text-slate-400 font-medium">Your highest revenue earners</p>
          </div>
        </div>

        <Link
          href="/listings"
          className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-0.5 hover:underline"
        >
          All <ChevronRight size={13} />
        </Link>
      </div>

      <div className="space-y-3">
        {topList.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                    Item
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{item.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{item.rentals_count} Rentals</span>
                  <span>•</span>
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Star size={10} className="fill-amber-400" />
                    {item.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-black text-emerald-600">৳ {item.total_earned.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 font-semibold">Earned</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
