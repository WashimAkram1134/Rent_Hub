"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Globe, Home, ChevronDown } from "lucide-react";

const NAV_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Browse Categories", href: "/categories" },
      { label: "Popular Listings", href: "/products" },
      { label: "Deals & Offers", href: "/offers" },
      { label: "Become a Lister", href: "/become-lister" },
    ],
  },
  {
    title: "For Users",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "My Bookings", href: "/bookings" },
      { label: "Safety & Trust", href: "/support" },
      { label: "Help Center", href: "/support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About RentHub", href: "/about" },
      { label: "Contact Us", href: "/support" },
      { label: "Careers", href: "/support" },
      { label: "Blog & News", href: "/support" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/support" },
      { label: "Report an Issue", href: "/support" },
      { label: "Dispute Resolution", href: "/support" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook", hoverBg: "hover:bg-blue-600/20 hover:border-blue-500/40" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", hoverBg: "hover:bg-pink-600/20 hover:border-pink-500/40" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", hoverBg: "hover:bg-blue-500/20 hover:border-blue-400/40" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube", hoverBg: "hover:bg-red-600/20 hover:border-red-500/40" },
];

export default function Footer() {
  const [lang, setLang] = useState<"en" | "bn">("en");

  return (
    <footer className="bg-[#0A0F1E] text-slate-400 border-t border-slate-800/60">

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-6">

          {/* Brand column (wider) */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Home size={17} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Rent<span className="text-blue-400">Hub</span>
              </span>
            </Link>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Rent Anything, Anytime.</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
                Bangladesh&apos;s trusted peer-to-peer rental marketplace for vehicles, electronics, apartments, furniture, cameras and more.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, hoverBg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all ${hoverBg}`}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-4">
              {/* Column heading with blue underline accent */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{col.title}</h4>
                <div className="w-8 h-[2px] bg-blue-500 rounded-full" />
              </div>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-slate-500">
            © 2025 RentHub. All rights reserved.
          </p>

          {/* Language switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Globe size={13} className="text-slate-400" />
            {lang === "en" ? "English" : "বাংলা"}
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
