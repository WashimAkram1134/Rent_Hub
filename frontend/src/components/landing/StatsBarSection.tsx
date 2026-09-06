"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Shield, TrendingUp, Users, Star, Award, CheckCircle2, Zap } from "lucide-react";

// Animated counter component using Framer Motion springs
function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 80, damping: 25 });
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (isInView) {
      motionVal.set(value);
    }
  }, [isInView, motionVal, value]);

  useEffect(() => {
    return springVal.on("change", (latest) => {
      if (ref.current) {
        if (value >= 1000) {
          ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
        } else if (value % 1 !== 0) {
          ref.current.textContent = `${prefix}${latest.toFixed(1)}${suffix}`;
        } else {
          ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
        }
      }
    });
  }, [springVal, value, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

const STATS = [
  {
    numeric: 18500000,
    prefix: "৳",
    suffix: "+",
    display: "৳18.5M+",
    label: "Total Volume Rented",
    sublabel: "Earned by everyday owners",
    icon: TrendingUp,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    numeric: 12450,
    prefix: "",
    suffix: "+",
    display: "12,450+",
    label: "Verified Active Items",
    sublabel: "Cars, cameras, laptops & more",
    icon: Award,
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    numeric: 99.8,
    prefix: "",
    suffix: "%",
    display: "99.8%",
    label: "Safe Return Guarantee",
    sublabel: "100% Escrow deposit protected",
    icon: Shield,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    numeric: 28900,
    prefix: "",
    suffix: "+",
    display: "28,900+",
    label: "Happy Community Members",
    sublabel: "Across Dhaka & Bangladesh",
    icon: Users,
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
];

const BRANDS = [
  { name: "Sony Cinema", icon: "📷" },
  { name: "Apple MacBook", icon: "💻" },
  { name: "Range Rover", icon: "🚙" },
  { name: "Canon EOS", icon: "📸" },
  { name: "BMW M-Power", icon: "🏎️" },
  { name: "DJI Drones", icon: "🛸" },
  { name: "Yamaha Racing", icon: "🏍️" },
  { name: "Herman Miller", icon: "💺" },
  { name: "GoPro Hero", icon: "🎥" },
  { name: "Blackmagic 6K", icon: "🎬" },
  { name: "Royal Enfield", icon: "🛵" },
  { name: "Trek Mountain", icon: "🚴" },
];

const TRUST_TAGS = [
  "🛡️ 100% Escrow Deposit Protection",
  "⚡ Instant bKash & Bank Payouts",
  "🔄 360° Angle Inspection Guarantee",
  "⭐ 4.95/5 Star Satisfaction Score",
  "🔒 Biometric & NID Verified Members",
  "🚀 Fast Doorstep Delivery in Dhaka",
  "💬 24/7 Dedicated Concierge Support",
  "📄 Legally Binding Rental Contracts",
];

export function StatsBarSection() {
  return (
    <section className="relative py-14 bg-[#0a0a14] border-y border-white/[0.08] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── 4 Animated Stat Tiles ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="relative p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 backdrop-blur-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.accent}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Verified Metric
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  {stat.numeric >= 1000000 ? (
                    <span>৳18.5M+</span>
                  ) : (
                    <Counter value={stat.numeric} prefix={stat.prefix} suffix={stat.suffix} />
                  )}
                </div>

                <div className="text-sm font-bold text-slate-200 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {stat.sublabel}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Brand Marquee Infinite Ticker ───────────────────────────────── */}
        <div className="space-y-3">
          {/* Top Marquee (Brands) */}
          <div className="relative overflow-hidden w-full py-2 mask-linear">
            <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
              {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/40 text-slate-300 text-xs sm:text-sm font-semibold transition-colors shrink-0"
                >
                  <span className="text-base">{brand.icon}</span>
                  <span>{brand.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Marquee (Trust Tags) */}
          <div className="relative overflow-hidden w-full py-1">
            <div className="flex items-center gap-3 animate-marquee-reverse whitespace-nowrap">
              {[...TRUST_TAGS, ...TRUST_TAGS, ...TRUST_TAGS].map((tag, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-xs font-semibold shrink-0"
                >
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
        .mask-linear {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}
