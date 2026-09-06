"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, Lock, RotateCcw, Zap,
  CheckCircle2, Star, Sparkles, UserCheck, PhoneCall, FileText
} from "lucide-react";

export function TrustAndSafetySection() {
  return (
    <section className="relative py-24 bg-[#0a0a14] overflow-hidden border-t border-white/[0.08]">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-0 w-[600px] h-[600px] opacity-15 blur-[140px]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-15 blur-[140px]"
          style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
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
            <ShieldCheck size={13} />
            <span>Built for Total Peace of Mind</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            Bank-Grade Security &{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Trust Protocol
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Every borrower is verified, every payment is secured in escrow, and every transaction is backed by legally-binding digital agreements and 360° inspection logs.
          </motion.p>
        </div>

        {/* ── Security Bento Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tile 1: Biometric NID Verification (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="md:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <UserCheck size={24} />
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> 100% Identity Verified
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                NID & Biometric AI Identity Verification
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
                All renters and owners undergo automated National ID (NID), phone OTP, and facial biometric checks before taking possession of any item. Zero anonymous accounts.
              </p>
            </div>

            {/* Visual Digital ID Badge Simulation */}
            <div className="relative z-10 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                  WA
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Washim Akram</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-bold">NID VERIFIED</span>
                  </div>
                  <div className="text-[10px] text-slate-400">ID: NID-882947190 • Rating: 4.95 ⭐ (86 Rentals)</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30">
                  Trust Score: 99.8%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tile 2: 100% Escrow Deposit Protection (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="md:col-span-5 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-4">
                <Lock size={24} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                100% Escrow Protection
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                Security deposits and rental payments are secured in escrow until the item is returned safely. No cash disputes or withheld deposits.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Deposit Security:</span>
                <span className="font-bold text-emerald-300">100% Guaranteed</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Refund Speed:</span>
                <span className="font-bold text-cyan-300">Instant (Within 5 mins)</span>
              </div>
            </div>
          </motion.div>

          {/* Tile 3: 360° Inspection Guarantee (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -3 }}
            className="md:col-span-5 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4">
                <RotateCcw size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                360° Condition Scan Log
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-4">
                Both parties capture multi-angle condition photos (Front, Back, Inside, Outside) before hand-off, generating a time-stamped visual audit trail.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Pre-Rental Photo Audit</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Zero Disputes
              </span>
            </div>
          </motion.div>

          {/* Tile 4: Instant Automated Payouts & 24/7 Concierge (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -3 }}
            className="md:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Zap size={24} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <PhoneCall size={14} className="text-indigo-400" />
                  <span>24/7 Concierge Support in Dhaka</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Instant Automated Payouts & Digital Contracts
              </h3>
              <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed mb-6">
                Owners receive rental earnings directly into their bKash, Nagad, or Bank account automatically. Every rental generates an encrypted, legally-binding contract for total compliance.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: "bKash Direct", time: "Instant", icon: "⚡" },
                { name: "Nagad Wallet", time: "Instant", icon: "📱" },
                { name: "Bank Transfer", time: "Same Day", icon: "🏛️" },
              ].map((p) => (
                <div key={p.name} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <div className="text-lg mb-0.5">{p.icon}</div>
                  <div className="text-xs font-bold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">{p.time}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
