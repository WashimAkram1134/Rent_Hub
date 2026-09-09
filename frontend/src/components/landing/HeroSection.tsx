"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Search, MapPin, ArrowRight, Shield, Star, Sparkles,
  RotateCcw, Camera, Laptop, Car, Zap, CheckCircle2,
  TrendingUp, Users, Heart
} from "lucide-react";
import ParticleCanvas from "./ParticleCanvas";

// ── Rotating Headline Keywords ────────────────────────────────────────────────
const ROTATING_WORDS = [
  { text: "Luxury 360° Cars", color: "from-blue-400 via-indigo-300 to-purple-400", href: "/categories/vehicles" },
  { text: "Cinema Cameras", color: "from-amber-300 via-rose-300 to-pink-400", href: "/categories/cameras" },
  { text: "MacBook Pros", color: "from-cyan-300 via-teal-300 to-emerald-400", href: "/categories/electronics" },
  { text: "4K Drones & GoPros", color: "from-emerald-300 via-sky-300 to-blue-400", href: "/categories/cameras" },
  { text: "Luxury Apartments", color: "from-purple-300 via-pink-300 to-rose-400", href: "/categories/apartments" },
];

const SEARCH_PLACEHOLDERS = [
  "Try 'Range Rover 360°'...",
  "Try 'Sony Alpha A7 IV'...",
  "Try 'MacBook Pro M3 Max'...",
  "Try 'DJI Mini 4 Pro Drone'...",
  "Try 'Yamaha R15 V4'...",
  "Try 'Luxury Apartment Gulshan'...",
];

// ── Showcase Items for 3D Floating Showcase ───────────────────────────────────
const SHOWCASE_ITEMS = [
  {
    id: "range-rover-velar-360",
    slug: "range-rover-velar-360",
    title: "Range Rover Velar 2024",
    category: "Vehicles",
    badge: "360° Interactive",
    price: 14000,
    rating: 4.95,
    reviews: 86,
    location: "Gulshan, Dhaka",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85",
    accent: "from-indigo-600 to-violet-600",
  },
  {
    id: "sony-a7-iv",
    slug: "sony-a7-iv",
    title: "Sony Alpha A7 IV + GM Lens",
    category: "Cameras",
    badge: "Top Rated",
    price: 3000,
    rating: 4.9,
    reviews: 64,
    location: "Banani, Dhaka",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    accent: "from-rose-600 to-pink-600",
  },
  {
    id: "macbook-air-m2",
    slug: "macbook-air-m2",
    title: "MacBook Pro 16\" M3 Max",
    category: "Electronics",
    badge: "Popular Tech",
    price: 3200,
    rating: 4.95,
    reviews: 76,
    location: "Dhanmondi, Dhaka",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    accent: "from-blue-600 to-cyan-600",
  },
  {
    id: "bmw-m5-competition-360",
    slug: "bmw-m5-competition-360",
    title: "BMW M5 Competition 2024",
    category: "Vehicles",
    badge: "360° View",
    price: 16500,
    rating: 5.0,
    reviews: 52,
    location: "Banani, Dhaka",
    image: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=85",
    accent: "from-purple-600 to-indigo-600",
  },
];

// ── Live Activity Ticker Items ────────────────────────────────────────────────
const LIVE_ACTIVITIES = [
  { name: "Washim A.", location: "Gulshan", item: "Range Rover Velar 360°", time: "2 mins ago", avatar: "WA", color: "bg-indigo-600" },
  { name: "Tanvir H.", location: "Banani", item: "Sony Alpha A7 IV", time: "5 mins ago", avatar: "TH", color: "bg-rose-600" },
  { name: "Sadia K.", location: "Dhanmondi", item: "MacBook Pro M3", time: "8 mins ago", avatar: "SK", color: "bg-cyan-600" },
  { name: "Farhan M.", location: "Uttara", item: "DJI Mini 4 Pro Drone", time: "12 mins ago", avatar: "FM", color: "bg-emerald-600" },
];

