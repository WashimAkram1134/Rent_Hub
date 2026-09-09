"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, SlidersHorizontal, Star, ArrowRight,
  RotateCcw, Sparkles, Filter, ChevronDown, Check, X,
  ShieldCheck, PackageOpen
} from "lucide-react";
import apiClient from "@/lib/axios";

// ── Curated Showcase / Fallback Catalog ───────────────────────────────────────
export interface SearchItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  price_per_day: number;
  city: string;
  area: string;
  avg_rating: number;
  review_count: number;
  image_url: string;
  badge?: string;
  is360?: boolean;
}

const FALLBACK_ITEMS: SearchItem[] = [
  {
    id: "range-rover-velar-360",
    slug: "range-rover-velar-360",
    title: "Range Rover Velar R-Dynamic 2024 (360° View)",
    category: "Vehicles",
    categorySlug: "vehicles",
    price_per_day: 14000,
    city: "Dhaka",
    area: "Gulshan",
    avg_rating: 4.95,
    review_count: 86,
    image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85",
    badge: "🔥 360° Interactive",
    is360: true,
  },
  {
    id: "sony-a7-iv",
    slug: "sony-a7-iv",
    title: "Sony Alpha A7 IV Cinema Camera + 24-70mm GM",
    category: "Cameras",
    categorySlug: "cameras",
    price_per_day: 3000,
    city: "Dhaka",
    area: "Banani",
    avg_rating: 4.9,
    review_count: 64,
    image_url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    badge: "Top Rated",
  },
  {
    id: "macbook-air-m2",
    slug: "macbook-air-m2",
    title: "MacBook Pro 16\" M3 Max (36GB RAM / 1TB SSD)",
    category: "Electronics",
    categorySlug: "electronics",
    price_per_day: 3200,
    city: "Dhaka",
    area: "Dhanmondi",
    avg_rating: 4.95,
    review_count: 76,
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    badge: "Apple Silicon",
  },
  {
    id: "bmw-m5-competition-360",
    slug: "bmw-m5-competition-360",
    title: "BMW M5 Competition 2024 (360° View)",
    category: "Vehicles",
    categorySlug: "vehicles",
    price_per_day: 16500,
    city: "Dhaka",
    area: "Banani",
    avg_rating: 5.0,
    review_count: 52,
    image_url: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=85",
    badge: "🔥 360° View",
    is360: true,
  },
  {
    id: "dji-mini-4-pro",
    slug: "dji-mini-4-pro",
    title: "DJI Mini 4 Pro 4K Drone (Fly More Combo)",
    category: "Cameras",
    categorySlug: "cameras",
    price_per_day: 2200,
    city: "Dhaka",
    area: "Uttara",
    avg_rating: 4.88,
    review_count: 48,
    image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    badge: "4K HDR",
  },
  {
    id: "yamaha-r15-v4",
    slug: "yamaha-r15-v4",
    title: "Yamaha R15 V4 Racing Blue",
    category: "Vehicles",
    categorySlug: "vehicles",
    price_per_day: 1800,
    city: "Dhaka",
    area: "Mirpur",
    avg_rating: 4.85,
    review_count: 39,
    image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    badge: "Fast Sport",
  },
  {
    id: "gulshan-lakeview-flat",
    slug: "gulshan-lakeview-flat",
    title: "Luxury 3BHK Lakeview Apartment with Balcony",
    category: "Apartments",
    categorySlug: "apartments",
    price_per_day: 4800,
    city: "Dhaka",
    area: "Gulshan",
    avg_rating: 4.92,
    review_count: 34,
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    badge: "Verified Stay",
  },
  {
    id: "canon-eos-r6",
    slug: "canon-eos-r6",
    title: "Canon EOS R6 Mark II + 50mm f/1.2L",
    category: "Cameras",
    categorySlug: "cameras",
    price_per_day: 3100,
    city: "Chattogram",
    area: "Agrabad",
    avg_rating: 4.87,
    review_count: 29,
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    badge: "Full Frame",
  },
  {
    id: "herman-miller-aeron",
    slug: "herman-miller-aeron",
    title: "Herman Miller Aeron Ergonomic Task Chair",
    category: "Furniture",
    categorySlug: "furniture",
    price_per_day: 650,
    city: "Dhaka",
    area: "Mohakhali",
    avg_rating: 4.95,
    review_count: 42,
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    badge: "Ergonomic",
  },
  {
    id: "royal-enfield-hunter",
    slug: "royal-enfield-hunter",
    title: "Royal Enfield Hunter 350 Dapper Ash",
    category: "Vehicles",
    categorySlug: "vehicles",
    price_per_day: 2000,
    city: "Dhaka",
    area: "Banani",
    avg_rating: 4.9,
    review_count: 27,
    image_url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    badge: "Classic Cruiser",
  },
  {
    id: "trek-mountain-bike",
    slug: "trek-mountain-bike",
    title: "Trek Marlin 7 All-Terrain Mountain Bike",
    category: "Sports",
    categorySlug: "sports",
    price_per_day: 850,
    city: "Sylhet",
    area: "Zindabazar",
    avg_rating: 4.8,
    review_count: 21,
    image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
    badge: "Adventure",
  },
  {
    id: "bridal-lehenga-red",
    slug: "bridal-lehenga-red",
    title: "Designer Crimson Silk Bridal Lehenga & Jewelry Set",
    category: "Fashion",
    categorySlug: "fashion",
    price_per_day: 3500,
    city: "Dhaka",
    area: "Dhanmondi",
    avg_rating: 4.96,
    review_count: 36,
    image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    badge: "Dry-Cleaned",
  },
];

