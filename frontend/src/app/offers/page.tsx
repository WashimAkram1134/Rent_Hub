"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import {
  Flame, Heart, Star, Clock, Tag, ChevronDown, Copy, Check,
  CarFront, Camera, Monitor, Building, Trophy, Armchair, BookOpen,
  Sparkles, Gift, Percent, Zap, ArrowRight, Compass, ShieldCheck
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function DealsAndOffersPage() {
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(false);
  const [flashTime, setFlashTime] = useState({ hrs: 8, mins: 14, secs: 36 });

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

  const dealsList = [
    {
      id: "deal-1",
      title: "Toyota Prado 2018",
      category: "Vehicle",
      catKey: "vehicles",
      discount: "30% OFF",
      originalPrice: 4000,
      discountPrice: 2800,
      minDays: 2,
      timeLeft: "2d 14h left",
      rating: 4.8,
      reviews: 128,
      owner: "Rashed Hasan",
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-2",
      title: "Canon EOS R6",
      category: "Camera",
      catKey: "cameras",
      discount: "25% OFF",
      originalPrice: 4000,
      discountPrice: 3000,
      minDays: 2,
      timeLeft: "2d 14h left",
      rating: 4.9,
      reviews: 86,
      owner: "Nusrat Jahan",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-3",
      title: "MacBook Pro M3",
      category: "Electronics",
      catKey: "electronics",
      discount: "20% OFF",
      originalPrice: 3000,
      discountPrice: 2400,
      minDays: 2,
      timeLeft: "2d 14h left",
      rating: 4.7,
      reviews: 64,
      owner: "Adnan Rahman",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-4",
      title: "Premium Sofa Set",
      category: "Furniture",
      catKey: "furniture",
      discount: "15% OFF",
      originalPrice: 1200,
      discountPrice: 1020,
      minDays: 3,
      timeLeft: "1d 10h left",
      rating: 4.8,
      reviews: 42,
      owner: "Sumaiya Islam",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-5",
      title: "2BHK Apartment",
      category: "Apartment",
      catKey: "apartments",
      discount: "20% OFF",
      originalPrice: 2500,
      discountPrice: 2000,
      minDays: 2,
      timeLeft: "2d 14h left",
      rating: 4.7,
      reviews: 38,
      owner: "Rahat Ahmed",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-6",
      title: "Mountain Bike",
      category: "Sports",
      catKey: "sports",
      discount: "10% OFF",
      originalPrice: 800,
      discountPrice: 720,
      minDays: 1,
      timeLeft: "8h 45m left",
      rating: 4.6,
      reviews: 22,
      owner: "Imtiaz Hossain",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-7",
      title: "Football Kit",
      category: "Sports",
      catKey: "sports",
      discount: "15% OFF",
      originalPrice: 500,
      discountPrice: 410,
      minDays: 1,
      timeLeft: "1d 05h left",
      rating: 4.6,
      reviews: 18,
      owner: "Sabbir Hossain",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-8",
      title: "Atomic Habits",
      category: "Book",
      catKey: "books",
      discount: "12% OFF",
      originalPrice: 80,
      discountPrice: 70,
      minDays: 3,
      timeLeft: "3d 12h left",
      rating: 4.9,
      reviews: 73,
      owner: "Tania Rahman",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "deal-9",
      title: "Sony A7 IV",
      category: "Camera",
      catKey: "cameras",
      discount: "22% OFF",
      originalPrice: 3500,
      discountPrice: 2730,
      minDays: 2,
      timeLeft: "2d 14h left",
      rating: 4.8,
      reviews: 31,
      owner: "Rashed Hasan",
      image: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const filteredDeals = dealsList.filter(
    (d) => activeCategory === "all" || d.catKey === activeCategory
  );

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
                Unbeatable offers on vehicles, electronics, apartments and more. Limited time only!
              </p>
              <div className="pt-2">
                <button className="bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95">
                  Explore Deals
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">

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
                      onClick={() => setActiveCategory(c.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
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
                <span>Showing 1-{filteredDeals.length} of 120 deals</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl font-bold text-slate-700 cursor-pointer shadow-sm">
                  <span>Sort by: <strong className="text-slate-900">Biggest Discount</strong></span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>

              {/* Deals Cards Grid (3 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDeals.map((item) => {
                  const isFav = isWishlisted(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                    >
                      {/* Image + Badges */}
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Discount Badge */}
                        <div className="absolute top-3 left-3 bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-md">
                          {item.discount}
                        </div>

                        {/* Love Wishlist Icon */}
                        <button
                          onClick={() =>
                            toggleWishlist({
                              id: item.id,
                              title: item.title,
                              category: item.category,
                              image_url: item.image,
                              price_per_day: item.discountPrice,
                              rating: item.rating,
                              review_count: item.reviews,
                              location: "Dhaka",
                            })
                          }
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all"
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
                            <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-[140px]">
                              {item.title}
                            </h3>
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
                              <div className="text-[10px] font-bold text-slate-800 leading-tight">{item.owner}</div>
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
                              href={`/products/${item.id}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all"
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

              {/* Pagination Row */}
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">1</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center justify-center">2</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center justify-center">3</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center justify-center">4</button>
                <span className="text-slate-400 text-xs px-1">...</span>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center justify-center">12</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 flex items-center justify-center">›</button>
              </div>

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
                  {[
                    {
                      name: "Honda Civic 2019",
                      orig: "৳3,000",
                      disc: "৳2,100 /day",
                      pct: "30% OFF",
                      img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=200&q=80",
                    },
                    {
                      name: "DJI Mini 3 Drone",
                      orig: "৳1,500",
                      disc: "৳1,050 /day",
                      pct: "30% OFF",
                      img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=200&q=80",
                    },
                    {
                      name: "Gaming Chair",
                      orig: "৳600",
                      disc: "৳420 /day",
                      pct: "30% OFF",
                      img: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=200&q=80",
                    },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          <img src={f.img} alt={f.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{f.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            <span className="line-through">{f.orig}</span> <strong className="text-slate-900">{f.disc}</strong>
                          </div>
                        </div>
                      </div>
                      <span className="bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                        {f.pct}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full text-center text-xs font-bold text-indigo-600 hover:underline pt-1">
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
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
                  <p className="text-xs text-amber-800 font-medium">On selected items only</p>
                </div>

                <button className="bg-white hover:bg-amber-100/50 border border-amber-200 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all">
                  Grab the Offer
                </button>
              </div>

              {/* Recommended For You Widget */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-extrabold text-slate-900 text-xs">Recommended For You</h3>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">View all</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { title: "GoPro Hero 12", price: "৳900/day", pct: "15% OFF", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80" },
                    { title: "iPhone 15 Pro", price: "৳1,400/day", pct: "10% OFF", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" },
                    { title: "Office Desk", price: "৳700/day", pct: "20% OFF", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80" },
                  ].map((r, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1 text-center group cursor-pointer">
                      <div className="h-16 rounded-lg overflow-hidden bg-slate-200 mb-1">
                        <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <h4 className="text-[10px] font-bold text-slate-900 truncate">{r.title}</h4>
                      <div className="text-[9px] text-slate-500">{r.price}</div>
                      <span className="inline-block bg-rose-100 text-rose-600 font-extrabold text-[8px] px-1.5 py-0.2 rounded">
                        {r.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ── Bottom Promotional Banners Row (3 Banners matching exact screenshot) ──────────────── */}
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
                  <button className="bg-[#046A38] hover:bg-[#03522b] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95">
                    Explore Now
                  </button>
                </div>
              </div>
              {/* Clear Mosque / Crescent image on right */}
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
                  <button className="bg-[#1E40AF] hover:bg-[#1e3a8a] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95">
                    Explore Now
                  </button>
                </div>
              </div>
              {/* Clear Skier image on right */}
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
                  <button className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95">
                    Explore Now
                  </button>
                </div>
              </div>
              {/* Clear Student image on right */}
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
