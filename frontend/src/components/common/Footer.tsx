"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Flame,
  Tag,
  UserPlus,
  HelpCircle,
  Calendar,
  ShieldCheck,
  UserCheck,
  Star,
  Info,
  Phone,
  FileText,
  Briefcase,
  LifeBuoy,
  Flag,
  Scale,
  Shield,
  CreditCard,
  Headphones,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Hexagon,
  Home,
} from "lucide-react";

export default function Footer() {
  const [lang, setLang] = useState<"bn" | "en">("bn");

  return (
    <footer className="bg-[#070D1E] text-slate-400 font-sans border-t border-slate-800/80">
      {/* ── Main Top Section ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand & Trust Column (5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Home size={18} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rent<span className="text-blue-500">Hub</span>
              </span>
            </Link>

            {/* Tagline & Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Rent Anything, Anytime.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                RentHub is Bangladesh's trusted peer-to-peer rental marketplace. Find vehicles,
                electronics, apartments, furniture, cameras, and more — all in one place.
              </p>
            </div>

            {/* 3 Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mb-1.5">
                  <ShieldCheck size={14} />
                </div>
                <h4 className="text-[11px] font-bold text-white leading-tight">Safe & Secure</h4>
                <p className="text-[10px] text-slate-500 leading-tight">Verified users and listings</p>
              </div>

              <div className="space-y-1">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-1.5">
                  <Shield size={14} />
                </div>
                <h4 className="text-[11px] font-bold text-white leading-tight">Secure Payments</h4>
                <p className="text-[10px] text-slate-500 leading-tight">100% secure transactions</p>
              </div>

              <div className="space-y-1">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-1.5">
                  <Headphones size={14} />
                </div>
                <h4 className="text-[11px] font-bold text-white leading-tight">24/7 Support</h4>
                <p className="text-[10px] text-slate-500 leading-tight">We're here to help you</p>
              </div>
            </div>
          </div>

          {/* 4 Navigation Link Columns (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* 1. EXPLORE */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white tracking-wider uppercase">
                EXPLORE
              </h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link
                    href="/categories"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <LayoutGrid size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>Browse Categories</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Flame size={13} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span>Popular Listings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Tag size={13} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Deals & Offers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/become-lister"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <UserPlus size={13} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    <span>Become a Lister</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 2. FOR USERS */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white tracking-wider uppercase">
                FOR USERS
              </h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link
                    href="/how-it-works"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <HelpCircle size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Calendar size={13} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span>My Bookings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <ShieldCheck size={13} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Safety & Trust</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify-identity"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <UserCheck size={13} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span>Identity Verification</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reviews"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Star size={13} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span>Reviews & Ratings</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. COMPANY */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white tracking-wider uppercase">
                COMPANY
              </h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link
                    href="/about"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Info size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>About RentHub</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Phone size={13} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <FileText size={13} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span>Blog & News</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Briefcase size={13} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    <span>Careers</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. SUPPORT */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white tracking-wider uppercase">
                SUPPORT
              </h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <LifeBuoy size={13} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <HelpCircle size={13} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span>FAQs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Flag size={13} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                    <span>Report an Issue</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                  >
                    <Scale size={13} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    <span>Dispute Resolution</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Bar: Built for Bangladesh & Language & Socials ── */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Built for Bangladesh Badge */}
            <div className="flex items-center gap-3">
              {/* Bangladesh Flag SVG */}
              <div className="w-10 h-7 rounded-md bg-[#006A4E] relative overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-emerald-900/60">
                <div className="w-4 h-4 rounded-full bg-[#F42A41] -translate-x-0.5"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Built for Bangladesh</p>
                <p className="text-[11px] text-slate-400 leading-tight">Proudly supporting our community</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 text-xs">
              <Globe size={15} className="text-slate-400" />
              <button
                onClick={() => setLang("bn")}
                className={`font-semibold transition-colors cursor-pointer ${
                  lang === "bn" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                বাংলা
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setLang("en")}
                className={`font-semibold transition-colors cursor-pointer ${
                  lang === "en" ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                English
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-blue-600/30 border border-white/10 hover:border-blue-500/40 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Facebook size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-pink-600/30 border border-white/10 hover:border-pink-500/40 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-blue-500/30 border border-white/10 hover:border-blue-400/40 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-600/30 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar: Copyright & Legal ── */}
      <div className="border-t border-slate-800/60 bg-[#050914]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 RentHub. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-slate-300 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