const CATEGORIES = [
  { label: "All Items", value: "all" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Cameras", value: "cameras" },
  { label: "Electronics", value: "electronics" },
  { label: "Apartments", value: "apartments" },
  { label: "Furniture", value: "furniture" },
  { label: "Fashion", value: "fashion" },
  { label: "Sports", value: "sports" },
  { label: "Books", value: "books" },
];

const CITIES = ["All Cities", "Dhaka", "Chattogram", "Sylhet", "Cox's Bazar", "Rajshahi"];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity || "All Cities");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [only360, setOnly360] = useState<boolean>(false);
  const [dbItems, setDbItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    if (searchParams.get("city")) setSelectedCity(searchParams.get("city")!);
    if (searchParams.get("category")) setSelectedCategory(searchParams.get("category")!);
  }, [searchParams]);

  // Fetch from API if query present
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params: Record<string, any> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory !== "all") params.category_slug = selectedCategory;

    apiClient
      .get("/products", { params })
      .then((res) => {
        if (!isCancelled && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: SearchItem[] = res.data.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category?.name || "General",
            categorySlug: p.category?.slug || "vehicles",
            price_per_day: p.price_per_day,
            city: p.city || "Dhaka",
            area: p.area || "Gulshan",
            avg_rating: p.avg_rating || 4.85,
            review_count: p.review_count || 12,
            image_url: p.image_url || p.images?.[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85",
            badge: p.is_featured ? "Featured" : undefined,
            is360: p.title?.toLowerCase().includes("360") || p.description?.toLowerCase().includes("360"),
          }));
          setDbItems(mapped);
        } else if (!isCancelled) {
          setDbItems([]);
        }
      })
      .catch(() => {
        if (!isCancelled) setDbItems([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCity && selectedCity !== "All Cities") params.set("city", selectedCity);
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  // Combine DB results with fallback catalog
  const allResults = useMemo(() => {
    // Start with db items if present, otherwise fallback
    const baseList = dbItems.length > 0 ? [...dbItems] : [...FALLBACK_ITEMS];

    // If dbItems returned fewer than 3, merge fallback to ensure page is rich
    if (dbItems.length > 0 && dbItems.length < 4) {
      const existingSlugs = new Set(dbItems.map((i) => i.slug));
      FALLBACK_ITEMS.forEach((fi) => {
        if (!existingSlugs.has(fi.slug)) {
          baseList.push(fi);
        }
      });
    }

    return baseList;
  }, [dbItems]);

  // Filter and sort items
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allResults
      .filter((item) => {
        // Query search
        if (q) {
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchArea = item.area.toLowerCase().includes(q);
          const matchCity = item.city.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchArea && !matchCity) return false;
        }

        // City filter
        if (selectedCity && selectedCity !== "All Cities") {
          if (item.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
        }

        // Category filter
        if (selectedCategory && selectedCategory !== "all") {
          if (item.categorySlug.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        // Price filter
        if (item.price_per_day > maxPrice) return false;

        // 360 only
        if (only360 && !item.is360) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
        if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
        if (sortBy === "rating") return b.avg_rating - a.avg_rating;
        return 0; // Default featured
      });
  }, [allResults, searchQuery, selectedCity, selectedCategory, maxPrice, only360, sortBy]);

  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col font-sans">
      <Navbar />

      {/* ── Search Header Bar ── */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#0e0e1c] to-[#07070F]">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-20 blur-[100px]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, #a855f7 50%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-[1340px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">Search Catalog</span>
            {searchQuery && (
              <>
                <span>/</span>
                <span className="text-indigo-300 font-bold">&ldquo;{searchQuery}&rdquo;</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-6">
            {searchQuery ? (
              <>
                Results for <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">&ldquo;{searchQuery}&rdquo;</span>
              </>
            ) : (
              <>
                Explore All <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Verified Rentals</span>
              </>
            )}
          </h1>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-2 group"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cars, cameras, laptops, apartments..."
                className="w-full outline-none text-white placeholder-slate-400 bg-transparent text-sm sm:text-base font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-white/10 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm font-semibold outline-none cursor-pointer pr-2"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-4 hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40"
                      : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Catalog Grid & Filters ── */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Filter Sidebar (3 cols) ── */}
          <aside className="lg:col-span-3 rounded-2xl p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-400" />
                <span>Filters</span>
              </h3>
              {(selectedCity !== "All Cities" || selectedCategory !== "all" || maxPrice < 20000 || only360) && (
                <button
                  onClick={() => {
                    setSelectedCity("All Cities");
                    setSelectedCategory("all");
                    setMaxPrice(20000);
                    setOnly360(false);
                    setSearchQuery("");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* 360 Toggle */}
            <div>
              <label
                onClick={() => setOnly360(!only360)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-indigo-400/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw size={15} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white">360° Interactive Views Only</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    only360 ? "bg-indigo-600 border-indigo-400 text-white" : "border-white/20"
                  }`}
                >
                  {only360 && <Check size={13} />}
                </div>
              </label>
            </div>

            {/* Max Daily Price Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Max Daily Rate</span>
                <span className="text-xs font-bold text-indigo-300">৳{maxPrice.toLocaleString()}/day</span>
              </div>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>৳500</span>
                <span>৳10,000</span>
                <span>৳20,000+</span>
              </div>
            </div>

            {/* Guarantee Highlight */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <ShieldCheck size={16} />
                <span>100% Escrow Protected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your deposit and payments are safely held until you confirm receipt and inspect condition.
              </p>
            </div>
          </aside>

          {/* ── Right Results List (9 cols) ── */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top Bar: Count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
              <div className="text-slate-300 font-semibold">
                Showing <strong className="text-white">{filteredResults.length}</strong> items available
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-white font-semibold text-xs outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredResults.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center">
                <PackageOpen size={48} className="text-slate-500 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No items match your criteria</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  Try broadening your search query, increasing the daily budget, or resetting filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("All Cities");
                    setSelectedCategory("all");
                    setMaxPrice(20000);
                    setOnly360(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredResults.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 backdrop-blur-xl flex flex-col justify-between group shadow-xl transition-all"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {item.badge && (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white bg-indigo-600/90 shadow-md flex items-center gap-1 backdrop-blur-md">
                              {item.badge.includes("360") && <RotateCcw size={10} className="animate-spin" style={{ animationDuration: "5s" }} />}
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 w-fit">
                            {item.category}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{item.avg_rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors mb-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                        <MapPin size={11} className="text-indigo-400 shrink-0" />
                        <span>{item.area}, {item.city}</span>
                        <span>•</span>
                        <span>{item.review_count} reviews</span>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-black text-indigo-300">
                          ৳{item.price_per_day.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">per day</div>
                      </div>

                      <Link
                        href={`/products/${item.slug}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all group-hover:scale-103"
                      >
                        <span>Rent Now</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070F] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
