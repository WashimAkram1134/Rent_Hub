"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Star, MapPin, ChevronRight, Shield, ChevronLeft, ChevronDown,
  Heart, Share2, MessageCircle, ShoppingCart, Check,
  Wifi, Wind, Zap, Settings, Eye, Lock, Camera, Music, Fuel, Users,
  Package, Loader2
} from "lucide-react";
import dayjs from "dayjs";
import { useCartStore } from "@/store/cartStore";

// ── Feature Highlights derived from description keywords ──────────────────────
const FEATURE_KEYWORDS: { label: string; icon: React.ReactNode }[] = [
  { label: "Automatic", icon: <Settings size={14} /> },
  { label: "Fuel Efficient", icon: <Fuel size={14} /> },
  { label: "5 Seats", icon: <Users size={14} /> },
  { label: "Air Condition", icon: <Wind size={14} /> },
  { label: "Bluetooth", icon: <Wifi size={14} /> },
  { label: "Well Maintained", icon: <Check size={14} /> },
  { label: "Music System", icon: <Music size={14} /> },
  { label: "Camera", icon: <Camera size={14} /> },
  { label: "USB Charger", icon: <Zap size={14} /> },
  { label: "Central Lock", icon: <Lock size={14} /> },
  { label: "ABS Brakes", icon: <Shield size={14} /> },
  { label: "Power Steering", icon: <Settings size={14} /> },
  { label: "Airbags", icon: <Shield size={14} /> },
  { label: "Rear Camera", icon: <Camera size={14} /> },
];

function getHighlightsFromDescription(desc: string): typeof FEATURE_KEYWORDS {
  if (!desc) return FEATURE_KEYWORDS.slice(0, 6);
  const lower = desc.toLowerCase();
  const matched = FEATURE_KEYWORDS.filter((f) => lower.includes(f.label.toLowerCase()));
  return matched.length >= 3 ? matched : FEATURE_KEYWORDS.slice(0, 6);
}

const TABS = ["Overview", "Features", "Specifications", "Reviews", "Location"];

