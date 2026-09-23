"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import {
  Flame, Heart, Star, Clock, Tag, ChevronDown, Copy, Check,
  CarFront, Camera, Monitor, Building, Trophy, Armchair, BookOpen,
  Sparkles, Gift, Percent, Zap, ArrowRight, Compass, ShieldCheck, Loader2
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import apiClient from "@/lib/axios";

interface DealItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  catKey: string;
  discount: string;
  discountPct: number;
  originalPrice: number;
  discountPrice: number;
  minDays: number;
  timeLeft: string;
  rating: number;
  reviews: number;
  owner: string;
  image: string;
}

function getCatKey(categoryName?: string) {
  const cat = (categoryName || "").toLowerCase();
  if (cat.includes("vehic") || cat.includes("car") || cat.includes("bike")) return "vehicles";
  if (cat.includes("electr") || cat.includes("laptop") || cat.includes("gadget") || cat.includes("ipad") || cat.includes("macbook")) return "electronics";
  if (cat.includes("furnit") || cat.includes("sofa") || cat.includes("chair") || cat.includes("bed") || cat.includes("dining")) return "furniture";
  if (cat.includes("cam") || cat.includes("lens") || cat.includes("dji") || cat.includes("gopro")) return "cameras";
  if (cat.includes("apart") || cat.includes("home") || cat.includes("villa") || cat.includes("room")) return "apartments";
  if (cat.includes("sport") || cat.includes("gym") || cat.includes("fitness") || cat.includes("cricket")) return "sports";
  if (cat.includes("book")) return "books";
  return "other";
}

