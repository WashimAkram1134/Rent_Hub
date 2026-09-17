"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  MapPin,
  Calendar,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Check,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Award,
  Layers,
  ShoppingBag,
  ExternalLink,
  Copy,
  ArrowLeft,
  Eye,
  Camera,
  Car,
  Laptop,
  Home,
  Shirt,
  Bike
} from "lucide-react";
import apiClient from "@/lib/axios";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

interface OwnerListing {
  id: string;
  title: string;
  slug: string;
  price_per_day: number;
  city: string;
  area: string;
  avg_rating: number;
  review_count: number;
  category: string;
  category_slug: string;
  image_url: string;
  is_available: boolean;
  condition: string;
}

interface OwnerReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  product: {
    id: string | null;
    title: string;
  };
}

interface OwnerProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  location: string;
  city: string;
  area: string;
  joined_year: string;
  joined_date: string;
  bio: string;
  response_time: string;
  is_top_rated: boolean;
  badges: {
    verified_owner: boolean;
    id_verified: boolean;
    phone_verified: boolean;
    email_verified: boolean;
    profile_photo_verified: boolean;
  };
  stats: {
    total_listings: number;
    total_bookings: number;
    avg_rating: number;
    review_count: number;
    on_time_delivery: string;
  };
  listings: OwnerListing[];
  reviews: OwnerReview[];
}

