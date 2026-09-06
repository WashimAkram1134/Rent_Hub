"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShieldCheck, Zap, RotateCcw,
  CheckCircle2, ArrowRight, Sparkles, Lock, MapPin, Truck
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    id: "discover",
    title: "Discover & Inspect in 360°",
    tagline: "Filter by location, category & real verified photos",
    description: "Browse thousands of listings across Dhaka and Bangladesh. Use interactive 360° vehicle rotation and multi-angle views to inspect every angle before you rent.",
    icon: Search,
    accent: "from-blue-500 to-indigo-600",
    badge: "360° Angle Views",
    mockup: {
      type: "search",
      title: "Range Rover Velar R-Dynamic",
      status: "360° View Verified",
      meta: "Gulshan 2, Dhaka • ৳14,000/day",
      highlight: "✨ Multi-angle condition photos verified",
    },
  },
  {
    step: "02",
    id: "escrow",
    title: "Instant Escrow Booking",
    tagline: "100% Security deposit safety guarantee",
    description: "Choose your dates, pick delivery or pickup, and confirm your booking. Your payment and security deposit are protected in escrow until you safely receive the item.",
    icon: Lock,
    accent: "from-purple-500 to-pink-600",
    badge: "100% Escrow Shield",
    mockup: {
      type: "escrow",
      title: "Escrow Deposit Locked",
      status: "Protected by RentHub Shield",
      meta: "Rental: ৳14,000 • Deposit: ৳25,000 (Refundable)",
      highlight: "🔒 Funds held safely until inspection passes",
    },
  },
  {
    step: "03",
    id: "delivery",
    title: "Doorstep Delivery & Easy Return",
    tagline: "Enjoy your rental, return & instant deposit release",
    description: "Receive your item directly at your doorstep with verified condition logs. Enjoy your trip or project, return the item, and get your deposit refunded instantly.",
    icon: Truck,
    accent: "from-emerald-500 to-teal-600",
    badge: "Instant Payout",
    mockup: {
      type: "delivery",
      title: "Order Completed & Deposit Released",
      status: "5.0 ⭐ Rating Received",
      meta: "Deposit refunded: ৳25,000 • Owner payout sent",
      highlight: "⚡ Instant bKash & Bank transfer completed",
    },
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = STEPS[activeStep];
  const Icon = currentStep.icon;

  return (
    <section className="relative py-24 bg-[#07070F] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-15 blur-[130px]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, #a855f7 50%, transparent 75%)" }}
        />
      </div>

      <div className="relative max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <Zap size={13} />
            <span>Frictionless Experience</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            How RentHub Works in{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Whether you are renting a car for a weekend or listing your cinema camera to earn passive income, our end-to-end platform handles identity verification, payments, and condition checks.
          </motion.p>
        </div>

        {/* ── Interactive 3-Step Container ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Step Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isSelected = activeStep === idx;
              return (
                <motion.div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`cursor-pointer p-6 sm:p-7 rounded-3xl border transition-all duration-300 ${
                    isSelected
                      ? "bg-white/[0.08] border-indigo-500/50 shadow-2xl shadow-indigo-500/15 ring-2 ring-indigo-400/30"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Step Number & Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 font-black text-sm bg-gradient-to-br ${s.accent} shadow-lg shadow-black/30`}>
                      <StepIcon size={22} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-400">STEP {s.step}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-xs font-semibold text-slate-400">{s.tagline}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isSelected ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30" : "bg-white/5 text-white/50 border-white/10"}`}>
                          {s.badge}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {s.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Live Interactive Preview Card (5 cols) */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20"
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${currentStep.accent} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Live Stage Simulator</span>
                      <h4 className="text-sm font-bold text-white">Step {currentStep.step}: {currentStep.title.split(" ")[0]}</h4>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                </div>

                {/* Mockup Body Content */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{currentStep.mockup.title}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <div className="text-xs text-indigo-300 font-semibold mb-1">
                      {currentStep.mockup.status}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {currentStep.mockup.meta}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{currentStep.mockup.highlight}</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-between text-xs pt-4 border-t border-white/10 text-slate-400">
                  <span className="font-semibold">Step {activeStep + 1} of 3</span>
                  <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${activeStep === i ? "w-6 bg-indigo-400" : "w-2 bg-white/20"}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
