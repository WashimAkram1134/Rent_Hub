"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  FileText,
  Scale,
  Banknote,
  UserPlus,
  ArrowRight
} from "lucide-react";

interface AttentionStats {
  pending_listings?: number;
  open_disputes?: number;
  pending_payouts?: number;
  failed_payouts?: number;
  pending_listers?: number;
}

export function AdminTodaysAttentionWidget({ stats }: { stats: AttentionStats }) {
  const pendingListings = stats.pending_listings ?? 0;
  const openDisputes = stats.open_disputes ?? 0;
  const payoutIssues = (stats.failed_payouts ?? 0) + (stats.pending_payouts ?? 0);
  const pendingListers = stats.pending_listers ?? 0;

  const totalUrgent = pendingListings + openDisputes + payoutIssues + pendingListers;

  const attentionItems = [
    {
      id: "listings",
      count: pendingListings,
      title: "Listing Approvals",
      subtitle: "New listings waiting for review",
      linkText: "View Listings",
      href: "/admin/listings",
      icon: FileText,
      iconBg: "bg-[#FFEBF0] dark:bg-rose-950/50",
      iconColor: "text-[#F43F5E]",
      numColor: "text-[#F43F5E]",
      linkColor: "text-[#F43F5E] hover:text-[#E11D48]",
    },
    {
      id: "disputes",
      count: openDisputes,
      title: "Disputes",
      subtitle: "Need your attention",
      linkText: "View Disputes",
      href: "/admin/disputes",
      icon: Scale,
      iconBg: "bg-[#FFF6E5] dark:bg-amber-950/50",
      iconColor: "text-[#F59E0B]",
      numColor: "text-[#F59E0B]",
      linkColor: "text-[#F59E0B] hover:text-[#D97706]",
    },
    {
      id: "payouts",
      count: payoutIssues,
      title: "Payout Issues",
      subtitle: "Failed or pending payouts",
      linkText: "View Payouts",
      href: "/admin/payouts",
      icon: Banknote,
      iconBg: "bg-[#E8FAF0] dark:bg-emerald-950/50",
      iconColor: "text-[#10B981]",
      numColor: "text-[#10B981]",
      linkColor: "text-[#10B981] hover:text-[#059669]",
    },
    {
      id: "owners",
      count: pendingListers,
      title: "Owner Applications",
      subtitle: "New owner registrations",
      linkText: "View Applications",
      href: "/admin/listers",
      icon: UserPlus,
      iconBg: "bg-[#EEF2FF] dark:bg-indigo-950/50",
      iconColor: "text-[#6366F1]",
      numColor: "text-[#6366F1]",
      linkColor: "text-[#6366F1] hover:text-[#4F46E5]",
    },
  ];

  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#FFF9F9] dark:bg-[#171014] border border-[#FEE2E2] dark:border-rose-950/60 shadow-xs">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Left Attention Header */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] dark:bg-rose-950/60 text-[#F43F5E] flex items-center justify-center shrink-0 shadow-xs">
            <Bell size={22} className="fill-[#F43F5E]/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Today&apos;s Attention
              </h2>
              <span className="bg-[#EF4444] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {totalUrgent} pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-priority tasks that need your attention.
            </p>
          </div>
        </div>

        {/* Middle/Right Items & View All */}
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#121622] rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-start gap-3 group"
              >
                {/* Item Icon */}
                <div
                  className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}
                >
                  <item.icon size={18} strokeWidth={2.2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className={`text-xl font-black ${item.numColor} leading-none block`}>
                    {item.count}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${item.linkColor} mt-2 transition-colors`}
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="self-end md:self-center shrink-0">
            <Link
              href="/admin/listings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121622] hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-xs font-bold shadow-xs transition-all"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
