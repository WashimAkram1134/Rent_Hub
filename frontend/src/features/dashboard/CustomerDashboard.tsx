"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, MapPin, LogOut, CheckCircle, Star, Plus, ChevronDown, ChevronUp,
  Trophy, Crown, TrendingUp
} from "lucide-react";
import { useTransitionStore } from "@/store/transitionStore";

import { ProductCard } from "@/components/common/ProductCard";
import AppShell from "@/components/layout/AppShell";
import { HeroSlider } from "@/features/dashboard/components/HeroSlider";
import { CategoryGrid } from "@/features/dashboard/components/CategoryGrid";
import { CityExplorer } from "@/features/dashboard/components/CityExplorer";
import { UpcomingBookingWidget } from "@/features/dashboard/components/UpcomingBookingWidget";
import { DealsWidget } from "@/features/dashboard/components/DealsWidget";
import apiClient from "@/lib/axios";
import { useWishlistStore } from "@/store/wishlistStore";

/* ─── Bangladesh divisions data ───────────────────────────────────────────── */

const BD_DIVISIONS = [
  { name: "Dhaka", image_url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=400&q=80", slug: "dhaka" },
  { name: "Chattogram", image_url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=400&q=80", slug: "chattogram" },
  { name: "Sylhet", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80", slug: "sylhet" },
  { name: "Cox's Bazar", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80", slug: "coxs-bazar" },
  { name: "Rajshahi", image_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80", slug: "rajshahi" },
  { name: "Khulna", image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80", slug: "khulna" },
  { name: "Barishal", image_url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80", slug: "barishal" },
  { name: "Mymensingh", image_url: "https://images.unsplash.com/photo-1504474298956-9e3ddf57c3c5?auto=format&fit=crop&w=400&q=80", slug: "mymensingh" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CustomerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { items: wishlistStoreItems, syncFromServer } = useWishlistStore();

  // State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [topOwners, setTopOwners] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [showAllDivisions, setShowAllDivisions] = useState(false);

  const { hideLoader } = useTransitionStore();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    // Sync wishlist from DB for logged-in user
    syncFromServer();

    const fetchData = async () => {
      try {
        const [bannersRes, catsRes, productsRes, recommendedRes, citiesRes, dealsRes, bookingsRes, topOwnersRes, topPerfRes] = await Promise.all([
          apiClient.get("/cms/hero-slides").then(r => r.data).catch(() => []),
          apiClient.get("/cms/categories").then(r => r.data).catch(() => []),
          apiClient.get("/products", { params: { trending: true, limit: 4 } }).then(r => r.data).catch(() => []),
          apiClient.get("/products", { params: { recommended: true, limit: 8 } }).then(r => r.data).catch(() => []),
          apiClient.get("/cms/cities").then(r => r.data).catch(() => []),
          apiClient.get("/cms/deals").then(r => r.data).catch(() => []),
          apiClient.get("/bookings", { params: { upcoming: true, limit: 1 } }).then(r => r.data).catch(() => []),
          apiClient.get("/cms/top-owners").then(r => r.data).catch(() => []),
          apiClient.get("/cms/top-performers").then(r => r.data).catch(() => []),
        ]);

        setHeroSlides(bannersRes || []);

        const fetchedCats = catsRes || [];
        setCategories([...fetchedCats, { name: "More", slug: "more", icon_url: "" }]);

        setTrendingItems(productsRes || []);
        setRecommended(recommendedRes || []);
        setCities(citiesRes || []);
        setDeals(dealsRes || []);
        setTopOwners(topOwnersRes || []);
        setTopPerformers(topPerfRes || []);

        if (bookingsRes && bookingsRes.length > 0) {
          setUpcomingBooking(bookingsRes[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        hideLoader();
      }
    };
    fetchData();
  }, [user?.id]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSignOut = async () => {
    await logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.replace("/login");
    }
  };

  // Merge DB cities with all 8 divisions (fill listing_count from DB where available)
  const divisionsWithCounts = BD_DIVISIONS.map((div) => {
    const dbCity = cities.find((c: any) => c.name?.toLowerCase() === div.name.toLowerCase());
    return {
      ...div,
      listing_count: dbCity?.listing_count ?? 0,
    };
  });
  const visibleDivisions = showAllDivisions ? divisionsWithCounts : divisionsWithCounts.slice(0, 5);

  if (!user) return null;

  return (
    <AppShell showHeader={false}>
      <div className="flex flex-col min-w-0 h-full" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Top Header */}
        <header className="relative z-50 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0 shadow-xs">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 max-w-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for anything (cars, laptops, apartments...)"
              className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex-1" />

          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            <MapPin size={16} /> Dhaka
          </button>

          <div className="w-px h-6 bg-slate-200 mx-2" />

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              title={`${user.first_name} ${user.last_name}`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                {user.first_name?.[0] || "U"}{user.last_name?.[0] || ""}
              </div>
            </button>

            <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 transition-all duration-150 ${
              profileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
            }`}>
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 uppercase">
                  Customer
                </span>
              </div>

              <div className="py-1">
                <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                  My Profile
                </Link>
                <Link href="/bookings" onClick={() => setProfileMenuOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                  My Bookings
                </Link>
                <Link href="/wishlist" onClick={() => setProfileMenuOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                  Saved Wishlist
                </Link>
              </div>

              <div className="p-1.5 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable Page Body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-5 p-5 max-w-[1380px] mx-auto">

            {/* ── Center Content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Hero Slider */}
              <div className="anim-scale-in anim-delay-100">
                <HeroSlider slides={heroSlides} />
              </div>

              {/* Category Grid */}
              <div className="anim-fade-up anim-delay-200">
                <CategoryGrid categories={categories} />
              </div>

              {/* Trending Near You */}
              <div className="anim-fade-up anim-delay-300">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Trending Near You</h2>
                  <Link href="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {trendingItems.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-56 bg-slate-200/70 rounded-2xl animate-pulse" />
                    ))
                  ) : (
                    trendingItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        {...item}
                        location={item.area || item.city}
                        isWishlisted={wishlist.includes(item.id)}
                        onToggleWishlist={toggleWishlist}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Recommended for you — full width, 8 cards */}
              <div className="anim-fade-up anim-delay-400">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Recommended for you</h2>
                  <Link href="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {recommended.length === 0 ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-[150px] bg-slate-200/70 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    recommended.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug || item.id}`}
                        className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block cursor-pointer"
                      >
                        <div className="h-[100px] overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="text-[10px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <Star size={8} className="fill-amber-400 text-amber-400" />
                            <span className="text-[9px] text-slate-600">{item.avg_rating || "0"}</span>
                          </div>
                          <p className="text-[10px] font-bold text-blue-700 mt-1">
                            ৳ {item.price_per_day} <span className="font-normal text-slate-400">/ day</span>
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Explore Bangladesh — all 8 divisions, 5 visible + toggle */}
              <div className="anim-fade-up anim-delay-500">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Explore Bangladesh</h2>
                  <button
                    onClick={() => setShowAllDivisions((v) => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {showAllDivisions ? (
                      <><ChevronUp size={14} /> Show less</>
                    ) : (
                      <><ChevronDown size={14} /> View all</>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {visibleDivisions.map((div, i) => (
                    <Link
                      key={div.name}
                      href={`/search?city=${div.slug}`}
                      className="relative rounded-xl overflow-hidden h-[90px] group cursor-pointer block"
                    >
                      <img
                        src={div.image_url}
                        alt={div.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-white text-xs font-bold leading-tight">{div.name}</p>
                        <p className="text-white/70 text-[9px]">
                          {div.listing_count > 0 ? `${div.listing_count}+ Listings` : "Explore"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Rows 2 animation: reveal smoothly */}
                {showAllDivisions && divisionsWithCounts.length > 5 && (
                  <div className="grid grid-cols-5 gap-3 mt-3">
                    {divisionsWithCounts.slice(5).map((div) => (
                      <Link
                        key={div.name}
                        href={`/search?city=${div.slug}`}
                        className="relative rounded-xl overflow-hidden h-[90px] group cursor-pointer block"
                      >
                        <img
                          src={div.image_url}
                          alt={div.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <p className="text-white text-xs font-bold leading-tight">{div.name}</p>
                          <p className="text-white/70 text-[9px]">
                            {div.listing_count > 0 ? `${div.listing_count}+ Listings` : "Explore"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── Right Column ──────────────────────────────────── */}
            <div className="anim-slide-right anim-delay-200 w-[270px] shrink-0 space-y-4">

              <UpcomingBookingWidget booking={upcomingBooking} />

              <DealsWidget deals={deals} />

              {/* Wishlist Widget */}
              <div className="anim-fade-up anim-delay-350">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-900">Wishlist</h3>
                  <Link href="/wishlist" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {wishlistStoreItems.slice(0, 4).map((item) => (
                    <Link key={item.id} href="/wishlist" className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </Link>
                  ))}
                  <Link href="/wishlist" className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    <Plus size={14} />
                  </Link>
                </div>
              </div>

              {/* Top Owners — dynamic from DB */}
              <div className="anim-fade-up anim-delay-500">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Crown size={12} className="text-amber-500" />
                    Top Owners
                  </h3>
                  <Link href="/owners" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="space-y-1.5">
                  {topOwners.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    topOwners.slice(0, 4).map((owner: any, i: number) => {
                      const initials = `${owner.first_name?.[0] || ""}${owner.last_name?.[0] || ""}`.toUpperCase();
                      const colors = ["bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500"];
                      const color = colors[i % colors.length];
                      return (
                        <Link
                          key={owner.id}
                          href={`/owners/${owner.id}`}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {owner.avatar_url ? (
                              <img src={owner.avatar_url} alt={owner.full_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                            ) : (
                              <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white`}>
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                                {owner.first_name} {owner.last_name?.[0]}.
                                {owner.is_verified && <CheckCircle size={10} className="text-blue-500" />}
                              </p>
                              <p className="text-[9px] text-slate-500 mt-0.5">{owner.listing_count} listings</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-600">
                              <Star size={8} className="fill-current" />
                              {owner.avg_rating > 0 ? owner.avg_rating : "New"}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Top Performer Items — dynamic from DB */}
              <div className="anim-fade-up anim-delay-600">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Trophy size={12} className="text-indigo-500" />
                    Top Performers
                  </h3>
                  <Link href="/products" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="space-y-2">
                  {topPerformers.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                    ))
                  ) : (
                    topPerformers.slice(0, 5).map((item: any, i: number) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug || item.id}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group"
                      >
                        {/* Rank badge */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                          i === 0 ? "bg-amber-400 text-white" :
                          i === 1 ? "bg-slate-400 text-white" :
                          i === 2 ? "bg-orange-400 text-white" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Star size={7} className="fill-amber-400 text-amber-400" />
                              <span className="text-[8px] text-slate-500">{item.avg_rating || "0"}</span>
                            </div>
                            <span className="text-[7px] text-slate-300">•</span>
                            <TrendingUp size={7} className="text-emerald-500" />
                            <span className="text-[8px] text-slate-500">{item.booking_count} booked</span>
                          </div>
                        </div>
                        <div className="text-[9px] font-black text-indigo-600 shrink-0">৳{item.price_per_day}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
