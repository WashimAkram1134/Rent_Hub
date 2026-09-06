"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Car, Camera, Laptop, Home, Armchair,
  Shirt, Dumbbell, BookOpen, ArrowUpRight, Sparkles, RotateCcw
} from "lucide-react";

const CATEGORIES = [
  {
    name: "Vehicles & 360° Cars",
    slug: "vehicles",
    icon: Car,
    count: "450+ Items",
    badge: "🔥 360° Angle Views",
    description: "Range Rovers, BMWs, Sedans, Bikes & Microbuses with 360° rotation.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    gradient: "from-blue-600 via-indigo-600 to-purple-700",
    glowColor: "rgba(99, 102, 241, 0.35)",
  },
  {
    name: "Cameras & Cinema Lenses",
    slug: "cameras",
    icon: Camera,
    count: "380+ Items",
    badge: "4K/6K Gear",
    description: "Sony A7 IV, Canon EOS R6, Blackmagic 6K, DJI Drones & Prime Lenses.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    gradient: "from-rose-600 via-pink-600 to-amber-600",
    glowColor: "rgba(244, 63, 94, 0.35)",
  },
  {
    name: "Electronics & MacBooks",
    slug: "electronics",
    icon: Laptop,
    count: "620+ Items",
    badge: "Apple M3 Pro",
    description: "MacBook Pro M3 Max, iPads, PS5 Consoles, VR Headsets & Audio.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    gradient: "from-cyan-600 via-teal-600 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.35)",
  },
  {
    name: "Apartments & Vacation Stays",
    slug: "apartments",
    icon: Home,
    count: "290+ Items",
    badge: "Verified Stays",
    description: "Gulshan lakeview flats, Cox's Bazar beach villas & studios.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    gradient: "from-purple-600 via-violet-600 to-pink-600",
    glowColor: "rgba(168, 85, 247, 0.35)",
  },
  {
    name: "Furniture & Decor",
    slug: "furniture",
    icon: Armchair,
    count: "180+ Items",
    badge: "Solid Teak",
    description: "Herman Miller ergonomic chairs, dining sets & electric recliners.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
  {
    name: "Fashion & Designer Wear",
    slug: "fashion",
    icon: Shirt,
    count: "310+ Items",
    badge: "Bridal & Party",
    description: "Wedding lehengas, tuxedo suits, luxury watches & designer jewelry.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    gradient: "from-pink-600 via-rose-600 to-purple-600",
    glowColor: "rgba(236, 72, 153, 0.35)",
  },
  {
    name: "Sports & Fitness Gear",
    slug: "sports",
    icon: Dumbbell,
    count: "220+ Items",
    badge: "Outdoor & Gym",
    description: "Trek mountain bikes, camping tents, cricket kits & treadmills.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-600 via-green-600 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.35)",
  },
  {
    name: "Books & Educational Kits",
    slug: "books",
    icon: BookOpen,
    count: "540+ Items",
    badge: "Academic",
    description: "Medical, engineering textbooks, rare fiction & self-improvement books.",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
    gradient: "from-violet-600 via-blue-600 to-indigo-600",
    glowColor: "rgba(139, 92, 246, 0.35)",
  },
];

// ── 3D Tilt Category Card ─────────────────────────────────────────────────────
function Category3DCard({ cat, idx }: { cat: typeof CATEGORIES[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = cat.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: idx * 0.06 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative h-[280px] rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 bg-slate-900/80 shadow-xl transition-all"
    >
      <Link href={`/categories/${cat.slug}`} className="block h-full w-full">
        {/* Background Image with Zoom */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Top Badges */}
        <div className="relative z-10 p-5 flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-full h-full rounded-[14px] bg-slate-950/40 backdrop-blur-md flex items-center justify-center text-white">
              <Icon size={22} />
            </div>
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1">
            {cat.badge.includes("360") && <RotateCcw size={10} className="animate-spin" style={{ animationDuration: "5s" }} />}
            {cat.badge}
          </span>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex flex-col justify-end">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-white text-lg group-hover:text-indigo-300 transition-colors">
              {cat.name}
            </h3>
            <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-300 transition-all shrink-0">
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          <p className="text-xs text-slate-300/80 line-clamp-2 mb-3 leading-relaxed">
            {cat.description}
          </p>

          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-white/10">
            <span className="font-bold text-indigo-400">{cat.count}</span>
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
              Explore inventory →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CategoriesSection() {
  return (
    <section className="relative py-20 bg-[#07070F] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <Sparkles size={13} />
            <span>Curated Catalogs</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Explore Categories with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              360° Visuals
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            From flagship luxury vehicles and cinema cameras to everyday laptops and beach villas — rent locally with instant verification.
          </motion.p>
        </div>

        {/* 8 Bento 3D Tilt Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <Category3DCard key={cat.slug} cat={cat} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