// ── 3D Floating Tilt Card Component ──────────────────────────────────────────
function Floating3DCard({
  item,
  isActive,
  onClick,
}: {
  item: typeof SHOWCASE_ITEMS[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.04, z: 30 }}
      transition={{ duration: 0.3 }}
      className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 backdrop-blur-xl border transition-all duration-300 ${
        isActive
          ? "bg-white/[0.14] border-indigo-400/60 shadow-2xl shadow-indigo-500/25 ring-2 ring-indigo-400/40"
          : "bg-white/[0.06] border-white/10 hover:border-white/30 hover:bg-white/[0.1] shadow-xl shadow-black/40"
      }`}
    >
      <div className="relative h-32 sm:h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
        />
        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${item.accent} shadow-md flex items-center gap-1`}>
            {item.badge.includes("360") && <RotateCcw size={10} className="animate-spin-slow" />}
            {item.badge}
          </span>
        </div>
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5 text-[11px] font-bold text-amber-300 flex items-center gap-1">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {item.rating}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {item.title}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-white/60 mt-0.5">
            <MapPin size={11} className="text-indigo-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs sm:text-sm font-black text-indigo-300">
            ৳{item.price.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/50">/ day</div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Dhaka");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);

  // Rotate hero dynamic words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Rotate search placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Rotate live activity notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIdx((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParam = searchQuery.trim() ? `q=${encodeURIComponent(searchQuery.trim())}` : "";
    const cityParam = selectedCity ? `city=${encodeURIComponent(selectedCity)}` : "";
    const params = [queryParam, cityParam].filter(Boolean).join("&");
    router.push(`/search${params ? `?${params}` : ""}`);
  };

  const currentActivity = LIVE_ACTIVITIES[activityIdx];

  return (
    <section className="relative min-h-[96vh] flex flex-col justify-center overflow-hidden bg-[#07070F] pt-24 pb-16">
      {/* ── 60fps Interactive Particle Canvas ───────────────────────────────── */}
      <ParticleCanvas />

      {/* ── Deep Luxury Aurora Gradient Meshes ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-25 blur-[120px] animate-pulse"
          style={{ background: "radial-gradient(circle, #6366f1 0%, #8b5cf6 45%, transparent 70%)", animationDuration: "6s" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-18 blur-[100px]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, #6366f1 50%, transparent 75%)" }}
        />
        <div
          className="absolute -bottom-20 -left-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[110px]"
          style={{ background: "radial-gradient(circle, #ec4899 0%, #a855f7 50%, transparent 75%)" }}
        />

        {/* Subtle Tech Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ── Top Announcement & Live Badge ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {/* Demo Mode Flag Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 backdrop-blur-md shadow-lg shadow-amber-500/10"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              Demo Mode
            </span>
            <span className="text-amber-200/90 text-xs sm:text-sm font-medium">
              Information on this landing page is simulated for demonstration
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md text-indigo-200 text-xs font-semibold"
          >
            <span>Peer-to-Peer Rental Network</span>
          </motion.div>

          {/* Live Activity Toast Pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activityIdx}
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              transition={{ duration: 0.35 }}
              onClick={() => router.push(`/search?q=${encodeURIComponent(currentActivity.item)}`)}
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 cursor-pointer backdrop-blur-md text-[11px] text-white/80 transition-all"
              title={`View ${currentActivity.item}`}
            >
              <div className={`w-4 h-4 rounded-full ${currentActivity.color} flex items-center justify-center text-[9px] font-bold text-white`}>
                {currentActivity.avatar}
              </div>
              <span>
                <strong className="text-white font-semibold">{currentActivity.name}</strong> in {currentActivity.location} booked{" "}
                <span className="text-indigo-300 font-semibold">{currentActivity.item}</span>
              </span>
              <span className="text-white/40 text-[10px]">({currentActivity.time})</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Main Kinetic Headline ─────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Rent Anything, Anytime.{" "}
            <br className="hidden sm:inline" />
            <span className="inline-block mt-1">
              <AnimatePresence mode="wait">
                <Link
                  key={wordIdx}
                  href={ROTATING_WORDS[wordIdx].href}
                  className="inline-block cursor-pointer hover:scale-102 transition-transform"
                  title="Explore category"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`inline-block bg-gradient-to-r ${ROTATING_WORDS[wordIdx].color} bg-clip-text text-transparent drop-shadow-sm font-extrabold`}
                  >
                    {ROTATING_WORDS[wordIdx].text}
                  </motion.span>
                </Link>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Access luxury cars with <span className="text-indigo-300 font-semibold">360° interactive views</span>, cinema cameras, tech gear & apartments. Or earn up to <span className="text-emerald-300 font-bold">৳80,000/month</span> by listing your unused assets.
          </motion.p>
        </div>

        {/* ── Smart Interactive Search Bar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative p-2 rounded-2xl sm:rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl shadow-indigo-500/10 hover:border-indigo-400/50 transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 group"
          >
            {/* Search Input with Dynamic Cycling Placeholder */}
            <div className="flex items-center gap-3 flex-1 px-3 sm:px-4 py-2 w-full">
              <Search className="w-5 h-5 text-indigo-400 shrink-0 group-focus-within:scale-110 transition-transform" />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
                  className="w-full outline-none text-white placeholder-slate-400 bg-transparent text-sm sm:text-base font-medium"
                />
              </div>
            </div>

            {/* City Selector Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 sm:py-0 border-t sm:border-t-0 sm:border-l border-white/10 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm font-semibold outline-none cursor-pointer pr-2"
              >
                <option value="Dhaka" className="bg-slate-900 text-white">Dhaka</option>
                <option value="Chattogram" className="bg-slate-900 text-white">Chattogram</option>
                <option value="Sylhet" className="bg-slate-900 text-white">Sylhet</option>
                <option value="Cox's Bazar" className="bg-slate-900 text-white">Cox&apos;s Bazar</option>
                <option value="Rajshahi" className="bg-slate-900 text-white">Rajshahi</option>
              </select>
            </div>

            {/* Search Submit CTA Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/40 transition-all shrink-0"
            >
              <span>Explore Gear</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Quick Category Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-slate-400 text-xs font-semibold mr-1">Trending:</span>
            {[
              { label: "🚗 Luxury Cars 360°", q: "range-rover" },
              { label: "📷 Sony & Canon DSLRs", q: "camera" },
              { label: "💻 MacBook Pros", q: "macbook" },
              { label: "🛸 4K Drones", q: "drone" },
              { label: "🏍️ Yamaha & Enfield", q: "bike" },
              { label: "🏡 Lakeview Apartments", q: "apartment" },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={`/search?q=${encodeURIComponent(tag.q)}`}
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-300 bg-white/[0.05] border border-white/10 hover:bg-white/[0.12] hover:text-white hover:border-indigo-400/40 transition-all duration-200 backdrop-blur-sm"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── 3D Parallax Floating Showcase Matrix ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 mb-10"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Featured Live Listings with 360° Views
              </h3>
            </div>
            <Link
              href="/categories/vehicles"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View All 10,000+ <ArrowRight size={13} />
            </Link>
          </div>

          {/* 4 Responsive 3D Tilt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHOWCASE_ITEMS.map((item, idx) => (
              <Floating3DCard
                key={item.id}
                item={item}
                isActive={activeShowcase === idx}
                onClick={() => {
                  setActiveShowcase(idx);
                  router.push(`/products/${item.slug}`);
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Action CTA Button Row ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/categories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:scale-103 transition-all group"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
          <Link
            href="/products/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base border border-white/20 bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.12] hover:border-white/30 transition-all hover:scale-103 shadow-lg"
          >
            <span>List an Item to Earn</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              +৳80K/mo
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Subtle Wave Divider */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 text-background">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