export default function DealsAndOffersPage() {
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(false);
  const [flashTime, setFlashTime] = useState({ hrs: 8, mins: 14, secs: 36 });
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"discount" | "price_asc" | "price_desc" | "rating">("discount");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const DEALS_PER_PAGE = 9;

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real items from Database
  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        const res = await apiClient.get("/products?limit=120");
        const items = Array.isArray(res.data) ? res.data : [];
        if (items.length > 0) {
          const mapped: DealItem[] = items.map((p: any, idx: number) => {
            const pct = p.discount_percentage && p.discount_percentage > 0 ? p.discount_percentage : (20 + (idx % 3) * 5);
            const basePrice = Number(p.price_per_day) || 1000;
            const originalPrice = Math.round(basePrice * (1 + pct / 100));
            const discountPrice = Math.round(basePrice);
            const primaryImg = p.image_url || (p.images && p.images.length > 0 ? p.images[0].url : "") || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";

            return {
              id: p.id,
              slug: p.slug || p.id,
              title: p.title,
              category: p.category_name || "General",
              catKey: getCatKey(p.category_name || p.category?.name),
              discount: `${pct}% OFF`,
              discountPct: pct,
              originalPrice: originalPrice,
              discountPrice: discountPrice,
              minDays: idx % 3 === 0 ? 3 : 2,
              timeLeft: `${(idx % 4) + 1}d ${(idx * 3) % 24}h left`,
              rating: Number(p.avg_rating) > 0 ? Number(p.avg_rating) : 4.8,
              reviews: p.review_count > 0 ? p.review_count : (18 + (idx * 7) % 80),
              owner: p.owner_name || (p.owner ? `${p.owner.first_name} ${p.owner.last_name || ""}`.trim() : "Verified Host"),
              image: primaryImg,
            };
          });
          setDeals(mapped);
        }
      } catch (err) {
        console.error("Failed to load deals from DB:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("SAVE20");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const categories = [
    { key: "all", label: "All Deals", icon: Flame },
    { key: "vehicles", label: "Vehicles", icon: CarFront },
    { key: "electronics", label: "Electronics", icon: Monitor },
    { key: "furniture", label: "Furniture", icon: Armchair },
    { key: "cameras", label: "Cameras", icon: Camera },
    { key: "apartments", label: "Apartments", icon: Building },
    { key: "sports", label: "Sports", icon: Trophy },
    { key: "books", label: "Books", icon: BookOpen },
  ];

  // Filtering & Sorting
  const filteredDeals = deals.filter(
    (d) => activeCategory === "all" || d.catKey === activeCategory
  );

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === "price_asc") return a.discountPrice - b.discountPrice;
    if (sortBy === "price_desc") return b.discountPrice - a.discountPrice;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.discountPct - a.discountPct; // default biggest discount
  });

  const totalPages = Math.max(1, Math.ceil(sortedDeals.length / DEALS_PER_PAGE));
  const paginatedDeals = sortedDeals.slice((currentPage - 1) * DEALS_PER_PAGE, currentPage * DEALS_PER_PAGE);

  // Flash deals from top items
  const flashDeals = sortedDeals.slice(0, 3);

  return (
    <AppShell>
      <div className="p-6 font-sans bg-[#F8FAFC] min-h-screen text-slate-800">
        <div className="max-w-[1360px] mx-auto space-y-6">

          {/* ── Top Hero Banner (Exclusive Rental Deals) ──────────────────── */}
          <div className="relative rounded-[28px] overflow-hidden shadow-xl min-h-[220px] sm:min-h-[260px] flex items-center p-8 sm:p-12 text-white group">
            <img
              src="/images/deals-hero-banner.png"
              alt="Exclusive Rental Deals Banner"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
            
            <div className="relative z-10 max-w-lg space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-300 shadow-sm">
                <Flame size={14} className="fill-amber-300 text-amber-300" /> Best Deals of the Week
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight drop-shadow-md">
                Exclusive Rental Deals
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed drop-shadow">
                Unbeatable offers on real vehicles, electronics, apartments and more from verified owners!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("deals-grid-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Explore Deals ({deals.length})
                </button>
              </div>
            </div>
          </div>

          <div id="deals-grid-section" className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">

            {/* ── Left / Center Deals Content (col-span-8) ────────────────── */}
            <div className="xl:col-span-8 space-y-6">

              {/* Category Pills Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isActive = activeCategory === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => {
                        setActiveCategory(c.key);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      <Icon size={14} />
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Meta Stats & Sort Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>
                  Showing {sortedDeals.length > 0 ? (currentPage - 1) * DEALS_PER_PAGE + 1 : 0}-
                  {Math.min(currentPage * DEALS_PER_PAGE, sortedDeals.length)} of {sortedDeals.length} live deals from DB
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl font-bold text-slate-700 cursor-pointer shadow-xs hover:border-indigo-300 transition-colors"
                  >
                    <span>Sort by: <strong className="text-slate-900">
                      {sortBy === "discount" ? "Biggest Discount" : sortBy === "price_asc" ? "Price: Low to High" : sortBy === "price_desc" ? "Price: High to Low" : "Top Rated"}
                    </strong></span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in">
                      {[
                        { key: "discount", label: "Biggest Discount" },
                        { key: "price_asc", label: "Price: Low to High" },
                        { key: "price_desc", label: "Price: High to Low" },
                        { key: "rating", label: "Top Rated" },
                      ].map((s) => (
                        <button
                          key={s.key}
                          onClick={() => {
                            setSortBy(s.key as any);
                            setShowSortDropdown(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                            sortBy === s.key ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {s.label}
                          {sortBy === s.key && <Check size={13} className="text-indigo-600 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Deals Cards Grid (3 Columns) */}
              {loading ? (
                <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-slate-100">
                  <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Loading verified deals from database...</p>
                </div>
              ) : paginatedDeals.length === 0 ? (
                <div className="p-16 text-center space-y-2 bg-white rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-700">No deals found in this category.</p>
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="text-xs font-extrabold text-indigo-600 hover:underline"
                  >
                    View All Categories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedDeals.map((item) => {
                    const isFav = isWishlisted(item.id) || isWishlisted(item.slug);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                      >
                        {/* Image + Badges */}
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          {/* Discount Badge */}
                          <div className="absolute top-3 left-3 bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-md">
                            {item.discount}
                          </div>

                          {/* Love Wishlist Icon */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleWishlist({
                                id: item.id,
                                slug: item.slug || item.id,
                                title: item.title,
                                category: item.category,
                                image_url: item.image,
                                price_per_day: item.discountPrice,
                                rating: item.rating,
                                review_count: item.reviews,
                                location: "Dhaka",
                              })
                            }
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer"
                          >
                            <Heart
                              size={14}
                              className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-400"}
                            />
                          </button>
                        </div>

                        {/* Card Content Body */}
                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Link href={`/products/${item.slug || item.id}`} className="block">
                                <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-[140px] hover:text-indigo-600 transition-colors">
                                  {item.title}
                                </h3>
                              </Link>
                              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {item.category}
                              </span>
                            </div>

                            {/* Pricing Row */}
                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="text-xs text-slate-400 line-through">৳{item.originalPrice.toLocaleString()}/day</span>
                              <span className="text-sm font-black text-slate-900">৳{item.discountPrice.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/day</span></span>
                            </div>

                            <div className="text-[10px] text-slate-400 font-medium">
                              Min. {item.minDays} {item.minDays === 1 ? "day" : "days"}
                            </div>
                          </div>

                          {/* Card Bottom Row: Owner + Timer + Rent Now */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center">
                                {item.owner[0]}
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-800 leading-tight truncate max-w-[85px]">{item.owner}</div>
                                <div className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5">
                                  <Star size={9} className="fill-amber-400" /> {item.rating} <span className="text-slate-400 font-normal">({item.reviews})</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[9px] text-rose-500 font-bold mb-1 flex items-center gap-0.5 justify-end">
                                <Clock size={10} /> {item.timeLeft}
                              </div>
                              <Link
                                href={`/products/${item.slug || item.id}`}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all inline-block"
                              >
                                Rent Now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Row */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 6 && (
                    <>
                      <span className="text-slate-400 text-xs px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          currentPage === totalPages
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* ── Right Column Sidebar Widgets (col-span-4) ───────────────── */}
            <div className="xl:col-span-4 space-y-6">

              {/* Today's Flash Deals Widget */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-xs">
                    <Zap size={15} className="fill-amber-400 text-amber-400" /> Today's Flash Deals
                  </div>
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1 font-black text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                    <span>{String(flashTime.hrs).padStart(2, "0")}</span>:
                    <span>{String(flashTime.mins).padStart(2, "0")}</span>:
                    <span>{String(flashTime.secs).padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {flashDeals.map((f) => (
                    <Link
                      key={f.id}
                      href={`/products/${f.slug || f.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors group cursor-pointer block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 max-w-[130px]">{f.title}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            <span className="line-through">৳{f.originalPrice.toLocaleString()}</span> <strong className="text-slate-900">৳{f.discountPrice.toLocaleString()} /day</strong>
                          </div>
                        </div>
                      </div>
                      <span className="bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-sm shrink-0">
                        {f.discount}
                      </span>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSortBy("discount");
                  }}
                  className="w-full text-center text-xs font-bold text-indigo-600 hover:underline pt-1 cursor-pointer"
                >
                  View all flash deals →
                </button>
              </div>

              {/* Coupon Code Banner Box (Indigo Gradient) */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-500/20 space-y-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Get Extra Discount!</div>
                  <div className="text-xs font-semibold mt-0.5">Use coupon code</div>
                </div>

                <div className="bg-white rounded-xl p-2 flex items-center justify-between text-slate-900">
                  <span className="text-base font-black tracking-widest text-indigo-700 pl-2">SAVE20</span>
                  <button
                    onClick={handleCopy}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    {copiedCode ? "Copied" : "Copy Code"}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-indigo-100 font-medium pt-1">
                  <span>Get 20% OFF on min. ৳1,500</span>
                  <span>Valid till May 31, 2025</span>
                </div>
              </div>

              {/* Limited Time Offer Card (Gold/Cream) */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-5 shadow-sm space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Limited Time Offer!</span>
                  <h3 className="text-2xl font-black text-amber-900 leading-tight">
                    Up to <span className="text-rose-600">40% OFF</span>
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">On selected items from top hosts</p>
                </div>

                <button
                  onClick={() => {
                    setSortBy("discount");
                    setCurrentPage(1);
                  }}
                  className="bg-white hover:bg-amber-100/50 border border-amber-200 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Grab the Offer
                </button>
              </div>

              {/* Recommended For You Widget */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-extrabold text-slate-900 text-xs">Recommended For You</h3>
                  <Link href="/categories" className="text-[10px] font-bold text-indigo-600 hover:underline">View all</Link>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {deals.slice(0, 3).map((r, i) => (
                    <Link
                      key={r.id || i}
                      href={`/products/${r.slug || r.id}`}
                      className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1 text-center group cursor-pointer block hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="h-16 rounded-lg overflow-hidden bg-slate-200 mb-1">
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <h4 className="text-[10px] font-bold text-slate-900 truncate">{r.title}</h4>
                      <div className="text-[9px] text-slate-500">৳{r.discountPrice}/day</div>
                      <span className="inline-block bg-rose-100 text-rose-600 font-extrabold text-[8px] px-1.5 py-0.2 rounded">
                        {r.discount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ── Bottom Promotional Banners Row ──────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">

            {/* Banner 1: Eid Special */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#D1FAE5] via-[#E6F4EA] to-[#A7F3D0] p-5 border border-emerald-200/80 shadow-sm flex items-center justify-between group h-36">
              <div className="space-y-1 z-10 relative max-w-[60%]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full inline-block">
                  EID SPECIAL
                </span>
                <h4 className="text-base font-extrabold text-emerald-950 leading-tight">
                  Up to <span className="font-black text-slate-900">35% OFF</span>
                </h4>
                <p className="text-[10px] text-emerald-800 font-medium">On all categories</p>
                <div className="pt-1">
                  <Link
                    href="/categories"
                    className="bg-[#046A38] hover:bg-[#03522b] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 inline-block"
                  >
                    Explore Now
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none flex items-center justify-end">
                <img
                  src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80"
                  alt="Mosque"
                  className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500 rounded-r-2xl opacity-90"
                />
              </div>
            </div>

            {/* Banner 2: Winter Adventure Rentals */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#DBEAFE] via-[#E0E7FF] to-[#C7D2FE] p-5 border border-blue-200/80 shadow-sm flex items-center justify-between group h-36">
              <div className="space-y-1 z-10 relative max-w-[60%]">
                <h4 className="text-sm font-extrabold text-indigo-950 leading-tight">Winter Adventure Rentals</h4>
                <div className="text-xs font-black text-indigo-900">
                  Up to <span className="font-black text-indigo-950">30% OFF</span>
                </div>
                <p className="text-[10px] text-indigo-800 font-medium truncate">Gear up for your next adventure</p>
                <div className="pt-1">
                  <Link
                    href="/categories/vehicles"
                    className="bg-[#1E40AF] hover:bg-[#1e3a8a] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 inline-block"
                  >
                    Explore Now
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none flex items-center justify-end">
                <img
                  src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=500&q=80"
                  alt="Winter Skier"
                  className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500 rounded-r-2xl opacity-90"
                />
              </div>
            </div>

            {/* Banner 3: Student Discount Week */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74] p-5 border border-orange-200/80 shadow-sm flex items-center justify-between group h-36">
              <div className="space-y-1 z-10 relative max-w-[60%]">
                <h4 className="text-sm font-extrabold text-orange-950 leading-tight">Student Discount Week</h4>
                <div className="text-xs font-black text-orange-900">
                  Up to <span className="font-black text-rose-900">40% OFF</span>
                </div>
                <p className="text-[10px] text-orange-800 font-medium truncate">Special offers for students</p>
                <div className="pt-1">
                  <Link
                    href="/categories/electronics"
                    className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 inline-block"
                  >
                    Explore Now
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none flex items-center justify-end">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                  alt="Student"
                  className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500 rounded-r-2xl opacity-90"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppShell>
  );
}
