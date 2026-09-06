"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building2,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import type { ListerApplication } from "@/types";

export default function AdminListersPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [applications, setApplications] = useState<ListerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState({
    total_applications: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Selected for Modal Review
  const [selectedApp, setSelectedApp] = useState<ListerApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/lister-applications/admin/list", {
        params: {
          status: activeTab === "all" ? undefined : activeTab,
          search: search || undefined,
          page,
          limit,
        },
      });

      setApplications(res.data?.items || []);
      setTotal(res.data?.total || 0);
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error("Failed to load lister applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab, page, search]);

  const handleApprove = async (appId: string) => {
    try {
      setActionLoading(true);
      await apiClient.post(`/lister-applications/admin/${appId}/approve`, {
        admin_notes: adminNote || undefined,
      });

      setFeedbackMsg({
        type: "success",
        text: "Application approved! Owner features and permissions are now enabled for this user.",
      });
      setShowReviewModal(false);
      setSelectedApp(null);
      setAdminNote("");
      await fetchApplications();
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.response?.data?.detail || "Approval failed. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appId: string) => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      await apiClient.post(`/lister-applications/admin/${appId}/reject`, {
        reason: rejectReason,
        admin_notes: adminNote || undefined,
      });

      setFeedbackMsg({
        type: "success",
        text: "Application rejected. Notification sent to customer.",
      });
      setRejectModalOpen(false);
      setShowReviewModal(false);
      setSelectedApp(null);
      setRejectReason("");
      setAdminNote("");
      await fetchApplications();
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.response?.data?.detail || "Rejection failed. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lister Applications</h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {metrics.pending_count} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review and verify customer applications to become verified item owners and listers.
            </p>
          </div>

          <button
            onClick={() => fetchApplications()}
            className="self-start sm:self-auto px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total_applications}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{metrics.pending_count}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Approved Owners</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{metrics.approved_count}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Rejected / Revision</p>
              <p className="text-2xl font-black text-rose-900 mt-1">{metrics.rejected_count}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={22} />
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              {[
                { id: "pending", label: "Pending", count: metrics.pending_count },
                { id: "approved", label: "Approved", count: metrics.approved_count },
                { id: "rejected", label: "Rejected", count: metrics.rejected_count },
                { id: "all", label: "All Applicants", count: metrics.total_applications },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setPage(1);
                  }}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, city, ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Applicant</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Document</th>
                  <th className="py-3 px-3">Categories</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Applicant */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {app.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{app.full_name}</p>
                            {app.business_name && (
                              <p className="text-[10px] text-slate-400">{app.business_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-700">{app.phone}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{app.email}</p>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">{app.city}</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{app.address_line}</p>
                      </td>

                      {/* Document */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-800">{app.id_type}</span>
                          {app.id_front_url && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              Photo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{app.id_number}</p>
                      </td>

                      {/* Categories */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {app.categories_intended && app.categories_intended.length > 0 ? (
                            app.categories_intended.slice(0, 2).map((cat, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded capitalize"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">General</span>
                          )}
                          {app.categories_intended && app.categories_intended.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{app.categories_intended.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">{getStatusBadge(app.status)}</td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowReviewModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye size={13} /> Inspect
                          </button>

                          {app.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── INSPECT / REVIEW DETAIL MODAL ── */}
        {showReviewModal && selectedApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    {selectedApp.full_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{selectedApp.full_name}</h3>
                    <p className="text-xs text-slate-400">Lister Application Inspection</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedApp(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Application Status:</span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                {selectedApp.created_at && (
                  <span className="text-[11px] text-slate-400">
                    Applied: {new Date(selectedApp.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <p className="font-semibold text-slate-800">{selectedApp.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Phone Number:</span>
                  <p className="font-semibold text-slate-800">{selectedApp.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Business / Trade Name:</span>
                  <p className="font-semibold text-slate-800">{selectedApp.business_name || "Individual Lister"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <p className="font-semibold text-slate-800">{selectedApp.city}, {selectedApp.address_line}</p>
                </div>
              </div>

              {/* ID Document Preview */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Identity Document: {selectedApp.id_type}
                  </span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    #{selectedApp.id_number}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedApp.id_front_url ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400">Front Document Photo</span>
                      <a href={selectedApp.id_front_url} target="_blank" rel="noreferrer" className="block relative group">
                        <img
                          src={selectedApp.id_front_url}
                          alt="ID Front"
                          className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={10} /> Full View
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      No front image attached
                    </div>
                  )}

                  {selectedApp.id_back_url ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400">Back Document Photo</span>
                      <a href={selectedApp.id_back_url} target="_blank" rel="noreferrer" className="block relative group">
                        <img
                          src={selectedApp.id_back_url}
                          alt="ID Back"
                          className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={10} /> Full View
                        </span>
                      </a>
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      No back image attached
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Categories */}
              {selectedApp.experience_bio && (
                <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Lister Experience / Notes:</span>
                  <p className="p-3 rounded-xl bg-slate-50 text-slate-700 italic border border-slate-200/60">
                    &quot;{selectedApp.experience_bio}&quot;
                  </p>
                </div>
              )}

              {/* Admin Decision Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                {selectedApp.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(selectedApp.id)}
                      className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Approve as Owner Lister
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REJECTION REASON MODAL ── */}
        {rejectModalOpen && selectedApp && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle size={20} />
                <h3 className="font-extrabold text-sm text-slate-900">Decline Lister Application</h3>
              </div>
              <p className="text-xs text-slate-500">
                Provide actionable feedback to <span className="font-bold text-slate-800">{selectedApp.full_name}</span> so they know what to fix before reapplying.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Blurry NID photo / Incomplete address details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-rose-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReject(selectedApp.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
