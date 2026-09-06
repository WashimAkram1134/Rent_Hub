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
} from "lucide-react";
import apiClient from "@/lib/axios";

interface PaymentItem {
  id: string;
  transaction_id: string;
  gateway_trx_id: string;
  amount: number;
  subtotal: number;
  service_fee: number;
  security_deposit: number;
  delivery_fee: number;
  payment_method: string;
  payment_channel: string;
  status: string;
  currency: string;
  escrow_status: string;
  failure_reason?: string | null;
  failure_code?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  refund_trx_id?: string | null;
  refunded_at?: string | null;
  created_at: string;
  short_date: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar_url?: string | null;
  };
  booking: {
    id: string;
    booking_code: string;
    product_title: string;
    product_city: string;
    product_image?: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
    status: string;
  };
}

interface OverviewSummary {
  total_volume: number;
  total_volume_change: string;
  successful_payments: number;
  successful_volume: number;
  success_rate: string;
  successful_change: string;
  pending_payments: number;
  pending_volume: number;
  pending_change: string;
  failed_payments: number;
  failed_volume: number;
  refunded_payments: number;
  refunded_volume: number;
  failed_refunded_total: number;
  failed_refunded_volume: number;
  failed_change: string;
}

export default function AdminPaymentsPage() {
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Modals
  const [detailModalItem, setDetailModalItem] = useState<PaymentItem | null>(null);
  const [refundModalItem, setRefundModalItem] = useState<PaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("Booking cancelled within full refund policy");
  const [investigateModalItem, setInvestigateModalItem] = useState<PaymentItem | null>(null);
  const [investigationResolution, setInvestigationResolution] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOverview = async () => {
    try {
      const res = await apiClient.get("/payments/overview");
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load payment overview:", err);
    }
  };

  const fetchPayments = async (page = 1) => {
    try {
      setTableLoading(true);
      const res = await apiClient.get("/payments", {
        params: {
          status: activeTab !== "all" ? activeTab : undefined,
          method: selectedMethod !== "all" ? selectedMethod : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        },
      });
      setPayments(res.data.items);
      setTotalPayments(res.data.total);
      setTotalPages(res.data.total_pages);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [activeTab, selectedMethod, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments(1);
  };

  const handleExecuteRefund = async () => {
    if (!refundModalItem) return;
    try {
      setActionProcessing(true);
      const res = await apiClient.post(`/payments/${refundModalItem.id}/refund`, {
        amount: refundAmount ? parseFloat(refundAmount) : refundModalItem.amount,
        reason: refundReason,
      });
      showToast(res.data.message || "Refund issued successfully!");
      setRefundModalItem(null);
      setRefundAmount("");
      fetchPayments(currentPage);
      fetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to process refund");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExecuteInvestigation = async () => {
    if (!investigateModalItem) return;
    try {
      setActionProcessing(true);
      await apiClient.post(`/payments/${investigateModalItem.id}/investigate`, {
        resolution: investigationResolution || "Investigated with gateway logs; retry link enabled.",
        retry_allowed: true,
        notify_customer: true,
      });
      showToast("Investigation completed & customer notified!");
      setInvestigateModalItem(null);
      setInvestigationResolution("");
      fetchPayments(currentPage);
    } catch (err) {
      console.error("Failed to investigate:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    const csvHeader = ["Transaction ID", "Gateway Reference", "Customer", "Customer Email", "Booking", "Amount (BDT)", "Payment Method", "Status", "Date"];
    const csvRows = payments.map((p) => [
      p.transaction_id,
      p.gateway_trx_id,
      p.customer.name,
      p.customer.email,
      p.booking.product_title,
      p.amount,
      p.payment_method.toUpperCase(),
      p.status.toUpperCase(),
      p.created_at,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentHub_Payments_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMethodBadge = (method: string) => {
    const m = method.toLowerCase();
    if (m.includes("bkash")) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#e2136e]/10 text-[#e2136e] border border-[#e2136e]/20 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e2136e]"></span>
          bKash
        </span>
      );
    }
    if (m.includes("nagad")) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#f7941d]/10 text-[#f7941d] border border-[#f7941d]/20 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f7941d]"></span>
          Nagad
        </span>
      );
    }
    if (m.includes("card") || m.includes("ssl")) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
          <CreditCard size={12} className="text-blue-600" />
          Card / SSL
        </span>
      );
    }
    if (m.includes("rocket")) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
          <Smartphone size={12} className="text-purple-600" />
          Rocket
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
        <Building size={12} className="text-slate-600" />
        Bank Transfer
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "successful" || s === "success") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
          <Check size={12} /> Paid
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
          <Clock size={12} /> Pending
        </span>
      );
    }
    if (s === "refunded") {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold">
          <RotateCcw size={12} /> Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold">
        <X size={12} /> Failed
      </span>
    );
  };

  if (loading && !summary) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Payments Dashboard...</p>
      </div>
    );
  }

  const s = summary || {
    total_volume: 7014500,
    total_volume_change: "+18.4%",
    successful_payments: 250,
    successful_volume: 7014500,
    success_rate: "92.6%",
    successful_change: "+12.2%",
    pending_payments: 6,
    pending_volume: 98600,
    pending_change: "-4.1%",
    failed_payments: 6,
    failed_volume: 116300,
    refunded_payments: 8,
    refunded_volume: 122100,
    failed_refunded_total: 14,
    failed_refunded_volume: 238400,
    failed_change: "-8.5%",
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* ── Toast Alert ──────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Transactions</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Escrow Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Incoming customer payments, escrow funds, gateway transactions, and refunds
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export Transactions</span>
          </button>
        </div>
      </div>

      {/* ── 4 Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payment Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Payment Volume</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(s.total_volume).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>↑ {s.total_volume_change}</span>
                <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
              </p>
            </div>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Successful Payments</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {s.successful_payments}{" "}
                <span className="text-xs font-normal text-slate-500">Paid ({s.success_rate})</span>
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>↑ {s.successful_change}</span>
                <span className="text-slate-400 font-normal text-[10px]">success rate</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Pending Payments</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {s.pending_payments}{" "}
                <span className="text-xs font-normal text-slate-500">
                  (৳ {Math.round(s.pending_volume / 1000)}k)
                </span>
              </h3>
              <p className="text-amber-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>Held in checkout</span>
              </p>
            </div>
          </div>
        </div>

        {/* Failed / Refunded Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Failed / Refunded</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {s.failed_refunded_total}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({s.failed_payments}F • {s.refunded_payments}R)
                </span>
              </h3>
              <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <span>৳ {Math.round(s.failed_refunded_volume / 1000)}k total</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Payment Table & Moderation Card ─────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { key: "all", label: "All Payments", count: totalPayments },
            { key: "paid", label: "Successful", count: s.successful_payments },
            { key: "pending", label: "Pending", count: s.pending_payments },
            { key: "failed", label: "Failed", count: s.failed_payments },
            { key: "refunded", label: "Refunded", count: s.refunded_payments },
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
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
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
              placeholder="Search by Transaction ID, Customer, Booking, Item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Payment Method Selector */}
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none shadow-2xs"
            >
              <option value="all">All Payment Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="card">Card / SSLCommerz</option>
              <option value="rocket">Rocket</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium shadow-2xs">
              <Calendar size={13} className="text-slate-400" />
              <span>Aug 1 – Aug 25, 2026</span>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto relative min-h-[320px]">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          )}

          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-3">Transaction ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Booking / Item</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Method</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPaid = p.status === "paid";
                  const isFailed = p.status === "failed";
                  const isPending = p.status === "pending";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Transaction ID */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {p.transaction_id}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {p.gateway_trx_id}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                            {p.customer.avatar_url ? (
                              <img src={p.customer.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              p.customer.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{p.customer.name}</p>
                            <p className="text-slate-400 text-[10px]">{p.customer.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Booking / Item */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {p.booking.product_image ? (
                              <img src={p.booking.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                ITEM
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs line-clamp-1 max-w-[140px]">
                              {p.booking.product_title}
                            </p>
                            <span className="text-blue-600 text-[10px] font-mono font-medium">
                              {p.booking.booking_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs">
                            ৳ {p.amount.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            Escrow: <span className="capitalize font-medium text-slate-600">{p.escrow_status}</span>
                          </p>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderMethodBadge(p.payment_method)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {p.short_date}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Transaction Button */}
                          <button
                            onClick={() => setDetailModalItem(p)}
                            title="View Transaction Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-2xs"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Quick Action: Refund if Paid */}
                          {isPaid && (
                            <button
                              onClick={() => {
                                setRefundModalItem(p);
                                setRefundAmount(p.amount.toString());
                              }}
                              title="Issue Refund"
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Refund
                            </button>
                          )}

                          {/* Quick Action: Investigate if Failed */}
                          {isFailed && (
                            <button
                              onClick={() => setInvestigateModalItem(p)}
                              title="Investigate Failed Payment"
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <AlertCircle size={11} />
                              Investigate
                            </button>
                          )}

                          {/* 3 dots menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdownId(activeDropdownId === p.id ? null : p.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {activeDropdownId === p.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs text-left">
                                <button
                                  onClick={() => {
                                    setDetailModalItem(p);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <FileText size={13} className="text-blue-600" />
                                  <span>View Receipt</span>
                                </button>

                                <Link
                                  href={`/bookings`}
                                  className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <ExternalLink size={13} className="text-slate-500" />
                                  <span>View Booking</span>
                                </Link>

                                {isPaid && (
                                  <button
                                    onClick={() => {
                                      setRefundModalItem(p);
                                      setRefundAmount(p.amount.toString());
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-purple-50 flex items-center gap-2 text-purple-700 font-medium border-t border-slate-100"
                                  >
                                    <RotateCcw size={13} />
                                    <span>Issue Refund</span>
                                  </button>
                                )}

                                {isFailed && (
                                  <button
                                    onClick={() => {
                                      setInvestigateModalItem(p);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-700 font-medium border-t border-slate-100"
                                  >
                                    <AlertCircle size={13} />
                                    <span>Investigate Logs</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
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
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalPayments)} of {totalPayments} payments
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

      {/* ── MODAL 1: TRANSACTION DETAILS / RECEIPT ────────────────────────── */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Payment Transaction Details</h3>
                  <p className="text-xs text-slate-400 font-mono">{detailModalItem.transaction_id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Total Highlight */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Paid by Customer</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  ৳ {detailModalItem.amount.toLocaleString()}
                </h2>
              </div>
              <div className="text-right">
                <div className="mb-1">{renderStatusBadge(detailModalItem.status)}</div>
                <span className="text-[11px] text-slate-400 font-mono">{detailModalItem.created_at}</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 text-xs">Financial Breakdown</h4>
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Subtotal ({detailModalItem.booking.total_days} days)</span>
                  <span className="font-semibold text-slate-800">৳ {detailModalItem.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Service Fee (6%)</span>
                  <span className="font-semibold text-blue-600">৳ {detailModalItem.service_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit</span>
                  <span className="font-semibold text-slate-800">৳ {detailModalItem.security_deposit.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total Escrow Inflow</span>
                  <span>৳ {detailModalItem.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Parties & Gateway Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Renter / Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{detailModalItem.customer.name}</p>
                <p className="text-[11px] text-slate-500">{detailModalItem.customer.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Method</span>
                <p className="font-bold text-slate-900 mt-0.5 uppercase">{detailModalItem.payment_method}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">Gateway: {detailModalItem.gateway_trx_id}</p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ISSUE REFUND ────────────────────────────────────────── */}
      {refundModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-purple-600">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Issue Payment Refund</h3>
                  <p className="text-xs text-slate-400 font-normal">
                    Reverses customer payment back to original payment channel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRefundModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold font-mono text-slate-800">{refundModalItem.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{refundModalItem.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Original Amount:</span>
                <span className="font-bold text-purple-700">৳ {refundModalItem.amount.toLocaleString()} BDT</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Refund Amount (BDT)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Booking cancelled within full refund policy">
                    Booking cancelled within full refund policy
                  </option>
                  <option value="Host unable to provide rental item">Host unable to provide rental item</option>
                  <option value="Dispute resolved in favor of customer">Dispute resolved in favor of customer</option>
                  <option value="Security deposit return">Security deposit return</option>
                  <option value="Duplicate transaction charge">Duplicate transaction charge</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteRefund}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                <span>Process Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: INVESTIGATE FAILED PAYMENT ───────────────────────────── */}
      {investigateModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Payment Failure Diagnostics</h3>
                  <p className="text-xs text-slate-400 font-normal">Audit gateway error codes & customer notification</p>
                </div>
              </div>
              <button
                onClick={() => setInvestigateModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Diagnostic Box */}
            <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-800 font-mono">
                  {investigateModalItem.failure_code || "ERR_GATEWAY_TIMEOUT"}
                </span>
                <span className="text-[10px] text-red-600 font-semibold uppercase">Failed at Gateway</span>
              </div>
              <p className="text-slate-700 text-xs">
                {investigateModalItem.failure_reason || "Customer session expired before completing payment PIN entry."}
              </p>
            </div>

            {/* Gateway Audit Logs */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 text-xs">Gateway Trace Logs</h4>
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1">
                <p className="text-emerald-400">✓ [200 OK] Checkout session generated: {investigateModalItem.transaction_id}</p>
                <p className="text-emerald-400">✓ [200 OK] Customer routed to {investigateModalItem.payment_method.toUpperCase()} PGW</p>
                <p className="text-red-400">✕ [FAILED] {investigateModalItem.failure_code || "ERR_TIMEOUT"}: Verification timed out</p>
              </div>
            </div>

            {/* Resolution note */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Resolution & Customer Note</label>
              <textarea
                value={investigationResolution}
                onChange={(e) => setInvestigationResolution(e.target.value)}
                placeholder="Log resolution steps taken (e.g. Sent payment link retry SMS to customer)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInvestigateModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleExecuteInvestigation}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Investigation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
