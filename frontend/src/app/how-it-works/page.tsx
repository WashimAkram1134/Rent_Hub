"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShieldCheck, Lock, Truck, RotateCcw,
  CheckCircle2, ArrowRight, Sparkles, Zap, Star,
  HelpCircle, ChevronDown, DollarSign, UploadCloud,
  FileCheck, Smartphone
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"renter" | "owner">("renter");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const renterSteps = [
    {
      step: "01",
      title: "Discover & Inspect in 360°",
      subtitle: "Filter by location, price, and real condition photos",
      description:
        "Browse thousands of verified items across Dhaka, Chattogram, Sylhet and more. Use our interactive 360° angle scanner to inspect cars, cameras, and equipment from every angle before booking.",
      icon: Search,
      badge: "360° Angle Views",
      highlight: "✨ Time-stamped condition inspection photos verified by AI",
    },
    {
      step: "02",
      title: "Secure Escrow Booking",
      subtitle: "100% deposit protection guarantee",
      description:
        "Choose your dates, choose doorstep delivery or self-pickup, and confirm. Your rental payment and security deposit are securely locked in platform escrow until you receive and approve the item.",
      icon: Lock,
      badge: "100% Money-Back Escrow",
      highlight: "🔒 Funds never released to the owner until hand-off succeeds",
    },
    {
      step: "03",
      title: "Doorstep Delivery & Instant Refund",
      subtitle: "Enjoy your rental, return & get deposit back instantly",
      description:
        "Receive the item with a verified pre-handover photo checklist. Enjoy your shoot, trip, or project. Upon return, the owner confirms condition and your deposit is refunded automatically.",
      icon: Truck,
      badge: "Instant Automated Refund",
      highlight: "⚡ Deposit refunded directly to your bKash, Nagad or Card",
    },
  ];

  const ownerSteps = [
    {
      step: "01",
      title: "List Your Item in 2 Minutes",
      subtitle: "Free listing with smart daily pricing recommendations",
      description:
        "Snap photos (Front, Back, Inside, Outside), set your daily rate and security deposit, and publish. Our AI assists with optimal pricing based on active Dhaka demand.",
      icon: UploadCloud,
      badge: "Zero Listing Fees",
      highlight: "📈 Earn up to ৳80,000/month on items sitting idle",
    },
    {
      step: "02",
      title: "Automated Biometric & NID Verification",
      subtitle: "Every borrower is thoroughly vetted before hand-off",
      description:
        "Zero anonymous users. Every customer undergoes government National ID (NID) check and facial biometric selfie matching before they can confirm a booking with you.",
      icon: ShieldCheck,
      badge: "100% NID Verified",
      highlight: "🛡️ Digital legally-binding rental agreements generated automatically",
    },
    {
      step: "03",
      title: "Guaranteed Payouts & Host Protection",
      subtitle: "Direct bank or bKash transfers with ৳500,000 damage cover",
      description:
        "Receive payout automatically as soon as the rental commences. In the rare event of accidental damage or delay, our escrow deposit coverage and ৳500,000 Host Guarantee protect you completely.",
      icon: DollarSign,
      badge: "Host Guarantee ৳500K",
      highlight: "⚡ Lowest 5% platform fee with same-day payout disbursement",
    },
  ];

  const faqs = [
    {
      q: "How does RentHub protect my security deposit?",
      a: "All deposits are held in a bank-grade escrow account. The owner cannot withdraw your deposit. When you return the item in good condition, the escrow system automatically unlocks and returns your deposit within minutes.",
    },
    {
      q: "What is required for identity verification?",
      a: "Borrowers and owners upload their official Bangladeshi National ID (NID) or Passport, along with a live 3D selfie. Our AI biometric system verifies authenticity within 60 seconds to eliminate fraud.",
    },
    {
      q: "Can I inspect the item before taking possession?",
      a: "Yes! RentHub requires a dual-confirmation photo checklist at the moment of hand-off. Both the renter and owner confirm any existing cosmetic marks so there are zero surprises or disputes upon return.",
    },
    {
      q: "How do payouts work for asset owners?",
      a: "When a renter receives your item, earnings are immediately credited to your RentHub wallet. You can withdraw funds instantly to bKash, Nagad, Rocket, or any Bangladeshi bank account.",
    },
    {
      q: "What if an item is returned damaged?",
      a: "The pre-rental 360° photos serve as legal audit logs. Any damage is deducted directly from the escrow security deposit. For high-value assets, our ৳500,000 Host Damage Protection covers additional repairs.",
    },
  ];

  const currentSteps = activeTab === "renter" ? renterSteps : ownerSteps;

  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col font-sans">
      <Navbar />

      {/* ── Top Hero Header ── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-20 blur-[130px]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, #ec4899 50%, transparent 75%)" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} />
            <span>Simple, Transparent & Secure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            How RentHub Works in{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you are renting a luxury 360° car for a weekend trip, borrowing a 4K cinema camera, or earning passive income on your idle assets.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-xl shadow-xl">
            <button
              onClick={() => setActiveTab("renter")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "renter"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              For Renters (Borrowers)
            </button>
            <button
              onClick={() => setActiveTab("owner")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "owner"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              For Asset Owners (Listers)
            </button>
          </div>
        </div>
      </section>

      {/* ── 3 Detailed Step Cards ── */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-3xl p-6 sm:p-8 bg-white/[0.04] border border-white/10 hover:border-white/20 backdrop-blur-xl flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-indigo-400/40 group-hover:text-indigo-400 transition-colors">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {s.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs font-semibold text-indigo-300 mb-3">{s.subtitle}</p>
                  <p className="text-xs text-slate-300/80 leading-relaxed mb-6">{s.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 text-xs text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{s.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Trust Bento Strip ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-[#0a0a14]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Built on Institutional Trust Protocols
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              RentHub is built from the ground up to make peer-to-peer asset sharing 100% safe and dispute-free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "NID Biometric AI",
                desc: "Every account is government NID and biometric facial match verified.",
              },
              {
                icon: Lock,
                title: "Escrow Deposit Shield",
                desc: "Money stays protected in escrow. Released only upon verified return.",
              },
              {
                icon: RotateCcw,
                title: "360° Photo Audit Log",
                desc: "Time-stamped photos recorded before and after hand-off prevent disputes.",
              },
              {
                icon: Zap,
                title: "Instant Automated Payouts",
                desc: "Earnings deposited straight to bKash or Bank automatically.",
              },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.title}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-400/30 transition-all"
                >
                  <Icon size={22} className="text-indigo-400 mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">{t.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Have questions about how RentHub works? We have answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-indigo-400" : "text-slate-400"}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300/80 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/categories"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-103"
          >
            <span>Explore 10,000+ Items</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/products/new"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center gap-2 transition-all hover:scale-103"
          >
            <span>List an Item to Earn</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
