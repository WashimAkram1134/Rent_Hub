"use client";

import React from "react";
import Link from "next/link";
import { Wallet, ArrowUpRight, CheckCircle2, Building, Clock, ChevronRight } from "lucide-react";

interface OwnerPayoutCardProps {
  pendingAmount?: number;
  paidAmount?: number;
}

export function OwnerPayoutCard({
  pendingAmount = 22050,
  paidAmount = 34650,
}: OwnerPayoutCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payout Balance</h3>
            <p className="text-[10px] text-slate-400 font-medium">Auto-settled bi-weekly</p>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
          Ready
        </span>
      </div>

      {/* Balance Amount Display */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-1 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Available Settlement</p>
        <h2 className="text-2xl font-black text-white">৳ {Number(pendingAmount).toLocaleString()}</h2>
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-300">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-amber-400" />
            Next Cycle: Friday
          </span>
          <span className="text-emerald-400 font-bold">100% Guaranteed</span>
        </div>
      </div>

      {/* Connected Account & Fast CTA */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <Building size={14} className="text-slate-500" />
            <div>
              <p className="font-bold text-slate-800 text-[11px]">BRAC Bank (EFTN)</p>
              <p className="text-[10px] font-mono text-slate-400">A/C: 150120••••001</p>
            </div>
          </div>
          <CheckCircle2 size={14} className="text-emerald-500" />
        </div>

        <Link
          href="/payouts"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
        >
          <span>Withdraw & Payout History</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
