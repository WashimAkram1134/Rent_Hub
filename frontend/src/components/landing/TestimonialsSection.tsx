"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Quote, Heart, CheckCircle2, Sparkles, MapPin } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  category: "renter" | "owner";
  rentedItem: string;
  avatar: string;
  rating: number;
  text: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Tanvir Hasan",
    role: "Commercial Cinematographer",
    location: "Gulshan, Dhaka",
    category: "renter",
    rentedItem: "Sony Alpha A7 IV + 24-70mm GM",
    avatar: "TH",
    rating: 5,
    text: "Needed a second 4K camera body for a 3-day wedding shoot in Cox's Bazar. RentHub made it effortless. The 360° angle photos matched the exact camera condition, and pickup in Banani took 5 minutes. Saved me over ৳250,000 compared to buying!",
    accent: "from-indigo-600 to-violet-600",
  },
  {
    id: "2",
    name: "Washim Akram",
    role: "Asset Owner & Entrepreneur",
    location: "Banani, Dhaka",
    category: "owner",
    rentedItem: "Range Rover Velar & Sony A7 IV",
    avatar: "WA",
    rating: 5,
    text: "I listed my Range Rover Velar and extra cinema camera kit on RentHub. I've earned over ৳180,000 in the last 3 months with 100% escrow protection. The biometric NID verification gives me complete peace of mind that my gear is in responsible hands.",
    accent: "from-emerald-600 to-teal-600",
  },
  {
    id: "3",
    name: "Sadia Rahman",
    role: "Architect & Interior Designer",
    location: "Dhanmondi, Dhaka",
    category: "renter",
    rentedItem: "MacBook Pro 16\" M3 Max",
    avatar: "SR",
    rating: 5,
    text: "My primary workstation crashed during thesis submission week. I rented a top-spec M3 Max MacBook for 7 days. It was delivered directly to my apartment in Dhanmondi within 2 hours. This platform is a lifesaver for creative professionals.",
    accent: "from-purple-600 to-pink-600",
  },
  {
    id: "4",
    name: "Farhan Masud",
    role: "Travel Vlogger & Pilot",
    location: "Uttara, Dhaka",
    category: "renter",
    rentedItem: "DJI Mini 4 Pro Drone (Fly More)",
    avatar: "FM",
    rating: 5,
    text: "Rented a DJI Mini 4 Pro for a Sajek Valley trip. The escrow system protected my deposit and the owner included 3 extra batteries. The 360° inspection protocol meant there was zero disagreement on return. Truly 10/10 service.",
    accent: "from-cyan-600 to-blue-600",
  },
  {
    id: "5",
    name: "Dr. Rafiqul Islam",
    role: "Medical Academic & Owner",
    location: "Mohakhali, Dhaka",
    category: "owner",
    rentedItem: "Solid Teak Conference Table & Chairs",
    avatar: "RI",
    rating: 5,
    text: "Our corporate furniture and projection setup now earns steady passive revenue between events. The digital contract generation and direct bKash payouts make managing listings completely hands-off.",
    accent: "from-amber-600 to-orange-600",
  },
  {
    id: "6",
    name: "Anika Chowdhury",
    role: "Fashion Stylist",
    location: "Bashundhara, Dhaka",
    category: "renter",
    rentedItem: "Designer Bridal Lehenga & Jewelry",
    avatar: "AC",
    rating: 5,
    text: "Rented a couture wedding dress for a reception event. Dry-cleaned, pristine condition, and looked gorgeous in photos. Why spend lakhs buying an outfit you only wear once when you can rent seamlessly on RentHub?",
    accent: "from-rose-600 to-pink-600",
  },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 18 });

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

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -3 }}
      className="p-6 sm:p-7 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 backdrop-blur-xl transition-all flex flex-col justify-between"
    >
      <div>
        {/* Rating Stars & Quote */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(t.rating)].map((_, i) => (
              <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase">
            {t.category === "owner" ? "Verified Owner" : "Verified Renter"}
          </span>
        </div>

        {/* Testimonial Text */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
          &ldquo;{t.text}&rdquo;
        </p>
      </div>

      {/* Author Details */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.accent} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md`}>
            {t.avatar}
          </div>
          <div>
            <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
              <span>{t.name}</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">{t.role}</div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[11px] font-bold text-indigo-300 truncate max-w-[140px]">
            {t.rentedItem}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-0.5 justify-end">
            <MapPin size={9} />
            <span>{t.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const [filter, setFilter] = useState<"all" | "renter" | "owner">("all");

  const filtered = TESTIMONIALS.filter((t) => (filter === "all" ? true : t.category === filter));

  return (
    <section className="relative py-24 bg-[#07070F] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 right-10 w-[600px] h-[600px] opacity-15 blur-[140px]"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <Heart size={13} />
            <span>Community Stories</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Loved by Over{" "}
            <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              28,000+ Renters & Owners
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Hear how photographers, entrepreneurs, travelers, and students in Bangladesh are saving money and earning passive income with RentHub.
          </motion.p>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[
              { label: "All Stories (6)", val: "all" },
              { label: "Renters Experience", val: "renter" },
              { label: "Asset Owners & Earnings", val: "owner" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setFilter(tab.val as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === tab.val
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Responsive Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
