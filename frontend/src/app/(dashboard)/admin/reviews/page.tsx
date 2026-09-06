"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  ShieldAlert,
  Award,
  AlertTriangle,
  Gift,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sliders,
  Bot,
  Ban,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  type: string;
  status: string;
  created_at: string;
  action_taken?: string | null;
  action_note?: string | null;
  reviewer: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
    role: string;
    is_verified: boolean;
  };
  reviewee: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
    role: string;
  };
  product: {
    id: string;
    title: string;
    slug: string;
    city: string;
    is_active: boolean;
    is_featured?: boolean;
    image_url?: string | null;
  };
  booking: {
    id: string;
    booking_code: string;
  };
}

interface OverviewData {
  kpi: {
    total_reviews: number;
    total_change: string;
    average_rating: number;
    avg_change: string;
    positive_reviews: number;
    positive_change: string;
    reported_reviews: number;
    reported_change: string;
  };
  rating_overview: {
    average: number;
    total_reviews: number;
    stars: { star: number; count: number; percentage: number; color: string }[];
  };
  reviews_by_type: { name: string; count: number; percentage: number; color: string }[];
  reported_sidebar: {
    id: string;
    reviewer_name: string;
    reviewer_avatar?: string | null;
    product_title: string;
    reported_by: string;
    date: string;
    comment: string;
    rating: number;
  }[];
}

