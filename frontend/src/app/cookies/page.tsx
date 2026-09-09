"use client";

import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Cookie, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Cookie size={14} />
            <span>Transparency & Control</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: March 1, 2026 • RentHub Cookie & Session Protocol
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">1.</span> What Are Cookies?
            </h2>
            <p>
              Cookies are small data text files saved to your computer or mobile device when you browse websites. They are widely used to make web applications run efficiently, maintain persistent authentication sessions, and remember user preferences like selected city and search filters.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">2.</span> How RentHub Uses Cookies
            </h2>
            <p>We only use cookies to enhance your experience and secure your account:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Strictly Essential Cookies</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Required for logging in, maintaining secure encrypted sessions, role switching (Owner/Customer mode), and handling cart checkouts. These cannot be turned off.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 size={15} className="text-indigo-400" />
                  <span>Preference Cookies</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Remember your preferred city (Dhaka, Chattogram, Sylhet) and custom catalog sorting so you don&apos;t have to reset them each visit.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 size={15} className="text-cyan-400" />
                  <span>Performance & Diagnostics</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Help us monitor API latency, load times, and error spikes so our Dhaka engineering team can keep the 360° visual viewer running at 60fps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 size={15} className="text-purple-400" />
                  <span>Zero Third-Party Ad Trackers</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  RentHub does not sell advertising or share cross-site tracking cookies with third-party ad brokers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">3.</span> How to Manage or Disable Cookies
            </h2>
            <p>
              You can control or delete cookies through your web browser settings (Chrome, Safari, Firefox, Edge). Please note that disabling essential authentication cookies will prevent you from signing in and managing bookings on RentHub.
            </p>
          </section>

          <section className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mt-8">
            <h3 className="font-bold text-white">Have questions about cookies?</h3>
            <p className="text-xs text-slate-400">
              Reach out to our security team anytime at <span className="text-indigo-300 font-semibold">support@renthub.com.bd</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
