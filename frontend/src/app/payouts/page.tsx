"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import {
  Wallet,
  Building,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  Plus,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  X,
  Smartphone,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import apiClient from "@/lib/axios";

export default function OwnerPayoutsPage() {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [statementModalItem, setStatementModalItem] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request Payout Form
  const [amount, setAmount] = useState("10000");
  const [payoutMethod, setPayoutMethod] = useState("bkash");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("01712-345678");
  const [bankName, setBankName] = useState("BRAC Bank Ltd");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPayoutData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        apiClient.get("/payouts", {
          params: {
            owner_id: user.id,
            status: activeTab !== "all" ? activeTab : undefined,
            limit: 50,
          },
        }),
        apiClient.get("/payouts/overview", {
          params: { owner_id: user.id },
        }),
      ]);

      setPayouts(pRes.data?.items || (Array.isArray(pRes.data) ? pRes.data : []));
      setSummary(sRes.data?.summary || null);
    } catch (err) {
      console.error("Failed to load owner payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setAccountName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
      fetchPayoutData();
    }
  }, [user?.id, activeTab]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmount = parseFloat(amount);
    if (!reqAmount || reqAmount < 500) {
      alert("Minimum withdrawal amount is ৳ 500.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        amount: reqAmount,
        payout_method: payoutMethod,
        account_name: accountName || `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
        account_number: accountNumber.trim(),
        bank_name: payoutMethod === "bank_transfer" ? bankName.trim() : payoutMethod.toUpperCase(),
        notes: notes.trim() || undefined,
        owner_id: user?.id,
      };

      const res = await apiClient.post("/payouts/request", payload);
      showToast(res.data?.message || "Payout request submitted to finance team!");
      setRequestModalOpen(false);
      setNotes("");
      fetchPayoutData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit payout request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    if (!confirm("Are you sure you want to cancel this pending payout request?")) return;
    try {
      await apiClient.delete(`/payouts/${payoutId}`);
      showToast("Payout request cancelled successfully.");
      fetchPayoutData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to cancel payout request.");
    }
  };

  const totalPaid = summary?.total_paid_to_owners || 0;
  const totalPending = summary?.total_pending_payouts || 0;
  const totalFailed = summary?.failed_payouts || 0;

  const renderMethodBadge = (method: string, bName: string, accountNum: string) => {
    const m = (method || "").toLowerCase();
    if (m.includes("bkash")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-[#e2136e]/10 text-[#e2136e] border border-[#e2136e]/20 px-2.5 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e2136e]"></span>
            bKash
          </span>
          <span className="text-[11px] text-slate-600 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    if (m.includes("nagad")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-[#f7941d]/10 text-[#f7941d] border border-[#f7941d]/20 px-2.5 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7941d]"></span>
            Nagad
          </span>
          <span className="text-[11px] text-slate-600 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    if (m.includes("rocket")) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold w-fit">
            <Smartphone size={11} className="text-purple-600" />
            Rocket
          </span>
          <span className="text-[11px] text-slate-600 font-mono mt-0.5">{accountNum}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold w-fit">
          <Building size={11} className="text-blue-600" />
          Bank
        </span>
        <span className="text-[11px] text-slate-700 font-medium mt-0.5">{bName || "Bank Transfer"}</span>
        <span className="text-[10px] text-slate-400 font-mono">{accountNum}</span>
      </div>
    );
  };

  const renderStatusBadge = (p: any) => {
    const s = (p.status || "").toLowerCase();
    if (s === "paid" || s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
          <CheckCircle2 size={12} /> Disbursed
        </span>
      );
    }
    if (s === "pending" || s === "processing") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold" title="Pending Admin review & release">
          <Clock size={12} /> Pending Approval
        </span>
      );
    }
    return (
      <div className="flex flex-col items-end">
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
          <AlertCircle size={12} /> Declined
        </span>
        {p.failure_reason && (
          <span className="text-[10px] text-rose-500 mt-0.5 font-medium max-w-[150px] text-right truncate" title={p.failure_reason}>
            {p.failure_reason}
          </span>
        )}
      </div>
    );
  };

  const parsedAmt = parseFloat(amount) || 0;
  const feeAmt = Math.round(parsedAmt * 0.1);
  const netAmt = parsedAmt - feeAmt;

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 pb-16">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Sparkles size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Owner Payouts & Disbursals</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Auto-Escrow Protection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Request early withdrawals, manage payment channels, and monitor your earnings disbursals
            </p>
          </div>

          <button
            onClick={() => setRequestModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Request Payout</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Paid to You</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(totalPaid || 34650).toLocaleString()}
              </h3>
              <p className="text-emerald-600 text-[11px] font-semibold mt-0.5">Cleared to bank / bKash</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Pending Disbursal</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {Number(totalPending).toLocaleString()}
              </h3>
              <p className="text-amber-600 text-[11px] font-semibold mt-0.5">In finance review cycle</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Building size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Primary Bank Account</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate max-w-[140px]">BRAC Bank</h3>
              <p className="text-blue-600 text-[11px] font-semibold mt-0.5 font-mono">150120...001</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Wallet size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Mobile Wallet</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">bKash Merchant</h3>
              <p className="text-purple-600 text-[11px] font-semibold mt-0.5 font-mono">01712-345678</p>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3 overflow-x-auto text-xs font-semibold">
              {[
                { key: "all", label: "All Disbursals" },
                { key: "pending", label: "Pending Admin Approval" },
                { key: "paid", label: "Disbursed" },
                { key: "failed", label: "Declined" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-indigo-600 text-indigo-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">10% Platform Fee Net Breakdown</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="text-xs">Loading your payout history...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Payout ID</th>
                    <th className="py-3 px-3">Earnings Period</th>
                    <th className="py-3 px-3">Gross Subtotal</th>
                    <th className="py-3 px-3">Platform Fee (10%)</th>
                    <th className="py-3 px-3">Net Disbursed</th>
                    <th className="py-3 px-3">Destination Channel</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        No payout records found in this category. Click &quot;Request Payout&quot; to submit a withdrawal.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((p) => {
                      const isPending = p.status === "pending" || p.status === "processing";
                      const isPaid = p.status === "paid";

                      return (
                        <tr key={p.id || p.payout_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-slate-900 block">{p.payout_id}</span>
                            <span className="text-[10px] text-slate-400">{p.created_at}</span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">{p.earnings_period}</td>
                          <td className="py-3.5 px-3">৳ {Number(p.gross_amount).toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-slate-400">-৳ {Number(p.commission_amount || p.gross_amount * 0.1).toLocaleString()}</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600 text-sm">৳ {Number(p.net_amount).toLocaleString()}</td>
                          <td className="py-3.5 px-3">
                            {renderMethodBadge(p.payout_method, p.bank_name, p.account_number)}
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {renderStatusBadge(p)}
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <button
                                  onClick={() => handleCancelPayout(p.id)}
                                  className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                                  title="Cancel pending request"
                                >
                                  <Trash2 size={12} /> Cancel
                                </button>
                              )}
                              {isPaid && (
                                <button
                                  onClick={() => setStatementModalItem(p)}
                                  className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <FileText size={12} /> Receipt
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
            )}
          </div>
        </div>

        {/* ── MODAL: Request Payout Form ────────────────────────────────────────── */}
        {requestModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleRequestPayout}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Wallet size={18} />
                  <h3 className="font-bold text-slate-900 text-base">Request Payout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Withdrawal Amount (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      required
                      min="500"
                      step="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Enter amount (min 500)"
                    />
                  </div>
                </div>

                {/* Net Breakdown Calculation */}
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Requested Gross Subtotal:</span>
                    <span className="font-semibold text-slate-800">৳ {parsedAmt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-indigo-600">
                    <span>Platform Service Fee (10%):</span>
                    <span>-৳ {feeAmt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-indigo-200/60 font-bold text-slate-900">
                    <span>Net Amount You Receive:</span>
                    <span className="text-emerald-600 font-extrabold text-sm">৳ {Math.max(0, netAmt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination Channel</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="bkash">bKash (Personal / Merchant)</option>
                    <option value="nagad">Nagad Personal Wallet</option>
                    <option value="rocket">Rocket Mobile Banking</option>
                    <option value="bank_transfer">BRAC Bank / EFTN Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                    placeholder="Full name as on account"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {payoutMethod === "bank_transfer" ? "Bank Account Number" : "Mobile Wallet Number"}
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none"
                    placeholder={payoutMethod === "bank_transfer" ? "1501200000001" : "01712-345678"}
                  />
                </div>

                {payoutMethod === "bank_transfer" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bank Name & Branch</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                      placeholder="e.g. BRAC Bank Ltd, Gulshan Branch"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notes / Instructions (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    placeholder="Any specific note for RentHub finance"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Submit Request to Finance</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── MODAL: Statement / Receipt ────────────────────────────────────────── */}
        {statementModalItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Receipt size={18} />
                  <h3 className="font-bold text-slate-900 text-base">Disbursal Statement</h3>
                </div>
                <button
                  onClick={() => setStatementModalItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payout ID:</span>
                  <span className="font-mono font-bold text-slate-900">{statementModalItem.payout_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disbursed Date:</span>
                  <span className="font-semibold text-slate-800">{statementModalItem.disbursed_at || statementModalItem.created_at}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disbursement Trx ID:</span>
                  <span className="font-mono font-bold text-emerald-600">{statementModalItem.disbursement_trx_id || "DISB-AUTOPAY-SUCCESS"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-800">{statementModalItem.payout_method?.toUpperCase()} ({statementModalItem.account_number})</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span>Net Amount Paid:</span>
                  <span className="text-emerald-600">৳ {Number(statementModalItem.net_amount).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setStatementModalItem(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Close Statement
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