export default function OwnerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const ownerId = params?.id as string;

  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews" | "about">("listings");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "rating">("newest");
  const [showPhone, setShowPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ownerId) return;

    const fetchOwner = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/users/${ownerId}/public-profile`);
        setProfile(res.data);
      } catch (err: any) {
        console.error("Error fetching owner profile:", err);
        setError("Owner profile not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [ownerId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyPhone = () => {
    if (profile?.phone) {
      navigator.clipboard.writeText(profile.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper for category badge icons
  const getCategoryIcon = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("vehic") || cat.includes("car")) return <Car size={13} className="mr-1 inline" />;
    if (cat.includes("camera") || cat.includes("photo")) return <Camera size={13} className="mr-1 inline" />;
    if (cat.includes("elect") || cat.includes("tech")) return <Laptop size={13} className="mr-1 inline" />;
    if (cat.includes("apart") || cat.includes("home") || cat.includes("flat")) return <Home size={13} className="mr-1 inline" />;
    if (cat.includes("cloth") || cat.includes("fash")) return <Shirt size={13} className="mr-1 inline" />;
    if (cat.includes("bike") || cat.includes("motor")) return <Bike size={13} className="mr-1 inline" />;
    return <ShoppingBag size={13} className="mr-1 inline" />;
  };

  // Sort listings
  const sortedListings = profile?.listings ? [...profile.listings].sort((a, b) => {
    if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
    if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
    if (sortBy === "rating") return b.avg_rating - a.avg_rating;
    return 0; // default newest
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading owner profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto text-center py-28 px-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Owner Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "The owner profile you are looking for does not exist."}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || "O"}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Breadcrumbs ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-5">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <Link href="/products" className="hover:text-blue-600 transition-colors">Listings</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-800 font-medium truncate">{profile.full_name}</span>
        </nav>

        {/* ── Copied Toast ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {copiedLink && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700"
            >
              <Check size={14} className="text-emerald-400" />
              Owner profile link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header Profile Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-md ring-1 ring-slate-200">
                    {initials}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-400" title="Active on RentHub" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {profile.full_name}
                  </h1>
                  <span title="Verified Host">
                    <CheckCircle2 size={22} className="text-blue-600 fill-blue-600 text-white" />
                  </span>
                  {profile.is_top_rated && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      Top Rated Owner
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <MapPin size={14} className="text-blue-600" />
                    {profile.location || "Dhaka, Bangladesh"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    Joined {profile.joined_year}
                  </span>
                </div>

                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed mb-4">
                  {profile.bio}
                </p>

                {/* Verification badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                    <Check size={12} className="text-emerald-600 stroke-[3]" />
                    Verified Owner
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
                    <UserCheck size={12} className="text-blue-600" />
                    ID Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
                    <Phone size={12} className="text-indigo-600" />
                    Phone Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Stats & Action Buttons */}
            <div className="flex flex-col lg:items-end justify-between gap-5 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0">
              {/* Top Row: Rating & Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900 mr-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="text-base font-extrabold">{profile.stats.avg_rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-normal">({profile.stats.review_count} reviews)</span>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
                >
                  <Share2 size={14} className="text-slate-500" />
                  Share Profile
                </button>

                <Link
                  href={`/messages?user=${profile.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <MessageSquare size={14} />
                  Message
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-6 sm:gap-8 bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 sm:px-6 w-full lg:w-auto">
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {profile.stats.total_listings}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Total Listings</div>
                </div>
                <div className="text-center sm:text-left border-x border-slate-200/70 px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {profile.stats.total_bookings > 999 ? `${(profile.stats.total_bookings / 1000).toFixed(1)}k+` : profile.stats.total_bookings}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Total Bookings</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {profile.stats.on_time_delivery}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">On-time Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 mb-6 bg-white rounded-xl px-4 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all relative ${
                activeTab === "listings"
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              <Layers size={16} />
              Listings ({profile.stats.total_listings})
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all relative ${
                activeTab === "reviews"
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              <Star size={16} />
              Reviews ({profile.stats.review_count})
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 py-3.5 px-2 text-sm font-semibold border-b-2 transition-all relative ${
                activeTab === "about"
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              <UserCheck size={16} />
              About
            </button>
          </div>
        </div>

        {/* ── Main Layout: Content Grid & Sidebar ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left 2 Columns: Tabs Content ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAB 1: LISTINGS */}
            {activeTab === "listings" && (
              <div>
                {/* Header with Sort */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Owner's Listings</h2>
                    <p className="text-xs text-slate-500">Explore items available for rent from this owner.</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-slate-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Listings Grid */}
                {sortedListings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <ShoppingBag size={42} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold text-slate-700 text-sm mb-1">No active listings</h3>
                    <p className="text-xs text-slate-400">This owner currently has no items published for rent.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {sortedListings.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                      >
                        <Link href={`/products/${item.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Category Badge */}
                          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-md shadow-xs border border-white/60">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </div>

                          {/* Heart wishlist */}
                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-600 transition-colors shadow-xs"
                            title="Add to wishlist"
                          >
                            <Heart
                              size={14}
                              className={wishlist[item.id] ? "fill-rose-500 text-rose-500" : ""}
                            />
                          </button>
                        </Link>

                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <Link href={`/products/${item.slug}`} className="block">
                              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                                {item.title}
                              </h3>
                            </Link>

                            <div className="text-sm font-extrabold text-slate-900 mb-1">
                              ৳ {item.price_per_day.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-slate-400">/ day</span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{item.area}, {item.city}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              <span>{item.avg_rating > 0 ? item.avg_rating.toFixed(1) : "5.0"}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({item.review_count} {item.review_count === 1 ? "review" : "reviews"})
                              </span>
                            </div>

                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Rating Overview Box */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Rating & Review Breakdown</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="text-center sm:border-r border-slate-100 sm:pr-8">
                      <div className="text-5xl font-black text-slate-900">
                        {profile.stats.avg_rating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={
                              s <= Math.round(profile.stats.avg_rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        Based on {profile.stats.review_count} reviews
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {[
                        { stars: 5, pct: 85 },
                        { stars: 4, pct: 10 },
                        { stars: 3, pct: 3 },
                        { stars: 2, pct: 1 },
                        { stars: 1, pct: 1 }
                      ].map(({ stars, pct }) => (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-medium text-slate-600">{stars} stars</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-medium text-slate-400">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-4">All Customer Reviews</h3>
                  {profile.reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Star size={36} className="mx-auto text-slate-200 mb-2" />
                      <p className="font-semibold text-slate-600">No reviews yet</p>
                      <p className="text-xs mt-1">This owner has not received any reviews yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4">
                      {profile.reviews.map((rev) => (
                        <div key={rev.id} className="pt-4 first:pt-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              {rev.reviewer.avatar_url ? (
                                <img
                                  src={rev.reviewer.avatar_url}
                                  alt={rev.reviewer.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                  {rev.reviewer.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{rev.reviewer.name}</span>
                                  {rev.reviewer.is_verified && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                      Verified Renter
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400">{rev.created_at}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-13">
                            "{rev.comment}"
                          </p>

                          {rev.product.title && (
                            <div className="mt-2 pl-13 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="text-slate-400">Rented item:</span>
                              <span className="font-semibold text-blue-600">{rev.product.title}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ABOUT */}
            {activeTab === "about" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">About {profile.first_name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <Clock size={20} className="text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Response Time</div>
                      <div className="text-sm font-bold text-slate-800">{profile.response_time}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    <Calendar size={20} className="text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Member Since</div>
                      <div className="text-sm font-bold text-slate-800">{profile.joined_date}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Owner Policies & Guidelines</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Always provides sanitized, thoroughly checked items prior to pickup or delivery.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Security deposits are held securely through RentHub escrow and refunded upon return.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Flexible cancellation options available up to 24 hours prior to booking start time.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Card 1: Verification & Trust */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Verification & Trust</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Identity Verified</div>
                    <div className="text-[11px] text-slate-500">Government ID verified</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Phone Verified</div>
                    <div className="text-[11px] text-slate-500">Mobile number verified</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Email Verified</div>
                    <div className="text-[11px] text-slate-500">Email address verified</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Profile Photo Verified</div>
                    <div className="text-[11px] text-slate-500">Real profile photo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Quick Stats */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Quick Stats</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Car size={16} className="text-slate-600 mx-auto mb-1.5" />
                  <div className="text-base font-extrabold text-slate-900">{profile.stats.total_listings}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Total Listings</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Calendar size={16} className="text-slate-600 mx-auto mb-1.5" />
                  <div className="text-base font-extrabold text-slate-900">
                    {profile.stats.total_bookings > 999 ? `${(profile.stats.total_bookings / 1000).toFixed(1)}k+` : profile.stats.total_bookings}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Total Bookings</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Star size={16} className="fill-amber-400 text-amber-400 mx-auto mb-1.5" />
                  <div className="text-base font-extrabold text-slate-900">{profile.stats.avg_rating.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Card 3: Contact Owner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Contact Owner</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Have a question or want to book? Send a message to the owner.
              </p>

              <div className="space-y-2.5">
                <Link
                  href={`/messages?user=${profile.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <MessageSquare size={14} />
                  Send Message
                </Link>

                {!showPhone ? (
                  <button
                    onClick={() => setShowPhone(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Phone size={14} className="text-slate-500" />
                    View Phone Number
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <div className="text-[11px] text-blue-700 font-semibold mb-1">Owner Contact Phone:</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{profile.phone}</span>
                      <button
                        onClick={handleCopyPhone}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {copiedPhone ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Safety notice */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span>Your safety is our priority. Always communicate through RentHub and avoid direct payments.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
