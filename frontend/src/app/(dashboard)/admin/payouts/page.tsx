"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  HelpCircle,
  X,
  Loader2,
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  RefreshCw,
  Printer,
  Receipt,
  User as UserIcon,
  Percent,
  Coins,
  Send,
  CheckCheck,
  XCircle,
  Ban,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface PayoutItem {
  id: string;
  payout_id: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  earnings_period: string;
  period_start?: string | null;
  period_end?: string | null;
  payout_method: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  routing_number?: string | null;
  status: string;
  disbursement_trx_id?: string | null;
  disbursed_at?: string | null;
  failure_reason?: string | null;
  notes?: string | null;
  created_at: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string | null;
    is_verified: boolean;
  };
}

interface OverviewSummary {
  total_pending_payouts: number;
  pending_count: number;
  pending_change: string;
  total_paid_to_owners: number;
  paid_count: number;
  paid_change: string;
  platform_commission: number;
  total_gross_volume: number;
  commission_rate: string;
  commission_change: string;
  failed_payouts: number;
  failed_count: number;
  failed_change: string;
}

export default function AdminPayoutsPage() {
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");

  // Modals
  const [approveModalItem, setApproveModalItem] = useState<PayoutItem | null>(null);
  const [disbursementTrxId, setDisbursementTrxId] = useState("");
  const [declineModalItem, setDeclineModalItem] = useState<PayoutItem | null>(null);
  const [declineReason, setDeclineReason] = useState("Bank account name or MFS number mismatch with KYC verification.");
  const [detailModalItem, setDetailModalItem] = useState<PayoutItem | null>(null);
  const [retryModalItem, setRetryModalItem] = useState<PayoutItem | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOverview = async () => {
    try {
      const res = await apiClient.get("/payouts/overview");
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load payout overview:", err);
    }
  };

  const fetchPayouts = async (page = 1) => {
    try {
      setTableLoading(true);
      const res = await apiClient.get("/payouts", {
        params: {
          status: activeTab !== "all" ? activeTab : undefined,
          method: selectedMethod !== "all" ? selectedMethod : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        },
      });
      setPayouts(res.data.items || []);
      setTotalPayouts(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
      setCurrentPage(res.data.page || 1);
    } catch (err) {
      console.error("Failed to load payouts:", err);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchPayouts(currentPage);
  }, [activeTab, selectedMethod, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayouts(1);
  };

  const handleExecuteApproval = async () => {
    if (!approveModalItem) return;
    try {
      setActionProcessing(true);
      const res = await apiClient.post(`/payouts/${approveModalItem.id}/approve`, {
        disbursement_trx_id: disbursementTrxId || undefined,
        notes: "Approved and released via RentHub Admin Payout Center",
      });
      showToast(res.data.message || "Payout approved and disbursed successfully!");
      setApproveModalItem(null);
      setDisbursementTrxId("");
      fetchPayouts(currentPage);
      fetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to approve payout");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExecuteDecline = async () => {
    if (!declineModalItem) return;
    try {
      setActionProcessing(true);
      const res = await apiClient.post(`/payouts/${declineModalItem.id}/reject`, {
        reason: declineReason || "Declined by platform finance administrator.",
        notes: "Declined via Admin Portal",
      });
      showToast(res.data.message || "Payout request has been declined.");
      setDeclineModalItem(null);
      fetchPayouts(currentPage);
      fetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to decline payout");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExecuteRetry = async () => {
    if (!retryModalItem) return;
    try {
      setActionProcessing(true);
      const res = await apiClient.post(`/payouts/${retryModalItem.id}/retry`);
      showToast(res.data.message || "Payout retried & successfully released!");
      setRetryModalItem(null);
      fetchPayouts(currentPage);
      fetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to retry payout");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (payouts.length === 0) return;
    const csvHeader = ["Payout ID", "Owner", "Phone", "Gross Earnings (BDT)", "Commission Fee (10%)", "Net Payout (BDT)", "Period", "Method", "Bank/MFS Account", "Status", "Disbursement Ref"];
    const csvRows = payouts.map((p) => [
      p.payout_id,
      p.owner.name,
      p.owner.phone,
      p.gross_amount,
      p.commission_amount,
      p.net_amount,
      p.earnings_period,
      p.payout_method.toUpperCase(),
      `"${p.bank_name} (${p.account_number})"`,
      p.status.toUpperCase(),
      p.disbursement_trx_id || "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentHub_Owner_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMethodBadge = (method: string, bankName: string, accountNum: string) => {
    const m = (method || "").toLowerCase();
    if (m.includes("bkash")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-[#e2136e]/10 text-[#e2136e] border border-[#e2136e]/20 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e2136e]"></span>
            bKash
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    if (m.includes("nagad")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-[#f7941d]/10 text-[#f7941d] border border-[#f7941d]/20 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7941d]"></span>
            Nagad
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    if (m.includes("rocket")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <Smartphone size={11} className="text-purple-600" />
            Rocket
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-bold w-fit">
          <Building size={11} className="text-blue-600" />
          Bank
        </span>
        <span className="text-[10px] text-slate-600 font-medium truncate max-w-[150px] mt-0.5">
          {bankName}
        </span>
        <span className="text-[9px] text-slate-400 font-mono">{accountNum}</span>
      </div>
    );
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
          <Check size={12} /> Paid
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
          <Clock size={12} /> Pending Approval
        </span>
      );
    }
    if (s === "processing") {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
          <RefreshCw size={12} className="animate-spin" /> Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
        <Ban size={12} /> Declined
      </span>
    );
  };

  if (loading && !summary) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Owner Payouts...</p>
      </div>
    );
  }

  const s = summary || {
    total_pending_payouts: 0,
    pending_count: 0,
    pending_change: "+0.0%",
    total_paid_to_owners: 0,
    paid_count: 0,
    paid_change: "+0.0%",
    platform_commission: 0,
    total_gross_volume: 0,
    commission_rate: "10.0%",
    commission_change: "+0.0%",
    failed_payouts: 0,
    failed_count: 0,
    failed_change: "-0.0%",
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* ── Toast Alert ──────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Payout Approvals & Disbursals</h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Coins size={12} className="text-blue-600" />
              10% Commission Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review host withdrawal requests, disburse payments via EFTN / MFS, and retain platform commissions
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export Payouts</span>
          </button>
        </div>
      </div>

      {/* ── Commission Inflow Explainer Banner ────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              Platform Cash Flow Architecture 💰
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Automated 10% Commission & Escrow Disbursal
            </h3>
          </div>

          {/* Visual Step-by-Step Flow */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center text-xs">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 rounded-xl text-center">
              <p className="text-[10px] text-slate-300">Customer Rental</p>
              <p className="font-extrabold text-white">৳ 5,000</p>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 rounded-xl text-center">
              <p className="text-[10px] text-slate-300">RentHub Escrow</p>
              <p className="font-extrabold text-emerald-400">Held Safe</p>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="bg-blue-600/30 border border-blue-400/40 px-3 py-1.5 rounded-xl text-center">
              <p className="text-[10px] text-blue-200 font-medium">10% Platform Fee</p>
              <p className="font-extrabold text-blue-300">৳ 500 Retained</p>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="bg-emerald-600/30 border border-emerald-400/40 px-3 py-1.5 rounded-xl text-center">
              <p className="text-[10px] text-emerald-200 font-medium">Owner Receives</p>
              <p className="font-extrabold text-emerald-300">৳ 4,500 Disbursed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Pending Requests</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(s.total_pending_payouts).toLocaleString()}
              </h3>
              <p className="text-amber-600 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>{s.pending_count} awaiting approval</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Paid to Owners */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Paid to Hosts</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(s.total_paid_to_owners).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>{s.paid_count} disbursed</span>
              </p>
            </div>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Percent size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Platform Commission (10%)</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(s.platform_commission).toLocaleString()}
              </h3>
              <p className="text-blue-600 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>৳ {Math.round((s.total_gross_volume || 0) / 1000)}k gross volume</span>
              </p>
            </div>
          </div>
        </div>

        {/* Failed Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Declined / Failed</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(s.failed_payouts).toLocaleString()}
              </h3>
              <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>{s.failed_count} declined requests</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Payouts Table ────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { key: "all", label: "All Payouts" },
            { key: "pending", label: "Pending Approval", count: s.pending_count },
            { key: "paid", label: "Paid / Disbursed", count: s.paid_count },
            { key: "failed", label: "Declined / Failed", count: s.failed_count },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`pb-2 transition-all whitespace-nowrap relative flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Host Name, Payout ID, Bank A/C, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Method Filter */}
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none shadow-2xs"
            >
              <option value="all">All Disbursal Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="bkash">bKash Payout</option>
              <option value="nagad">Nagad Direct</option>
              <option value="rocket">Rocket Wallet</option>
            </select>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="overflow-x-auto relative min-h-[320px]">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          )}

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-3">Owner / Host</th>
                <th className="py-3.5 px-3">Net Amount</th>
                <th className="py-3.5 px-3">Gross / Fee (10%)</th>
                <th className="py-3.5 px-3">Earnings Period</th>
                <th className="py-3.5 px-3">Method & Account</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No payout records found matching your filters.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const isPending = p.status === "pending" || p.status === "processing";
                  const isPaid = p.status === "paid";
                  const isFailed = p.status === "failed" || p.status === "rejected";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Owner */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                            {p.owner.avatar_url ? (
                              <img src={p.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              p.owner.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-xs">{p.owner.name}</p>
                              {p.owner.is_verified && (
                                <CheckCircle2 size={12} className="text-emerald-600" />
                              )}
                            </div>
                            <p className="text-slate-400 text-[10px]">{p.owner.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-black text-slate-900 text-sm text-emerald-600">
                            ৳ {p.net_amount.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Ref: {p.payout_id}
                          </p>
                        </div>
                      </td>

                      {/* Gross / Fee */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="text-xs font-semibold text-slate-800">
                            ৳ {p.gross_amount.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-blue-600 font-medium">
                            -৳ {p.commission_amount.toLocaleString()} ({p.commission_rate}%)
                          </p>
                        </div>
                      </td>

                      {/* Earnings Period */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-medium text-xs">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{p.earnings_period}</span>
                        </div>
                      </td>

                      {/* Method & Account */}
                      <td className="py-3.5 px-3">
                        {renderMethodBadge(p.payout_method, p.bank_name, p.account_number)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve & Decline Actions for Pending */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setApproveModalItem(p);
                                  const pfx = p.payout_method === "bank_transfer" ? "EFTN" : "MFS";
                                  setDisbursementTrxId(`DISB-${pfx}-${Math.floor(100000 + Math.random() * 900000)}`);
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <CheckCheck size={13} />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => setDeclineModalItem(p)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Ban size={12} />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {/* View Action */}
                          {isPaid && (
                            <button
                              onClick={() => setDetailModalItem(p)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Eye size={12} />
                              <span>Statement</span>
                            </button>
                          )}

                          {/* Retry Action */}
                          {isFailed && (
                            <button
                              onClick={() => setRetryModalItem(p)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <RefreshCw size={12} />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalPayouts)} of {totalPayouts} payouts
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: APPROVE PAYOUT ───────────────────────────────────────── */}
      {approveModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-600">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Approve & Release Payout</h3>
                  <p className="text-xs text-slate-400 font-normal">Disburse net earnings directly to host account</p>
                </div>
              </div>
              <button
                onClick={() => setApproveModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Payout Summary Box */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Beneficiary Host:</span>
                <span className="font-bold text-slate-900 text-sm">{approveModalItem.owner.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Earnings Period:</span>
                <span className="font-semibold text-slate-800">{approveModalItem.earnings_period}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Destination Account:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {approveModalItem.bank_name} ({approveModalItem.account_number})
                </span>
              </div>
              <div className="border-t border-emerald-200/60 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-700">Net Disbursement Amount:</span>
                <span className="text-lg font-black text-emerald-700">
                  ৳ {approveModalItem.net_amount.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Disbursement Reference Input */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Bank / Gateway Disbursement Reference</label>
              <input
                type="text"
                value={disbursementTrxId}
                onChange={(e) => setDisbursementTrxId(e.target.value)}
                placeholder="e.g. DISB-EFTN-894210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[11px] text-slate-400">
                This transaction ID will be stored in the host receipt and sent via notification.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteApproval}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Release Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DECLINE PAYOUT REQUEST ───────────────────────────────── */}
      {declineModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Ban size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Decline Payout Request</h3>
                  <p className="text-xs text-slate-400 font-normal">Reject withdrawal request and provide reason to host</p>
                </div>
              </div>
              <button
                onClick={() => setDeclineModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Host / Beneficiary:</span>
                <span className="font-bold text-slate-900 text-sm">{declineModalItem.owner.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Requested Amount:</span>
                <span className="font-black text-rose-700">৳ {declineModalItem.net_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Destination:</span>
                <span className="font-mono text-slate-800">{declineModalItem.bank_name} ({declineModalItem.account_number})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Decline Reason (Visible to Owner)</label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              >
                <option value="Bank account name or MFS number mismatch with KYC verification.">
                  Bank account name or MFS number mismatch with KYC verification.
                </option>
                <option value="Invalid or disconnected mobile wallet number.">
                  Invalid or disconnected mobile wallet number.
                </option>
                <option value="Open customer dispute on an active rental booking.">
                  Open customer dispute on an active rental booking.
                </option>
                <option value="Earnings hold pending security deposit clearance.">
                  Earnings hold pending security deposit clearance.
                </option>
                <option value="Please update your bank routing number and submit again.">
                  Please update your bank routing number and submit again.
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeclineModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteDecline}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                <span>Decline Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: PAYOUT STATEMENT / DETAILS ───────────────────────────── */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Host Payout Statement</h3>
                  <p className="text-xs text-slate-400 font-mono">{detailModalItem.payout_id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Statement Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Beneficiary Owner:</span>
                <span className="font-bold text-slate-900">{detailModalItem.owner.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Earnings Cycle:</span>
                <span className="font-bold text-slate-800">{detailModalItem.earnings_period}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Disbursal Method:</span>
                <span className="font-bold text-slate-800 uppercase">{detailModalItem.payout_method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono text-slate-800">{detailModalItem.bank_name} - {detailModalItem.account_number}</span>
              </div>

              <div className="border-t border-slate-200 pt-2.5 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Rental Earnings Inflow</span>
                  <span className="font-bold text-slate-800">৳ {detailModalItem.gross_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>RentHub Platform Commission ({detailModalItem.commission_rate}%)</span>
                  <span className="font-bold text-blue-600">-৳ {detailModalItem.commission_amount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>Net Disbursed to Host</span>
                  <span className="text-emerald-600">৳ {detailModalItem.net_amount.toLocaleString()} BDT</span>
                </div>
              </div>
            </div>

            {detailModalItem.disbursement_trx_id && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold">Disbursement Ref:</span>
                <span className="font-mono font-bold text-emerald-900">{detailModalItem.disbursement_trx_id}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Statement</span>
              </button>
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RETRY FAILED PAYOUT ──────────────────────────────────── */}
      {retryModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Retry Failed / Declined Payout</h3>
                  <p className="text-xs text-slate-400 font-normal">Re-trigger automated bank/MFS transfer</p>
                </div>
              </div>
              <button
                onClick={() => setRetryModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-red-900">Failure/Decline Reason:</span>
                <span className="text-red-700">Flagged</span>
              </div>
              <p className="text-slate-700 text-xs">
                {retryModalItem.failure_reason || "Beneficiary bank account branch routing inactive for EFTN."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRetryModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteRetry}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Re-send Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