type DurationMode = "Daily" | "Weekly" | "Monthly";
type DeliveryMode = "Pick-up" | "Delivery";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Overview");
  const [durationMode, setDurationMode] = useState<DurationMode>("Daily");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("Pick-up");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [pickupDate, setPickupDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnDate, setReturnDate] = useState(dayjs().add(3, "day").format("YYYY-MM-DD"));
  const [returnTime, setReturnTime] = useState("10:00 AM");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookNow = async () => {
    if (!product) return;
    setBookingLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          start_date: pickupDate,
          end_date: returnDate,
          delivery_option: deliveryMode,
        }),
      });
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push("/bookings");
        }, 1200);
      } else {
        alert("Failed to submit booking request.");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating booking request.");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:8000/api/v1/products/${slug}`)
      .then((res) => { if (!res.ok) throw new Error("Not found"); return res.json(); })
      .then((data) => {
        setProduct(data);
        setIsWishlisted(data.is_wishlisted || false);
        // Fetch similar products by category
        const catSlug = data.category?.name?.toLowerCase();
        if (catSlug) {
          fetch(`http://localhost:8000/api/v1/products?category_slug=${catSlug}&limit=5`)
            .then((r) => r.json())
            .then((list) => {
              setSimilarProducts(
                Array.isArray(list) ? list.filter((p: any) => p.slug !== data.slug).slice(0, 4) : []
              );
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const days = Math.max(1, dayjs(returnDate).diff(dayjs(pickupDate), "day"));
  const pricePerPeriod = product
    ? durationMode === "Weekly"
      ? product.price_per_day * 6
      : durationMode === "Monthly"
      ? product.price_per_day * 25
      : product.price_per_day
    : 0;
  const periodLabel = durationMode === "Weekly" ? "week" : durationMode === "Monthly" ? "month" : "day";

  const serviceFee = product ? Math.round(product.price_per_day * days * 0.06) : 0;
  const subtotal = product ? product.price_per_day * days : 0;
  const total = subtotal + serviceFee + (product?.security_deposit || 0);

  const images: string[] = product
    ? [
        ...(product.images?.map((img: any) => img.url) || []),
        ...(product.image_url && !product.images?.find((i: any) => i.url === product.image_url)
          ? [product.image_url]
          : []),
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Package size={60} className="text-slate-300 mb-6" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h1>
          <p className="text-slate-500 mb-6">This listing doesn't exist or has been removed.</p>
          <button onClick={() => router.back()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            <ChevronLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const highlights = getHighlightsFromDescription(product.description || "");
  const ownerInitials = `${product.owner?.first_name?.[0] || "?"}${product.owner?.last_name?.[0] || ""}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1340px] mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors font-medium">Home</Link>
          <ChevronRight size={12} />
          <Link href="/categories/vehicles" className="hover:text-indigo-600 transition-colors font-medium">
            {product.category?.name || "Vehicles"}
          </Link>
          <ChevronRight size={12} />
          <Link href="/categories/vehicles" className="hover:text-indigo-600 transition-colors font-medium">Cars</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">

          {/* ── Left: Gallery + Details ──────────────────────────────── */}
          <div className="xl:col-span-8 space-y-6">

            {/* Gallery */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-[340px] sm:h-[420px] group">
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Package size={60} />
                  </div>
                )}

                {/* Popular badge */}
                {product.is_featured && (
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    🔥 Popular
                  </div>
                )}

                {/* Wishlist & Share */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart size={16} className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500"} />
                  </button>
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                    >
                      <ChevronLeft size={18} className="text-slate-700" />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                    >
                      <ChevronRight size={18} className="text-slate-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-[80px] h-[58px] rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? "border-indigo-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length < 5 && (
                    <div className="shrink-0 w-[80px] h-[58px] rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 text-xs font-bold">
                      +{images.length}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title + Meta */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <Shield size={12} /> Verified Listing
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(product.avg_rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{(product.avg_rating || 4.8).toFixed(1)}</span>
                  <span className="text-sm text-slate-500">({product.review_count || 0} Reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500 font-medium">
                  {Math.max(20, (product.review_count || 0) * 2)}+ Bookings
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  {product.area}, {product.city}
                </div>
              </div>

              {/* Price row */}
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-2xl font-black text-slate-900">
                  ৳ {product.price_per_day.toLocaleString()}
                  <span className="text-sm font-medium text-slate-500 ml-1">/ day</span>
                </span>
                <span className="text-sm text-slate-500">
                  ৳ {(product.price_per_day * 6).toLocaleString()} / week
                </span>
                <span className="text-sm text-slate-500">
                  ৳ {(product.price_per_day * 25).toLocaleString()} / month
                </span>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Highlights</h2>
              <div className="flex flex-wrap gap-2.5">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default">
                    <span className="text-slate-500">{h.icon}</span>
                    {h.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className={`text-sm text-slate-600 leading-relaxed ${!descExpanded ? "line-clamp-3" : ""}`}>
                {product.description || `Well maintained ${product.title} in excellent condition. Perfect for city rides, corporate use or family trips. Comfortable, fuel efficient and clean interior.`}
              </p>
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-2 flex items-center gap-1 text-indigo-600 text-xs font-bold hover:underline"
              >
                {descExpanded ? "Show less" : "Read more"} <ChevronDown size={14} className={descExpanded ? "rotate-180" : ""} />
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Share:</span>
              {["💬", "✉️", "📘", "🔗"].map((icon, i) => (
                <button key={i} className="w-8 h-8 bg-slate-100 hover:bg-indigo-50 rounded-full flex items-center justify-center text-sm transition-colors">
                  {icon}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab} {tab === "Reviews" && `(${product.review_count || 0})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Features */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm">Features</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {FEATURE_KEYWORDS.slice(0, 12).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="text-slate-400">{f.icon}</span>
                          {f.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About the Owner */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm">About the Owner</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                        {ownerInitials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-sm">
                            {product.owner?.first_name} {product.owner?.last_name}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                            <Check size={9} /> Verified
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">
                          ⭐ {(product.avg_rating || 4.9).toFixed(1)} ({product.review_count || 86} Reviews) • {Math.max(50, (product.review_count || 86) + 39)} Listings
                        </div>
                        <div className="text-xs text-slate-400">
                          Response time: within 1 hour<br />
                          Member since: {dayjs(product.owner?.created_at).format("MMM YYYY")}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                            View Profile
                          </button>
                          <button className="w-9 h-[30px] border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Preview */}
                  <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm">Customer Reviews</h3>
                    <div className="flex gap-8">
                      {/* Score */}
                      <div className="text-center shrink-0">
                        <div className="text-5xl font-black text-slate-900 leading-none">{(product.avg_rating || 4.8).toFixed(1)}</div>
                        <div className="flex items-center gap-0.5 justify-center mt-2 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} className={s <= Math.round(product.avg_rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                        <div className="text-xs text-slate-400">({product.review_count || 0} Reviews)</div>
                      </div>
                      {/* Bars */}
                      <div className="flex-1 space-y-2">
                        {[
                          { stars: 5, pct: 85 },
                          { stars: 4, pct: 10 },
                          { stars: 3, pct: 3 },
                          { stars: 2, pct: 1 },
                          { stars: 1, pct: 1 },
                        ].map(({ stars, pct }) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-3 text-right font-semibold">{stars}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-6">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Sample review */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">SA</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">Sabir Ahmed</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} className="fill-amber-400 text-amber-400" />)}
                          </div>
                          <span className="text-[10px] text-slate-400">2 days ago</span>
                        </div>
                        <p className="text-xs text-slate-600">Car was in excellent condition. Very smooth ride and owner was very helpful.</p>
                      </div>
                    </div>
                    <button className="mt-3 text-xs font-bold text-indigo-600 hover:underline">View all reviews →</button>
                  </div>
                </div>
              )}

              {activeTab === "Features" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                    {FEATURE_KEYWORDS.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">{f.icon}</div>
                        {f.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Specifications" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Condition", product.condition || "Good"],
                      ["Delivery", product.delivery_option === "both" ? "Pick-up & Delivery" : product.delivery_option || "Pick-up"],
                      ["Location", `${product.area || ""}, ${product.city || ""}`],
                      ["Status", product.status || "Available"],
                      ["Category", product.category?.name || "Vehicles"],
                      ["Security Deposit", `৳ ${(product.security_deposit || 0).toLocaleString()}`],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3">
                        <div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
                        <div className="text-sm font-bold text-slate-800 capitalize">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Reviews" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center py-12 text-slate-400">
                  <Star size={36} className="mx-auto mb-3 text-slate-200" />
                  <p className="font-semibold text-slate-600">Reviews feature coming soon</p>
                  <p className="text-xs mt-1">This product has {product.review_count || 0} reviews</p>
                </div>
              )}

              {activeTab === "Location" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={16} className="text-indigo-500" />
                    <span className="font-semibold text-slate-800">{product.area}, {product.city}</span>
                  </div>
                  <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                    📍 Map view coming soon
                  </div>
                </div>
              )}
            </div>

            {/* Similar Items */}
            {similarProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">Similar Cars You Might Like</h2>
                  <Link href="/categories/vehicles" className="text-xs font-bold text-indigo-600 hover:underline">View all</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`} className="group">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="h-[100px] overflow-hidden bg-slate-100">
                          <img
                            src={p.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80"}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2.5">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-slate-700">{(p.avg_rating || 4.5).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400">({p.review_count || 0})</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-0.5">{p.title}</p>
                          <p className="text-[11px] font-bold text-indigo-600">৳ {(p.price_per_day || 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ day</span></p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin size={9} /> {p.area || ""}, {p.city || "Dhaka"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Booking Widget ──────────────────────────────────── */}
          <div className="xl:col-span-4">
            <div className="sticky top-6 space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {/* Price Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-slate-900">৳ {pricePerPeriod.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-1">/ {periodLabel}</span>
                  </div>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">Price Details</button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Duration Mode */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Select Rental Duration</label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                      {(["Daily", "Weekly", "Monthly"] as DurationMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDurationMode(mode)}
                          className={`flex-1 py-2 text-xs font-bold transition-all ${
                            durationMode === mode
                              ? "bg-white border border-indigo-500 text-indigo-600 rounded-lg -mx-px shadow-sm z-10"
                              : "text-slate-500 hover:text-slate-700 bg-slate-50"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pick-up Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">Pick-up Date & Time</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium"
                        />
                      </div>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium cursor-pointer"
                      >
                        {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Return Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">Return Date & Time</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium"
                        />
                      </div>
                      <select
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium cursor-pointer"
                      >
                        {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pick-up / Delivery Toggle */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Pick-up / Delivery</label>
                    <div className="flex gap-2">
                      {(["Pick-up", "Delivery"] as DeliveryMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDeliveryMode(mode)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                            deliveryMode === mode
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {deliveryMode === mode && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2.5 py-3 border-t border-b border-slate-100">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Price ({days} days)</span>
                      <span className="font-semibold text-slate-800">৳ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Service Fee</span>
                      <span className="font-semibold text-slate-800">৳ {serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        Security Deposit
                        <button title="Fully refundable after successful return" className="text-slate-300 hover:text-slate-500">
                          <Eye size={12} />
                        </button>
                      </span>
                      <span className="font-semibold text-slate-800">৳ {(product.security_deposit || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Booking & Cart Actions */}
                  {bookingSuccess ? (
                    <div className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-center text-sm shadow-md flex items-center justify-center gap-2 animate-in fade-in duration-200">
                      <Check size={18} /> Request Submitted! Redirecting...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleBookNow}
                        disabled={bookingLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          "Request to Book Now"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const primaryImg =
                            product.image_url ||
                            product.images?.find((img: any) => img.is_primary)?.url ||
                            product.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80";

                          useCartStore.getState().addItem({
                            id: product.id,
                            title: product.title,
                            category: product.category?.name || "General",
                            price_per_day: product.price_per_day,
                            security_deposit: product.security_deposit || 2000,
                            image_url: primaryImg,
                            owner_id: product.owner_id || "owner-1",
                            owner_name: product.owner?.first_name ? `${product.owner.first_name} ${product.owner.last_name || ""}` : "Verified Owner",
                            start_date: pickupDate ? dayjs(pickupDate).format("YYYY-MM-DD") : "2025-05-25",
                            end_date: returnDate ? dayjs(returnDate).format("YYYY-MM-DD") : "2025-05-28",
                            delivery_option: deliveryMode.toLowerCase(),
                          });

                          router.push("/cart");
                        }}
                        className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShoppingCart size={16} /> Add to Rental Cart
                      </button>
                    </div>
                  )}

                  {/* Chat */}
                  <button className="w-full py-3 border-2 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                    <MessageCircle size={15} /> Chat with Owner
                  </button>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Shield size={12} className="text-slate-300" />
                    Safe & Secure Payments. 24/7 Support.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
