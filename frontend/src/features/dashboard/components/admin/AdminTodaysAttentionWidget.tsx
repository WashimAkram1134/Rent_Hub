"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Scale,
  DollarSign,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface AttentionStats {
  pending_listings?: number;
  open_disputes?: number;
  pending_payouts?: number;
  failed_payouts?: number;
  pending_listers?: number;
}

export function AdminTodaysAttentionWidget({ stats }: { stats: AttentionStats }) {
  const pendingListings = stats.pending_listings || 0;
  const openDisputes = stats.open_disputes || 0;
  const payoutIssues = (stats.failed_payouts || 0) + (stats.pending_payouts || 0);
  const pendingListers = stats.pending_listers || 0;

  const totalUrgent = pendingListings + openDisputes + payoutIssues + pendingListers;

  if (totalUrgent === 0) {
    return (
      <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              All Operational Queues Clear <Sparkles size={14} className="text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              No pending listings, disputes, or payout blocks requiring immediate attention.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
          Platform Optimal
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#121727] via-[#0f1422] to-[#0a0e1a] border border-slate-800/90 shadow-md space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              Today's Attention Required
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {totalUrgent} items
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              High-priority operations that directly affect customer and host satisfaction.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Pending Listings */}
        <Link
          href="/admin/listings"
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
            pendingListings > 0
              ? "bg-amber-950/20 border-amber-800/50 hover:bg-amber-950/30 hover:border-amber-700"
              : "bg-slate-900/40 border-slate-800/60 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Package size={13} /> Listings Approval
            </span>
            <span className={`text-base font-black ${pendingListings > 0 ? "text-amber-300" : "text-slate-500"}`}>
              {pendingListings}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {pendingListings > 0 ? `${pendingListings} awaiting review` : "All approved"}
            </span>
            <ArrowRight size={13} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 2. Open Disputes */}
        <Link
          href="/admin/disputes"
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
            openDisputes > 0
              ? "bg-rose-950/20 border-rose-800/50 hover:bg-rose-950/30 hover:border-rose-700"
              : "bg-slate-900/40 border-slate-800/60 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Scale size={13} /> Open Disputes
            </span>
            <span className={`text-base font-black ${openDisputes > 0 ? "text-rose-300" : "text-slate-500"}`}>
              {openDisputes}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {openDisputes > 0 ? `${openDisputes} need resolution` : "No disputes"}
            </span>
            <ArrowRight size={13} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 3. Payout Approvals */}
        <Link
          href="/admin/payouts"
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
            payoutIssues > 0
              ? "bg-emerald-950/20 border-emerald-800/50 hover:bg-emerald-950/30 hover:border-emerald-700"
              : "bg-slate-900/40 border-slate-800/60 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <DollarSign size={13} /> Payout Disbursals
            </span>
            <span className={`text-base font-black ${payoutIssues > 0 ? "text-emerald-300" : "text-slate-500"}`}>
              {payoutIssues}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {payoutIssues > 0 ? `${payoutIssues} ready for release` : "All paid out"}
            </span>
            <ArrowRight size={13} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* 4. Owner Applications */}
        <Link
          href="/admin/listers"
          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
            pendingListers > 0
              ? "bg-blue-950/20 border-blue-800/50 hover:bg-blue-950/30 hover:border-blue-700"
              : "bg-slate-900/40 border-slate-800/60 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <UserCheck size={13} /> Owner Applications
            </span>
            <span className={`text-base font-black ${pendingListers > 0 ? "text-blue-300" : "text-slate-500"}`}>
              {pendingListers}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {pendingListers > 0 ? `${pendingListers} waiting review` : "All reviewed"}
            </span>
            <ArrowRight size={13} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
