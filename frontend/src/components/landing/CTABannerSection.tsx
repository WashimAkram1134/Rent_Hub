"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star, CheckCircle2, RotateCcw } from "lucide-react";

export function CTABannerSection() {
  return (
    <section className="relative py-24 bg-[#0a0a14] overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[500px] opacity-25 blur-[140px] animate-pulse"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, #ec4899 50%, transparent 80%)", animationDuration: "5s" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl sm:rounded-[36px] p-8 sm:p-14 lg:p-16 overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 text-center"
        >
          {/* Subtle Aurora Ambient Light inside Card */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-pink-500/25 blur-3xl pointer-events-none" />

          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-md">
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
              Join Over 28,000+ Smart Renters & Asset Owners
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-3xl mx-auto"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Ready to Experience the{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              Future of Renting?
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Rent luxury vehicles with 360° interactive views, professional cinema cameras & tech gear. Or list what you own and start earning passive income today.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl font-black text-slate-950 text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 shadow-xl shadow-emerald-500/25 hover:scale-104 transition-all group"
            >
              <span>Get Started Free in 30s</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>

            <Link
              href="/categories"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md hover:scale-104 transition-all shadow-lg"
            >
              <span>Explore 10,000+ Items</span>
            </Link>
          </div>

          {/* Guarantee Badges Strip */}
          <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-8 pt-8 border-t border-white/10 text-xs sm:text-sm font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>100% Escrow Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
              <span>Biometric NID Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-cyan-400 shrink-0" />
              <span>Instant Automated Payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-purple-400 shrink-0" />
              <span>360° Inspection Protocol</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
