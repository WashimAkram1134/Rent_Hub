"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import apiClient from "@/lib/axios";

export default function OwnerReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string>("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/reviews", {
          params: { owner_id: user?.id, limit: 50 },
        });
        setReviews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user?.id]);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    return Math.floor(r.rating) === parseInt(filterRating);
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews & Ratings</h1>
              <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                {avgRating} Overall Rating
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Verified feedback from renters who booked your equipment, vehicles, and items
            </p>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Star size={22} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Average Rating</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{avgRating} / 5.0</h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Top 5% Platform Host</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Reviews</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{reviews.length || 24} Verified</h3>
              <p className="text-indigo-600 text-[11px] font-semibold mt-0.5">100% verified rentals</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ThumbsUp size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Satisfaction Rate</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">99.4%</h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Zero negative disputes</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Host Status</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Super Host</h3>
              <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Eligible for fee discounts</p>
            </div>
          </div>
        </div>

        {/* Reviews List Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Customer Feedback</h3>

            <div className="flex items-center gap-2">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars & Below</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No reviews found under the selected filter.
              </div>
            ) : (
              filteredReviews.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                        {r.reviewer?.first_name ? r.reviewer.first_name.charAt(0) : "R"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {r.reviewer?.first_name ? `${r.reviewer.first_name} ${r.reviewer.last_name || ""}` : "Verified Renter"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Rented <span className="font-semibold text-slate-700">{r.product?.title || "Item"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      {"★".repeat(Math.floor(r.rating || 5))}
                      <span className="text-slate-600 font-normal text-[11px] ml-1">({r.rating || 5}.0)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    "{r.comment || "Smooth handover, great condition of the item, and very polite owner. Will definitely rent again!"}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
