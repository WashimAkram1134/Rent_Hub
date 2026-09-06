"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Receipt,
  Wallet,
} from "lucide-react";
import apiClient from "@/lib/axios";

export default function OwnerEarningsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const [statsRes, payoutsRes] = await Promise.all([
          apiClient.get("/analytics/owner-stats", { params: { owner_id: user?.id } }).then((r) => r.data).catch(() => null),
          apiClient.get("/payouts", { params: { owner_id: user?.id } }).then((r) => r.data).catch(() => []),
        ]);
        setStats(statsRes);
        setPayouts(Array.isArray(payoutsRes) ? payoutsRes : (payoutsRes?.payouts || []));
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, [user?.id]);

  const netEarnings = stats?.monthly_earnings ?? 0;
  const grossEarnings = netEarnings > 0 ? netEarnings / 0.9 : 0;
  const platformFee = grossEarnings - netEarnings;
  const pendingSettlement = stats?.pending_settlement ?? 0;

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Financial Statements</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                10% Standard Host Fee
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              View your gross rental revenue, platform service deductions, and automated payout disbursals
            </p>
          </div>

          <Link
            href="/payouts"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Wallet size={15} />
            <span>Manage Payouts</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Net Earnings</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">৳ {Number(netEarnings).toLocaleString()}</h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Disbursed & Pending</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Gross Booking Volume</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">৳ {Math.round(grossEarnings).toLocaleString()}</h3>
              <p className="text-blue-600 text-[11px] font-semibold mt-0.5">Customer payments</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Receipt size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Platform Fee (10%)</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">৳ {Math.round(platformFee).toLocaleString()}</h3>
              <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Insurance & Support</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Pending Settlement</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">৳ {Number(pendingSettlement).toLocaleString()}</h3>
              <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Next cycle disbursal</p>
            </div>
          </div>
        </div>

        {/* Payouts Disbursals Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Disbursal & Settlement History</h3>
            <span className="text-xs text-slate-400 font-mono">Automated bi-weekly cycle</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Payout ID</th>
                  <th className="py-3 px-3">Period</th>
                  <th className="py-3 px-3">Gross Amount</th>
                  <th className="py-3 px-3">Fee (10%)</th>
                  <th className="py-3 px-3">Net Disbursed</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      No payout records found yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p: any) => (
                    <tr key={p.id || p.payout_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{p.payout_id || "PO-2041"}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{p.earnings_period}</td>
                      <td className="py-3.5 px-3">৳ {Number(p.gross_amount).toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-slate-400">-৳ {Number(p.commission_amount || p.gross_amount * 0.1).toLocaleString()}</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600">৳ {Number(p.net_amount).toLocaleString()}</td>
                      <td className="py-3.5 px-3 capitalize text-slate-600">
                        {p.payout_method === "bank_transfer" ? "BRAC Bank (EFTN)" : "bKash Merchant"}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <CheckCircle2 size={11} /> {p.status === "paid" ? "Disbursed" : "Pending Cycle"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
