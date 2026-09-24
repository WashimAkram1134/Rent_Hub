"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  DollarSign,
  User,
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  X,
  FileText,
  BadgeAlert,
  Send
} from "lucide-react";
import apiClient from "@/lib/axios";

interface DisputeItem {
  id: string;
  dispute_code: string;
  booking_id: string;
  booking_code: string;
  item_title: string;
  item_image?: string | null;
  category: string;
  reason: string;
  status: "open" | "under_review" | "resolved";
  priority: "HIGH" | "MEDIUM" | "LOW";
  resolution?: string | null;
  resolved_at?: string | null;
  created_at: string;
  amount_disputed: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    claim: string;
    evidence_photos: string[];
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    defense: string;
    evidence_photos: string[];
  };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [metrics, setMetrics] = useState({
    total_disputes: 0,
    open_count: 0,
    under_review_count: 0,
    resolved_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "under_review" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Modal State
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<string>("refund_customer");
  const [resolutionNote, setResolutionNote] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/bookings/admin/disputes/list", {
        params: { status: activeTab },
      });
      if (res.data) {
        setDisputes(res.data.disputes || []);
        setMetrics(res.data.metrics || {
          total_disputes: 0,
          open_count: 0,
          under_review_count: 0,
          resolved_count: 0,
        });
      }
    } catch (e) {
      console.error("Failed to fetch disputes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [activeTab]);

  const handleOpenReview = (disp: DisputeItem) => {
    setSelectedDispute(disp);
    setRefundAmount(disp.amount_disputed);
    setResolutionNote("");
    setResolutionAction("refund_customer");
    setShowReviewModal(true);
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    if (!resolutionNote.trim()) {
      alert("Please provide a business resolution justification note.");
      return;
    }

    try {
      setSubmittingResolution(true);
      await apiClient.post(`/bookings/admin/disputes/${selectedDispute.id}/resolve`, {
        action: resolutionAction,
        resolution_note: resolutionNote.trim(),
        refund_amount: resolutionAction === "partial_refund" ? Number(refundAmount) : undefined,
      });

      showToast(`Dispute ${selectedDispute.dispute_code} successfully resolved!`);
      setShowReviewModal(false);
      fetchDisputes();
    } catch (e) {
      console.error(e);
      alert("Failed to submit resolution. Please try again.");
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Filter disputes by search
  const filteredDisputes = disputes.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.dispute_code.toLowerCase().includes(q) ||
      d.booking_code.toLowerCase().includes(q) ||
      d.item_title.toLowerCase().includes(q) ||
      d.customer.name.toLowerCase().includes(q) ||
      d.owner.name.toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Scale size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Disputes & Claims Resolution
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Two-sided evidence adjudication for damage, deposit, and rental disagreements.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDisputes}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs w-fit cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.total_disputes}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Urgent Action</p>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {metrics.open_count} Open
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Under Investigation</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {metrics.under_review_count}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {metrics.resolved_count}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111625] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "open", "under_review", "resolved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispute, booking, user..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-rose-500" />
          <span className="text-xs font-semibold">Loading dispute claims...</span>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No disputes found in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All rental transactions are progressing smoothly with no unresolved customer or host claims.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((disp) => {
            const isResolved = disp.status === "resolved";
            const isOpen = disp.status === "open";
            return (
              <div
                key={disp.id}
                className="bg-white dark:bg-[#111625] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  {disp.item_image ? (
                    <img
                      src={disp.item_image}
                      alt={disp.item_title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Package size={24} />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {disp.dispute_code}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({disp.booking_code})
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isOpen
                          ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                          : isResolved
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}>
                        {disp.status.replace("_", " ")}
                      </span>
                      {disp.priority === "HIGH" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {disp.item_title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Claim:</span> {disp.reason}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Renter: <strong className="text-slate-700 dark:text-slate-300">{disp.customer.name}</strong></span>
                      <span>Host: <strong className="text-slate-700 dark:text-slate-300">{disp.owner.name}</strong></span>
                      <span>Disputed: <strong className="text-slate-900 dark:text-white font-mono">৳{disp.amount_disputed.toLocaleString()}</strong></span>
                    </div>

                    {disp.resolution && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg mt-2 border border-emerald-200 dark:border-emerald-800/40">
                        <strong>Resolution:</strong> {disp.resolution}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    onClick={() => handleOpenReview(disp)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={13} /> {isResolved ? "View Adjudication" : "Review & Adjudicate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two-Sided Review & Adjudication Modal */}
      {showReviewModal && selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1422] rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-rose-500">
                    {selectedDispute.dispute_code}
                  </span>
                  <span className="text-xs text-slate-400">| Booking {selectedDispute.booking_code}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Adjudicate: {selectedDispute.item_title}
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Two-Sided Evidence Grid */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Customer Evidence */}
                <div className="p-4.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} /> Customer (Renter) Claim
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {selectedDispute.customer.id || "Verified Renter"}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedDispute.customer.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedDispute.customer.email} • {selectedDispute.customer.phone}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#131929] border border-blue-100 dark:border-blue-900/30 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Renter Statement:</p>
                    "{selectedDispute.customer.claim}"
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Submitted Photo Evidence
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDispute.customer.evidence_photos.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block relative rounded-xl overflow-hidden group">
                          <img src={img} alt="Customer evidence" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            View Full <ExternalLink size={10} className="ml-1" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Owner Evidence */}
                <div className="p-4.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={13} /> Host (Owner) Defense
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {selectedDispute.owner.id || "Asset Host"}</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedDispute.owner.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedDispute.owner.email} • {selectedDispute.owner.phone}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#131929] border border-amber-100 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Host Defense:</p>
                    "{selectedDispute.owner.defense}"
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Host Pre/Post Hand-off Evidence
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDispute.owner.evidence_photos.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block relative rounded-xl overflow-hidden group">
                          <img src={img} alt="Host evidence" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            View Full <ExternalLink size={10} className="ml-1" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Operator Adjudication Form */}
              <form onSubmit={handleResolveDispute} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-500" /> Platform Operator Resolution
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Resolution Action */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Resolution Decision
                    </label>
                    <select
                      value={resolutionAction}
                      onChange={(e) => setResolutionAction(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500"
                    >
                      <option value="refund_customer">Full Refund to Customer (Refund Deposit & Fee)</option>
                      <option value="partial_refund">Partial Refund / Deposit Deduction Adjustment</option>
                      <option value="release_payout">Release Full Escrow Payout to Host (Claim Denied)</option>
                      <option value="warning">Account Policy Warning (No Financial Change)</option>
                      <option value="dismiss">Dismiss Claim (Insufficient Evidence)</option>
                    </select>
                  </div>

                  {/* Partial Refund Amount if selected */}
                  {resolutionAction === "partial_refund" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Refund Amount to Customer (৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedDispute.amount_disputed}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Audit Resolution Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Adjudication Justification & Audit Note (Dispatched to both parties) *
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="State reason for resolution based on evidence review (e.g. Host pre-rental photos confirm scratch was pre-existing...)"
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingResolution}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {submittingResolution ? <Loader2 size={13} className="animate-spin" /> : <Scale size={13} />}
                    Confirm Resolution & Notify Parties
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
