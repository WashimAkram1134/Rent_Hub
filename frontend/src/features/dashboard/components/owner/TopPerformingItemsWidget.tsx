"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Star, ChevronRight, TrendingUp, Plus, Package } from "lucide-react";

interface TopPerformingItem {
  id?: string;
  slug?: string;
  title: string;
  image_url?: string;
  rentals_count: number;
  total_earned: number;
  rating: number;
  price_per_day?: number;
}

interface TopPerformingProps {
  items?: TopPerformingItem[];
}

export function TopPerformingItemsWidget({ items = [] }: TopPerformingProps) {
  // Sort items by total earnings in descending order (highest revenue earner first: #1, #2, #3, ...)
  const sortedItems = Array.isArray(items)
    ? [...items].sort((a, b) => (Number(b.total_earned) || 0) - (Number(a.total_earned) || 0))
    : [];

  const hasItems = sortedItems.length > 0;

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

      {/* Content */}
      {!hasItems ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 mb-3">
            <Package size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Rental Items Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            Your top performing and highest revenue generating items will be automatically tracked and ranked here once you add rental listings.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-98"
          >
            <Plus size={14} />
            <span>Add Your First Listing</span>
          </Link>
        </div>
      ) : (
        /* Horizontal 4-Column Grid — Fills Width Completely */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedItems.slice(0, 4).map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative rounded-xl p-3.5 bg-slate-50/80 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200 group-hover:scale-105 transition-transform">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                        Item
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold mb-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{Number(item.rating || 5.0).toFixed(1)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">
                        {item.rentals_count} {item.rentals_count === 1 ? "Rental" : "Rentals"}
                      </span>
                    </div>
                    <Link
                      href={item.id ? `/products/${item.slug || item.id}` : "/listings"}
                      className="text-xs font-bold text-slate-900 truncate block group-hover:text-indigo-600 transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
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
                  ৳ {Number(item.total_earned || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
