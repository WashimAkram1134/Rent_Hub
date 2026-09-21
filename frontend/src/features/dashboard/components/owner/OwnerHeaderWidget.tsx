"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  ShieldCheck,
  Crown,
  Sun,
  Moon,
  Sunset,
  Star,
  MapPin,
  Zap,
} from "lucide-react";

interface OwnerHeaderProps {
  user: any;
  pendingRequestsCount?: number;
  activeRentalsCount?: number;
}

export function OwnerHeaderWidget({
  user,
}: OwnerHeaderProps) {
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

  const firstName = user?.first_name || (user?.full_name ? user.full_name.split(" ")[0] : "Host");
  const fullName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Verified Host");
  const avatarUrl = user?.avatar_url;
  const location = user?.address || "Dhaka, Bangladesh";

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-white via-indigo-50/30 to-white dark:from-[#131929] dark:via-[#161f36] dark:to-[#131929] p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden mb-6 transition-colors">
      {/* Hero Background Image — low opacity if uploaded */}
      {user?.cover_image_url && (
        <img
          src={user.cover_image_url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.08] dark:opacity-[0.05] pointer-events-none select-none"
        />
      )}

      {/* Subtle Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Avatar, Greeting & Host Details */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-sans">
                    {firstName.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {/* Live Online Beacon */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          {/* Greeting & Badges */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>
                  {greetingTime}, {firstName}!
                </span>
              </h1>

              {/* Host Status Badges */}
              <div className="flex items-center gap-1.5">
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xs uppercase">
                  <Crown size={11} className="text-amber-300 fill-amber-300" />
                  SuperHost
                </span>

                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                  NID Verified
                </span>
              </div>
            </div>

            {/* Clean Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Here&apos;s your rental business overview and real-time operations summary.
            </p>

            {/* Micro Metrics Strip */}
            <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                4.9 Host Rating <span className="text-slate-400 font-normal">(24 Reviews)</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                <Zap size={12} className="text-amber-500" />
                &lt; 15 min avg. response
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                <MapPin size={12} className="text-indigo-500" />
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Primary CTA */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <Link
            href="/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Listing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