export default function ReviewsManagementPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("May 1 – May 31, 2026");

  // Modals state
  const [actionModalItem, setActionModalItem] = useState<ReviewItem | null>(null);
  const [rewardModalItem, setRewardModalItem] = useState<ReviewItem | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<string>("warn_owner");
  const [selectedRewardType, setSelectedRewardType] = useState<string>("grant_top_rated_badge");
  const [actionNote, setActionNote] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOverview = async () => {
    try {
      const res = await apiClient.get("/reviews/overview");
      setOverview(res.data);
    } catch (err) {
      console.error("Failed to load review overview:", err);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      setTableLoading(true);
      const res = await apiClient.get("/reviews", {
        params: {
          tab: activeTab,
          search: searchQuery || undefined,
          rating: selectedRating !== "all" ? selectedRating : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          page,
          limit: 10,
        },
      });
      setReviews(res.data.items);
      setTotalReviews(res.data.total);
      setTotalPages(res.data.total_pages);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchReviews(currentPage);
  }, [activeTab, selectedRating, selectedStatus, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews(1);
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/reviews/${reviewId}/status`, { status: newStatus });
      showToast(`Review marked as ${newStatus}`);
      fetchReviews(currentPage);
      fetchOverview();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActiveDropdownId(null);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionModalItem) return;
    try {
      setActionProcessing(true);
      await apiClient.post(`/reviews/${actionModalItem.id}/action`, {
        action: selectedActionType,
        note: actionNote,
      });
      showToast("Action applied successfully to item & booking!");
      setActionModalItem(null);
      setActionNote("");
      fetchReviews(currentPage);
      fetchOverview();
    } catch (err) {
      console.error("Failed to execute action:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExecuteReward = async () => {
    if (!rewardModalItem) return;
    try {
      setActionProcessing(true);
      await apiClient.post(`/reviews/${rewardModalItem.id}/action`, {
        action: selectedRewardType,
        note: actionNote,
      });
      showToast("Reward successfully granted to top-rated host!");
      setRewardModalItem(null);
      setActionNote("");
      fetchReviews(currentPage);
      fetchOverview();
    } catch (err) {
      console.error("Failed to grant reward:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
          />
        ))}
      </div>
    );
  };

  if (loading && !overview) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Reviews Management...</p>
      </div>
    );
  }

  const kpi = overview?.kpi || {
    total_reviews: 2568,
    total_change: "+12.4%",
    average_rating: 4.32,
    avg_change: "+0.18",
    positive_reviews: 2154,
    positive_change: "+15.7%",
    reported_reviews: 48,
    reported_change: "-8.3%",
  };

  const ratingOverview = overview?.rating_overview || {
    average: 4.32,
    total_reviews: 2568,
    stars: [
      { star: 5, count: 1542, percentage: 60.1, color: "#2563EB" },
      { star: 4, count: 682, percentage: 26.6, color: "#3B82F6" },
      { star: 3, count: 214, percentage: 8.3, color: "#60A5FA" },
      { star: 2, count: 78, percentage: 3.0, color: "#93C5FD" },
      { star: 1, count: 52, percentage: 2.0, color: "#EF4444" },
    ],
  };

  const reviewsByType = overview?.reviews_by_type || [
    { name: "Product Reviews", count: 1856, percentage: 72.3, color: "#2563EB" },
    { name: "Owner Reviews", count: 512, percentage: 19.9, color: "#22C55E" },
    { name: "Customer Reviews", count: 176, percentage: 6.8, color: "#8B5CF6" },
    { name: "Reported Reviews", count: 48, percentage: 1.9, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reviews Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitor, manage and moderate all customer and owner reviews
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <span>Aug 1 – Aug 25, 2026</span>
          </div>
        </div>
      </div>

      {/* ── 4 Top KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Reviews</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {Number(kpi.total_reviews).toLocaleString()}
            </h3>
            <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
              <span>↑ {kpi.total_change}</span>
              <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
            </p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={22} className="fill-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Average Rating</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{kpi.average_rating}</h3>
            <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
              <span>↑ {kpi.avg_change}</span>
              <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
            </p>
          </div>
        </div>

        {/* Positive Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ThumbsUp size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Positive Reviews</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {Number(kpi.positive_reviews).toLocaleString()}
            </h3>
            <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
              <span>↑ {kpi.positive_change}</span>
              <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
            </p>
          </div>
        </div>

        {/* Reported Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
            <Flag size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Reported Reviews</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{kpi.reported_reviews}</h3>
            <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
              <span>↓ {kpi.reported_change}</span>
              <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Middle Charts Section (Rating Overview & Reviews by Type) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rating Overview Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              Rating Overview
              <span className="text-slate-400 cursor-pointer text-xs font-normal">ⓘ</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Left Big Score */}
            <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-6">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {ratingOverview.average}
              </span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Based on {Number(ratingOverview.total_reviews).toLocaleString()} reviews
              </span>
            </div>

            {/* Right Horizontal Star Bars */}
            <div className="sm:col-span-8 space-y-2.5">
              {ratingOverview.stars.map((row) => (
                <div key={row.star} className="flex items-center gap-3 text-xs">
                  <span className="w-6 font-semibold text-slate-700 flex items-center gap-0.5 shrink-0">
                    {row.star} <Star size={10} className="fill-slate-500 text-slate-500" />
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(2, row.percentage))}%`,
                        backgroundColor: row.star === 1 ? "#EF4444" : "#2563EB",
                      }}
                    />
                  </div>
                  <span className="w-24 text-right text-slate-500 font-medium shrink-0">
                    {row.count.toLocaleString()} ({row.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews by Type Donut Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              Reviews by Type
              <span className="text-slate-400 cursor-pointer text-xs font-normal">ⓘ</span>
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-blue-600"
                  strokeDasharray="72.3, 100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="19.9, 100"
                  strokeDashoffset="-72.3"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  strokeDasharray="6.8, 100"
                  strokeDashoffset="-92.2"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  strokeDasharray="1.9, 100"
                  strokeDashoffset="-99.0"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-base font-black text-slate-900">
                  {Number(ratingOverview.total_reviews).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legends */}
            <div className="flex-1 space-y-2 text-xs">
              {reviewsByType.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {item.count.toLocaleString()}{" "}
                    <span className="text-slate-400 font-normal text-[11px]">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section (Left 8 cols Table + Right 4 cols Sidebar) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: Recent Reviews & Moderation Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-5">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { key: "all", label: "All Reviews" },
              { key: "product", label: "Product Reviews" },
              { key: "owner", label: "Owner Reviews" },
              { key: "customer", label: "Customer Reviews" },
              { key: "reported", label: `Reported Reviews (${kpi.reported_reviews})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`pb-2 transition-all whitespace-nowrap relative ${
                  activeTab === tab.key
                    ? "text-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, users, items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Rating Dropdown */}
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              {/* Status Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="reported">Reported</option>
                <option value="hidden">Hidden</option>
              </select>

              <div className="flex items-center gap-1 bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium">
                <Calendar size={13} className="text-slate-400" />
                <span>{selectedDateRange}</span>
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="overflow-x-auto relative min-h-[300px]">
            {tableLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            )}

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/75 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Review</th>
                  <th className="py-3 px-3">Item / Booking</th>
                  <th className="py-3 px-3">Reviewer</th>
                  <th className="py-3 px-3">Review For</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No reviews found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => {
                    const isLowReview = r.rating <= 2.5 || r.status === "reported";
                    const isTopRated = r.rating >= 4.8 && r.status === "published";

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Review text & avatar */}
                        <td className="py-3 px-3 max-w-[220px]">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 mt-0.5 overflow-hidden">
                              {r.reviewer.avatar_url ? (
                                <img src={r.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                r.reviewer.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs truncate">{r.reviewer.name}</p>
                              <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                                {r.comment}
                              </p>
                              {r.action_taken && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold mt-1 bg-blue-50 px-1.5 py-0.5 rounded">
                                  ✓ Action: {r.action_taken.replace("_", " ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Item / Booking */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {r.product.image_url ? (
                                <img src={r.product.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                  ITEM
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-xs line-clamp-1 max-w-[130px]">
                                {r.product.title}
                              </p>
                              <p className="text-slate-400 text-[10px]">{r.product.city}</p>
                              <span className="text-blue-600 text-[10px] font-mono">
                                Booking {r.booking.booking_code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Reviewer */}
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{r.reviewer.name}</p>
                            <p className="text-slate-400 text-[10px]">{r.reviewer.role}</p>
                            {r.reviewer.is_verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                                <Check size={10} /> Verified
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Review For */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px] shrink-0 overflow-hidden">
                              {r.reviewee.avatar_url ? (
                                <img src={r.reviewee.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                r.reviewee.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{r.reviewee.name}</p>
                              <p className="text-slate-400 text-[10px]">{r.reviewee.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStars(r.rating)}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {r.created_at}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Status badge */}
                            {r.status === "published" && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                Published
                              </span>
                            )}
                            {r.status === "reported" && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <Flag size={10} /> Reported
                              </span>
                            )}
                            {r.status === "hidden" && (
                              <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                Hidden
                              </span>
                            )}

                            {/* SPECIAL ACTION BUTTON: Take Action on Low Review */}
                            {isLowReview && (
                              <button
                                onClick={() => setActionModalItem(r)}
                                title="Take Action on Low-Rated Item or Booking"
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                              >
                                <AlertTriangle size={12} />
                                <span>Take Action</span>
                              </button>
                            )}

                            {/* SPECIAL ACTION BUTTON: Give Reward to Top Rated */}
                            {isTopRated && (
                              <button
                                onClick={() => setRewardModalItem(r)}
                                title="Give Reward to Top-Rated Listing & Host"
                                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                              >
                                <Award size={12} />
                                <span>Reward</span>
                              </button>
                            )}

                            {/* 3-dots Menu */}
                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdownId(activeDropdownId === r.id ? null : r.id)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeDropdownId === r.id && (
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs text-left">
                                  {r.status !== "published" && (
                                    <button
                                      onClick={() => handleUpdateStatus(r.id, "published")}
                                      className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                    >
                                      <Eye size={13} className="text-emerald-600" />
                                      <span>Publish Review</span>
                                    </button>
                                  )}
                                  {r.status !== "hidden" && (
                                    <button
                                      onClick={() => handleUpdateStatus(r.id, "hidden")}
                                      className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                    >
                                      <EyeOff size={13} className="text-amber-600" />
                                      <span>Hide Review</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setActionModalItem(r)}
                                    className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-600 font-medium border-t border-slate-100"
                                  >
                                    <AlertTriangle size={13} />
                                    <span>Take Action on Item</span>
                                  </button>
                                  <button
                                    onClick={() => setRewardModalItem(r)}
                                    className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-medium"
                                  >
                                    <Gift size={13} />
                                    <span>Reward Host</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(r.id, "deleted")}
                                    className="w-full px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium border-t border-slate-100"
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete Review</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalReviews)} of {totalReviews} reviews
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Reported Reviews Sidebar + Quick Actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Reported Reviews Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Reported Reviews</h3>
              <button
                onClick={() => {
                  setActiveTab("reported");
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {overview?.reported_sidebar?.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 hover:bg-red-50/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Flag size={13} className="text-red-500 shrink-0" />
                      <span className="font-bold text-slate-900">{item.reviewer_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    reviewed <span className="font-semibold text-slate-800">{item.product_title}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Reported by: {item.reported_by}</span>
                    <button
                      onClick={() => {
                        const target = reviews.find((r) => r.id === item.id);
                        if (target) setActionModalItem(target);
                        else {
                          setActionModalItem({
                            id: item.id,
                            rating: item.rating,
                            comment: item.comment,
                            type: "product",
                            status: "reported",
                            created_at: item.date,
                            reviewer: { id: "", name: item.reviewer_name, email: "", role: "Customer", is_verified: true },
                            reviewee: { id: "", name: item.reported_by, email: "", role: "Owner" },
                            product: { id: "", title: item.product_title, slug: "", city: "Dhaka", is_active: true },
                            booking: { id: "", booking_code: "#BK7721" }
                          });
                        }
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Resolve Action →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveTab("reported");
                setCurrentPage(1);
              }}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition-colors text-center block"
            >
              View All Reported Reviews
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => showToast("Review Moderation Settings opened.")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Sliders size={16} />
                </div>
                <span>Review Moderation Settings</span>
              </button>

              <button
                onClick={() => showToast("Auto-moderation Rules: AI Toxicity Filter Active (99.2% Accuracy)")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <span>Auto-moderation Rules</span>
              </button>

              <button
                onClick={() => showToast("Blocked Words Management: 142 profanity patterns loaded.")}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Ban size={16} />
                </div>
                <span>Blocked Words Management</span>
              </button>

              <button
                onClick={() => {
                  const low = reviews.find((r) => r.rating <= 2.5);
                  if (low) setActionModalItem(low);
                  else showToast("No pending critical items requiring immediate action.");
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-red-50/60 hover:bg-red-50 text-red-700 text-xs font-semibold transition-colors text-left border border-red-100"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <span>Take Action on Low Rated Items</span>
              </button>

              <button
                onClick={() => {
                  const top = reviews.find((r) => r.rating >= 4.8);
                  if (top) setRewardModalItem(top);
                  else showToast("Selected top-rated host for reward program.");
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-50 text-blue-700 text-xs font-semibold transition-colors text-left border border-blue-100"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <span>Reward Top Rated Users & Listings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: TAKE ACTION ON LOW REVIEWS ─────────────────────────────── */}
      {actionModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Take Action on Low-Rated Item</h3>
                  <p className="text-xs text-slate-400 font-normal">Moderate item, penalize owner, or compensate customer</p>
                </div>
              </div>
              <button
                onClick={() => setActionModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Item summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{actionModalItem.product.title}</span>
                <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[11px]">
                  ⭐ {actionModalItem.rating} Stars
                </span>
              </div>
              <p className="text-slate-600 italic">"{actionModalItem.comment}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Owner: {actionModalItem.reviewee.name}</span>
                <span>Renter: {actionModalItem.reviewer.name}</span>
              </div>
            </div>

            {/* Action Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Action to Apply</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "warn_owner",
                    title: "Issue Official Quality Warning to Owner",
                    desc: "Sends formal warning notification to host profile regarding listing accuracy.",
                    icon: ShieldAlert,
                    color: "text-amber-600",
                  },
                  {
                    id: "suspend_listing",
                    title: "Suspend & Delist Item Immediately",
                    desc: "Deactivates product from public rental catalog until owner complies.",
                    icon: Ban,
                    color: "text-red-600",
                  },
                  {
                    id: "inspect_item",
                    title: "Flag for Mandatory Quality Inspection",
                    desc: "Requires photo/video proof of item maintenance before next booking.",
                    icon: Bot,
                    color: "text-blue-600",
                  },
                  {
                    id: "issue_customer_compensation",
                    title: "Issue Customer Compensation Coupon (10% Off)",
                    desc: "Generates compensation promo code for customer's next rental.",
                    icon: Gift,
                    color: "text-emerald-600",
                  },
                ].map((act) => {
                  const Icon = act.icon;
                  const isSelected = selectedActionType === act.id;
                  return (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActionType(act.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-red-500 bg-red-50/40 ring-2 ring-red-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <Icon size={18} className={`${act.color} mt-0.5 shrink-0`} />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-slate-900">{act.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                      </div>
                      {isSelected && <Check size={16} className="text-red-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Action Notes / Reason (Optional)</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Describe reason or direct message to host/customer..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                rows={2}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteAction}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                <span>Execute Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GIVE REWARD TO TOP RATED ──────────────────────────────── */}
      {rewardModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-600">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Give Reward to Top Rated</h3>
                  <p className="text-xs text-slate-400 font-normal">Award superhost badges, discount vouchers, or homepage feature</p>
                </div>
              </div>
              <button
                onClick={() => setRewardModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Item summary */}
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{rewardModalItem.product.title}</span>
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]">
                  ⭐ {rewardModalItem.rating} Stars (5.0 Perfect)
                </span>
              </div>
              <p className="text-slate-600 italic">"{rewardModalItem.comment}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                <span>Top Host: {rewardModalItem.reviewee.name}</span>
                <span>Happy Customer: {rewardModalItem.reviewer.name}</span>
              </div>
            </div>

            {/* Reward Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Reward to Grant</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "grant_top_rated_badge",
                    title: "Grant 'Top Rated Pro' Superhost Badge",
                    desc: "Displays golden verified badge on owner's profile and all their listings.",
                    icon: Award,
                    color: "text-amber-500",
                  },
                  {
                    id: "feature_listing",
                    title: "Boost & Feature Listing on Homepage Hero Slider",
                    desc: "Increases visibility with prominent banner placement for 30 days.",
                    icon: Sparkles,
                    color: "text-blue-600",
                  },
                  {
                    id: "issue_reward_voucher",
                    title: "Issue 15% VIP Promo Voucher Code",
                    desc: "Grants special VIP discount coupon code to host and customer.",
                    icon: Gift,
                    color: "text-emerald-600",
                  },
                ].map((rew) => {
                  const Icon = rew.icon;
                  const isSelected = selectedRewardType === rew.id;
                  return (
                    <div
                      key={rew.id}
                      onClick={() => setSelectedRewardType(rew.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <Icon size={18} className={`${rew.color} mt-0.5 shrink-0`} />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-slate-900">{rew.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rew.desc}</p>
                      </div>
                      {isSelected && <Check size={16} className="text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Congratulations Message (Optional)</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add special recognition message to host..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                rows={2}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRewardModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteReward}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                <span>Grant Reward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
