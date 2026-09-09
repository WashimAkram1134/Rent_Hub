"use client";

import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import {
  Sparkles, ShieldCheck, Heart, Users, TrendingUp,
  Target, Globe, Award, CheckCircle2, ArrowRight, Zap,
  Building, Check, Layers
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col font-sans">
      <Navbar />

      {/* ── Top Hero ── */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] opacity-20 blur-[140px]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, #a855f7 50%, transparent 75%)" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} />
            <span>Our Mission & Story</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Democratizing Access to{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              High-Value Assets
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            RentHub is Bangladesh&apos;s premier peer-to-peer rental marketplace. We believe in access over ownership — empowering creators, entrepreneurs, travelers, and families to experience luxury cars, professional cinema gear, laptops, and vacation stays without the burden of buying.
          </p>
        </div>
      </section>

      {/* ── Verified Stats Grid ── */}
      <section className="py-12 border-y border-white/10 bg-[#0a0a14]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { val: "28,000+", label: "Verified Members", sub: "Across Dhaka & Bangladesh" },
              { val: "৳18.5M+", label: "Rented Volume", sub: "Earned by everyday owners" },
              { val: "99.8%", label: "Safe Return Rate", sub: "100% Escrow deposit protected" },
              { val: "12,450+", label: "Active Listings", sub: "Vehicles, Tech, Stays & Gear" },
            ].map((st) => (
              <div key={st.label} className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 mb-1">
                  {st.val}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mb-0.5">{st.label}</div>
                <div className="text-[11px] text-slate-400">{st.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The RentHub Story ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Why RentHub Was Born</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              High-value assets shouldn&apos;t sit idle while people need them.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every day across Bangladesh, millions of dollars worth of premium equipment — flagship cameras, executive cars, 4K drones, high-end workstations, and vacation homes — sit unused in garages and closets.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Meanwhile, filmmakers, developers, wedding photographers, students, and travelers spend countless days trying to afford gear or renting through informal, insecure offline middlemen with zero contract safety.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              RentHub solves this with a transparent, digital-first marketplace backed by biometric NID AI verification, 360° photo inspection condition logs, and 100% escrow security deposit protection.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="font-bold text-base text-white">Our Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To build South Asia&apos;s most reliable, trusted peer-to-peer asset network powered by circular economy principles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-base text-white">Trust Protocol</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero anonymous users. AI face match, government NID verification, and legally-binding digital agreements on every rental.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-base text-white">Owner Prosperity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Helping everyday individuals monetize underutilized vehicles, cameras, and gear into steady monthly passive income.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <h3 className="font-bold text-base text-white">Circular Impact</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Decreasing unnecessary consumer manufacturing waste by maximizing the lifecycle of high-grade equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0a0a14]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Our Core Values</h2>
            <p className="text-xs sm:text-sm text-slate-400">The foundational pillars guiding every transaction on RentHub.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Safety & Trust First",
                desc: "We never compromise on user safety. Automated biometric NID checks, bank escrow deposit custody, and encrypted contracts safeguard both parties.",
              },
              {
                title: "2. Absolute Transparency",
                desc: "No hidden charges or surprise deductions. What you see is what you pay, with real time-stamped 360° photo logs to eliminate disputes.",
              },
              {
                title: "3. Community Empowerment",
                desc: "We take the lowest 5% fee in the market so that asset owners retain maximum earnings and renters enjoy competitive daily rates.",
              },
            ].map((v) => (
              <div key={v.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h3 className="font-bold text-base text-indigo-300">{v.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Ready to join Bangladesh&apos;s largest sharing economy?
        </h2>
        <p className="text-slate-300 text-sm max-w-lg mx-auto mb-8">
          Start exploring verified listings or list your car, camera, or laptop to earn up to ৳80,000/month today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/categories"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-103"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/products/new"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center gap-2 transition-all hover:scale-103"
          >
            <span>Become a Lister</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
