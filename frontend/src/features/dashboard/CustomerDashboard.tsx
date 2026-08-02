"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, LogOut, CheckCircle, Star, Plus, Clock } from "lucide-react";

import { ProductCard } from "@/components/common/ProductCard";
import AppShell from "@/components/layout/AppShell";
import { HeroSlider } from "@/features/dashboard/components/HeroSlider";
import { CategoryGrid } from "@/features/dashboard/components/CategoryGrid";
import { CityExplorer } from "@/features/dashboard/components/CityExplorer";
import { UpcomingBookingWidget } from "@/features/dashboard/components/UpcomingBookingWidget";
import { DealsWidget } from "@/features/dashboard/components/DealsWidget";
import apiClient from "@/lib/axios";
import { useWishlistStore } from "@/store/wishlistStore";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const wishlistImages = [
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=80&h=80&q=80",
];

const continueBrowsing = [
  { image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=200&h=150&q=80", name: "BMW X5" },
  { image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=200&h=150&q=80", name: "Sony A7 IV" },
  { image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&h=150&q=80", name: "Studio Apt" },
  { image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=200&h=150&q=80", name: "Office Chair" },
];

const topOwners = [
  { name: "Rashed H.", rating: 4.9, listings: 76, initials: "RH", color: "bg-blue-500" },
  { name: "Nusrat J.", rating: 4.8, listings: 98, initials: "NJ", color: "bg-rose-500" },
  { name: "Mahmudul I.", rating: 4.9, listings: 76, initials: "MI", color: "bg-emerald-500" },
  { name: "Olivia S.", rating: 4.8, listings: 62, initials: "OS", color: "bg-amber-500" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CustomerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { items: wishlistStoreItems } = useWishlistStore();

  // State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, catsRes, productsRes, recommendedRes, citiesRes, dealsRes, bookingsRes] = await Promise.all([
          apiClient.get("/cms/hero-slides").then(r => r.data).catch(() => []),
          apiClient.get("/cms/categories").then(r => r.data).catch(() => []),
          apiClient.get("/products", { params: { trending: true, limit: 4 } }).then(r => r.data).catch(() => []),
          apiClient.get("/products", { params: { recommended: true, limit: 4 } }).then(r => r.data).catch(() => []),
          apiClient.get("/cms/cities").then(r => r.data).catch(() => []),
          apiClient.get("/cms/deals").then(r => r.data).catch(() => []),
          apiClient.get("/bookings", { params: { upcoming: true, limit: 1 } }).then(r => r.data).catch(() => []),
        ]);
        
        setHeroSlides(bannersRes || []);
        
        const fetchedCats = catsRes || [];
        setCategories([...fetchedCats, { name: "More", slug: "more", icon_url: "" }]);
        
        setTrendingItems(productsRes || []);
        setRecommended(recommendedRes || []);
        setCities(citiesRes || []);
        setDeals(dealsRes || []);
        
        if (bookingsRes && bookingsRes.length > 0) {
          setUpcomingBooking(bookingsRes[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <AppShell showHeader={false}>

      {/* ── Right Side (Header + Content) ───────────────────────────────── */}
      <div className="flex flex-col min-w-0 overflow-hidden h-full" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0">
          {/* Search Bar */}
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

          {/* Location */}
          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            <MapPin size={16} /> Dhaka
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-2" />

          {/* User Profile */}
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                {user.first_name[0]}{user.last_name[0]}
              </div>
            </div>
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
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

              <HeroSlider slides={heroSlides} />
              
              <CategoryGrid categories={categories} />

              {/* Trending Near You */}
              <div>
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

              {/* Continue Browsing + Recommended */}
              <div className="grid grid-cols-2 gap-5">

                {/* Continue Browsing */}
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">Continue Browsing</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {continueBrowsing.map((item, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden h-[90px] group cursor-pointer">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className="absolute bottom-1.5 left-0 right-0 px-1.5">
                          <p className="text-white text-[9px] font-semibold truncate">{item.name}</p>
                        </div>
                        <button className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Clock size={9} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900">Recommended for you</h2>
                    <Link href="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {recommended.length === 0 ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[135px] bg-slate-200/70 rounded-xl animate-pulse" />
                      ))
                    ) : (
                      recommended.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group">
                          <div className="h-[90px] overflow-hidden">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="p-2">
                            <p className="text-[10px] font-bold text-slate-900 truncate">{item.title}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <Star size={8} className="fill-amber-400 text-amber-400" />
                              <span className="text-[9px] text-slate-600">{item.avg_rating}</span>
                            </div>
                            <p className="text-[10px] font-bold text-blue-700 mt-1">৳ {item.price_per_day} <span className="font-normal text-slate-400">/ day</span></p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <CityExplorer cities={cities} />
            </div>

            {/* ── Right Column ─────────────────────────────────────── */}
            <div className="w-[270px] shrink-0 space-y-4">
              
              <UpcomingBookingWidget booking={upcomingBooking} />
              
              <DealsWidget deals={deals} />

              {/* Wishlist Widget */}
              <div>
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

              {/* Top Owners */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-900">Top Owners</h3>
                  <Link href="/owners" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                <div className="space-y-1.5">
                  {topOwners.map((owner, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${owner.color} text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white`}>
                          {owner.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                            {owner.name}
                            <CheckCircle size={10} className="text-blue-500" />
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{owner.listings} listings</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-600">
                          <Star size={8} className="fill-current" />
                          {owner.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
