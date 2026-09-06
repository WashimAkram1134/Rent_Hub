"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, DollarSign, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle2, TrendingUp, Zap, HelpCircle
} from "lucide-react";

interface CategoryRate {
  id: string;
  name: string;
  icon: string;
  dailyRate: number;
  sampleItem: string;
  demand: "Very High" | "High" | "Medium";
}

const CATEGORY_RATES: CategoryRate[] = [
  { id: "car", name: "Cars & SUVs", icon: "🚗", dailyRate: 6500, sampleItem: "e.g. Range Rover, Premio, BMW", demand: "Very High" },
  { id: "camera", name: "DSLR & Cameras", icon: "📷", dailyRate: 2800, sampleItem: "e.g. Sony A7 IV, Canon EOS R6", demand: "Very High" },
  { id: "laptop", name: "MacBooks & Tech", icon: "💻", dailyRate: 2500, sampleItem: "e.g. MacBook Pro M3, iPad Pro", demand: "High" },
  { id: "bike", name: "Motorcycles", icon: "🏍️", dailyRate: 1400, sampleItem: "e.g. Yamaha R15 V4, Hunter 350", demand: "Very High" },
  { id: "drone", name: "4K Drones & Gear", icon: "🛸", dailyRate: 2200, sampleItem: "e.g. DJI Mini 4 Pro, Gimbal", demand: "High" },
  { id: "apartment", name: "Apartments & Rooms", icon: "🏡", dailyRate: 4500, sampleItem: "e.g. Gulshan Flat, Beach Villa", demand: "Very High" },
];

export function EarningsCalculatorSection() {
  const [selectedCat, setSelectedCat] = useState<CategoryRate>(CATEGORY_RATES[0]);
  const [rentalDays, setRentalDays] = useState<number>(10);

  const monthlyGross = selectedCat.dailyRate * rentalDays;
  const yearlyGross = monthlyGross * 12;
  const platformFee = Math.round(monthlyGross * 0.05); // 5% service fee
  const netMonthly = monthlyGross - platformFee;
  const netYearly = netMonthly * 12;

  return (
    <section className="relative py-24 bg-[#0a0a14] overflow-hidden border-t border-white/[0.08]">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] opacity-15 blur-[140px]"
          style={{ background: "radial-gradient(circle, #10b981 0%, #6366f1 50%, transparent 75%)" }}
        />
        <div
          className="absolute -bottom-20 left-0 w-[500px] h-[500px] opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <TrendingUp size={13} />
            <span>Monetize Your Assets</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            See How Much You Can{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Earn Every Month
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Your car, camera, laptop, or apartment doesn&apos;t need to sit idle. Rent it securely to verified borrowers with full escrow deposit protection.
          </motion.p>
        </div>

        {/* ── Main Calculator Grid Container ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ── Left Column: Controls (7 cols) ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              {/* Step 1: Select Category */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Select What You Want to Rent Out</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Demand: {selectedCat.demand}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORY_RATES.map((cat) => {
                    const isSelected = selectedCat.id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCat(cat)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? "bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border-emerald-400/60 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/30"
                            : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-2xl">{cat.icon}</div>
                        <div className="text-xs font-bold text-white leading-tight">{cat.name}</div>
                        <div className="text-[11px] text-emerald-300 font-bold">~৳{cat.dailyRate.toLocaleString()}/day</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Days Per Month Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Estimated Days Rented Per Month
                  </label>
                  <span className="text-sm font-black text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-xl border border-indigo-400/30">
                    {rentalDays} {rentalDays === 1 ? "Day" : "Days"} / Month
                  </span>
                </div>

                {/* Range Slider */}
                <div className="relative py-2">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                    <span>1 Day (Weekend)</span>
                    <span>10 Days (Part-Time)</span>
                    <span>20 Days</span>
                    <span>30 Days (Full-Time)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Highlight Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>100% Security Deposit Protected</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Zap size={16} className="text-cyan-400 shrink-0" />
                <span>Instant automated payouts via bKash/Bank</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: Earnings Summary Card (5 cols) ────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/70 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Calculated Projection
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedCat.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                  {selectedCat.icon}
                </div>
              </div>

              {/* Big Monthly Number */}
              <div className="mb-6 p-5 rounded-2xl bg-black/40 border border-white/10 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                  Estimated Monthly Net Earnings
                </span>
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  ৳{netMonthly.toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 font-medium block mt-1">
                  Based on {rentalDays} days @ ৳{selectedCat.dailyRate.toLocaleString()}/day
                </span>
              </div>

              {/* Annual Estimate */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs sm:text-sm">
                  <span className="text-slate-400">Annual Projected Income:</span>
                  <span className="font-extrabold text-emerald-300">৳{netYearly.toLocaleString()} / year</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs sm:text-sm">
                  <span className="text-slate-400">Owner Take-Home:</span>
                  <span className="font-bold text-slate-200">95% (Lowest platform fee)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs sm:text-sm">
                  <span className="text-slate-400">Security Deposit:</span>
                  <span className="font-bold text-cyan-300">100% Guaranteed Escrow</span>
                </div>
              </div>
            </div>

            {/* List CTA Button */}
            <Link
              href="/products/new"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-slate-950 text-sm sm:text-base bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 shadow-xl shadow-emerald-500/20 hover:scale-102 transition-all"
            >
              <span>List Your {selectedCat.name.split(" ")[0]} & Start Earning</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
