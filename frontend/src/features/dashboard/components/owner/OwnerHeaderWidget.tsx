"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ShieldCheck,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  Clock,
  Star,
  MapPin,
  CheckCircle2,
  Share2,
  ExternalLink,
  Store,
  Calendar,
  Zap,
} from "lucide-react";

interface OwnerHeaderProps {
  user: any;
  pendingRequestsCount?: number;
  activeRentalsCount?: number;
}

export function OwnerHeaderWidget({
  user,
  pendingRequestsCount = 0,
  activeRentalsCount = 0,
}: OwnerHeaderProps) {
  const [copied, setCopied] = useState(false);

  // Time-aware greeting
  const hour = new Date().getHours();
  let greetingTime = "Good morning";
  let TimeIcon = Sun;
  let timeIconColor = "text-amber-500";

  if (hour >= 12 && hour < 17) {
    greetingTime = "Good afternoon";
    TimeIcon = Sunset;
    timeIconColor = "text-orange-500";
  } else if (hour >= 17 || hour < 5) {
    greetingTime = "Good evening";
    TimeIcon = Moon;
    timeIconColor = "text-indigo-400";
  }

  const firstName = user?.first_name || "Host";
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Verified Host";
  const avatarUrl = user?.avatar_url;

  const handleCopyStoreLink = () => {
    navigator.clipboard?.writeText(`https://renthub.com.bd/@${user?.email?.split("@")[0] || "host"}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-white p-6 border border-indigo-100/80 shadow-sm overflow-hidden mb-6">
      {/* Subtle Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Avatar, Greeting & Host Details */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-indigo-700 font-sans">
                    {firstName.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {/* Live Online Beacon */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Greeting & Badges */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{greetingTime}, {firstName}!</span>
                <span className="inline-block hover:rotate-12 transition-transform origin-bottom-right cursor-default text-2xl sm:text-3xl">
                  👋
                </span>
              </h1>

              {/* Host Status Badges */}
              <div className="flex items-center gap-1.5">
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xs uppercase">
                  <Crown size={11} className="text-amber-300 fill-amber-300" />
                  SuperHost
                </span>

                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  NID Verified
                </span>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
              <span>Here's your rental business overview. You have</span>
              <Link
                href="/owner/bookings?status=pending"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
              >
                <Clock size={12} className="text-indigo-600" />
                <span>{pendingRequestsCount} pending requests</span>
              </Link>
              <span>waiting for review.</span>
            </p>

            {/* Micro Live Metrics Strip */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                4.9 Host Rating <span className="text-slate-400 font-normal">(24 Reviews)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Zap size={12} className="text-amber-500" />
                &lt; 15 min avg. response
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <MapPin size={12} className="text-indigo-500" />
                Gulshan-2, Dhaka
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Copy Storefront Link Button */}
          <button
            onClick={handleCopyStoreLink}
            title="Share Public Storefront Link"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} className="text-slate-500" />
                <span>Share Store</span>
              </>
            )}
          </button>

          {/* Calendar Shortcut */}
          <Link
            href="/calendar"
            title="View Schedule Calendar"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center shadow-xs transition-all hover:text-indigo-600 active:scale-95"
          >
            <Calendar size={16} />
          </Link>

          {/* View Listings */}
          <Link
            href="/listings"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:text-indigo-600 active:scale-95"
          >
            <Store size={14} />
            <span>My Listings</span>
          </Link>

          {/* Add New Listing CTA */}
          <Link
            href="/products/new"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Listing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
