"use client";

import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={14} />
            <span>Legal & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: March 1, 2026 • Effective for all RentHub users in Bangladesh
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">1.</span> Introduction
            </h2>
            <p>
              Welcome to RentHub (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate Bangladesh&apos;s leading peer-to-peer rental marketplace connecting verified asset owners with verified renters. We are committed to protecting the privacy, confidentiality, and security of our community members&apos; personal data in compliance with the laws of the People&apos;s Republic of Bangladesh.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">2.</span> Information We Collect
            </h2>
            <p>To ensure safe peer-to-peer transactions and prevent fraud, we collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300/90">
              <li>
                <strong className="text-white">Account Information:</strong> Full name, verified mobile phone number, email address, physical address, and profile photo.
              </li>
              <li>
                <strong className="text-white">Government Identity Verification:</strong> Scanned copies of Bangladeshi National Identity Card (NID), Smart NID, or Passport, along with 3D facial biometric selfie captures for automated verification.
              </li>
              <li>
                <strong className="text-white">Financial & Payment Data:</strong> Bank account details (account name, account number, routing number), bKash/Nagad wallet numbers for payout distribution and escrow security deposit management. We do not store raw credit card numbers.
              </li>
              <li>
                <strong className="text-white">Item Condition Photos:</strong> Time-stamped, geotagged 360° and multi-angle photos uploaded during pre-rental inspection and return hand-off.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">3.</span> How We Use Your Information
            </h2>
            <p>We use your personal data strictly for operational, trust, and legal purposes:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300/90">
              <li>Verifying identity and preventing unauthorized or fraudulent account creation.</li>
              <li>Holding and refunding escrow deposits and executing automated payouts.</li>
              <li>Generating digital, legally-binding rental agreements between owners and renters.</li>
              <li>Auditing item condition logs to resolve any disputes or damage claims fairly.</li>
              <li>Sending transactional SMS and push notifications regarding booking statuses.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">4.</span> Escrow Data & Security Standards
            </h2>
            <p>
              All sensitive financial and identity records are encrypted in transit and at rest using bank-grade AES-256 encryption. Biometric verification vectors are processed in an isolated sandbox and are never sold or shared with commercial marketing third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">5.</span> Sharing of Information
            </h2>
            <p>
              We only share necessary contact details (such as verified first name, phone number, and pickup location) between the confirmed owner and renter strictly after a booking request has been approved and deposit funded in escrow. We never sell your personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">6.</span> Your Rights & Data Retention
            </h2>
            <p>
              You have the right to inspect, update, or request deletion of your account personal information at any time, subject to completing any active rentals and financial settlements. Contact our Data Privacy Officer at <span className="text-indigo-300 font-semibold">support@renthub.com.bd</span> for assistance.
            </p>
          </section>

          <section className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mt-8">
            <h3 className="font-bold text-white">Questions about our privacy protocol?</h3>
            <p className="text-xs text-slate-400">
              Our legal and compliance team in Dhaka is available 24/7. Reach us at <span className="text-indigo-300 font-semibold">support@renthub.com.bd</span> or via our <Link href="/support" className="text-indigo-400 hover:underline">Help & Support Center</Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
