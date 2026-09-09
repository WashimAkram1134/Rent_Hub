"use client";

import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { FileText, ArrowLeft, ShieldCheck, AlertCircle, Scale } from "lucide-react";

export default function TermsOfServicePage() {
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
            <Scale size={14} />
            <span>Marketplace Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: March 1, 2026 • Legally binding for all members of RentHub
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering an account, or creating bookings on RentHub (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service and all incorporated policies (including our Privacy Policy and Community Guidelines). If you do not agree with any provision, you must not use this Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">2.</span> User Eligibility & Mandatory NID Verification
            </h2>
            <p>
              To maintain the highest level of community security and trust:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300/90">
              <li>Users must be at least 18 years of age and legally competent to enter into contracts under Bangladeshi law.</li>
              <li>Before taking physical possession of any vehicle, camera, drone, or high-value electronics, renters must successfully pass automated National Identity Card (NID) and facial biometric verification.</li>
              <li>Providing forged, misleading, or borrowed identification documents constitutes criminal fraud and will result in immediate permanent account termination and referral to law enforcement.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">3.</span> Asset Owner (Lister) Responsibilities
            </h2>
            <p>Owners who list items on the Platform warrant that:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300/90">
              <li>They hold legal ownership or explicit authorization to rent out the item.</li>
              <li>The item is clean, roadworthy/operable, safe, and accurately depicted by real photos.</li>
              <li>Vehicle listers must possess valid registration, fitness certificate, and tax token.</li>
              <li>They will honor confirmed bookings and not cancel without urgent extenuating circumstances.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">4.</span> Renter (Borrower) Obligations & Escrow Deposits
            </h2>
            <p>
              Renters agree to exercise reasonable care when handling rented property:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300/90">
              <li>A refundable security deposit is required and held securely in platform escrow during the active rental term.</li>
              <li>Both parties must complete the dual-inspection photo checklist at handover.</li>
              <li>The item must be returned on or before the agreed date and time in identical cosmetic and working condition (fair wear and tear excepted).</li>
              <li>Sub-leasing, unauthorized third-party driving, or using items for illegal activities is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">5.</span> Damage, Late Returns & Dispute Resolution
            </h2>
            <p>
              In the event of damage, missing accessories, or delayed returns:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300/90">
              <li>The pre-rental 360° photo log serves as conclusive visual evidence of condition before hand-off.</li>
              <li>Owners must file damage or late claims within 48 hours of item return.</li>
              <li>Verified damages are deducted directly from the renter&apos;s escrow security deposit. If repair costs exceed the deposit, the renter remains legally liable for the outstanding balance.</li>
              <li>RentHub&apos;s dispute mediation team issues binding determinations based on photo timestamps and digital agreements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">6.</span> Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Bangladesh. Any dispute arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts of Dhaka, Bangladesh.
            </p>
          </section>

          <section className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mt-8">
            <h3 className="font-bold text-white">Need clarification on rental terms?</h3>
            <p className="text-xs text-slate-400">
              Contact our concierge team at <span className="text-indigo-300 font-semibold">support@renthub.com.bd</span> or visit our <Link href="/support" className="text-indigo-400 hover:underline">Support Portal</Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
