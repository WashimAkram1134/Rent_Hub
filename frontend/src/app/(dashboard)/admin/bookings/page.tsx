"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  User,
  Store,
  Package,
  MessageSquare,
  Scale,
  RotateCcw,
  Loader2,
  ExternalLink,
  X,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";

interface BookingRecord {
  id: string;
  booking_code?: string;
  product?: {
    id: string;
    title: string;
    image_url?: string;
    price_per_day: number;
    security_deposit?: number;
    delivery_option?: string;
  };
  renter?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  start_date: string;
  end_date: string;
  total_days?: number;
  daily_rate?: number;
  subtotal?: number;
  security_deposit?: number;
  delivery_fee?: number;
  total_amount: number;
  status: string;
  delivery_option?: string;
  notes?: string;
  created_at?: string;
}

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Details Modal State
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [actionModal, setActionModal] = useState<"cancel" | "refund" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = user?.primary_role === "admin" || user?.role_names?.includes("admin");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/bookings", {
        params: { limit: 100 }
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadBookings();
    else setLoading(false);
  }, [isAdmin]);

  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-slate-900 font-semibold text-xl">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  // Handle Cancel Booking action
  const handleCancelBooking = async () => {
    if (!selectedBooking || !actionReason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }
    try {
      setActionSubmitting(true);
      await apiClient.patch(`/bookings/${selectedBooking.id}/status`, {
        status: "cancelled",
        reason: actionReason.trim()
      });
      showToast(`Booking #${selectedBooking.id.split('-')[0]} cancelled.`);
      setActionModal(null);
      setSelectedBooking(null);
      loadBookings();
    } catch (e) {
      alert("Failed to cancel booking.");
    } finally {
      setActionSubmitting(false);
    }
  };

  // Handle Refund Action
  const handleIssueRefund = async () => {
    if (!selectedBooking) return;
    try {
      setActionSubmitting(true);
      await apiClient.patch(`/bookings/${selectedBooking.id}/status`, {
        status: "refunded",
        notes: `Admin initiated refund. Reason: ${actionReason || "Operational resolution"}`
      });
      showToast(`Refund issued for Booking #${selectedBooking.id.split('-')[0]}.`);
      setActionModal(null);
      setSelectedBooking(null);
      loadBookings();
    } catch (e) {
      alert("Failed to issue refund.");
    } finally {
      setActionSubmitting(false);
    }
  };

  // Tab counts
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const activeCount = bookings.filter(b => ["active", "confirmed", "approved"].includes(b.status.toLowerCase())).length;
  const completedCount = bookings.filter(b => b.status.toLowerCase() === "completed").length;
  const cancelledCount = bookings.filter(b => ["cancelled", "rejected", "refunded"].includes(b.status.toLowerCase())).length;

  // Filtered list
  const filteredBookings = bookings.filter(b => {
    const s = b.status.toLowerCase();
    if (activeTab === "pending" && s !== "pending") return false;
    if (activeTab === "active" && !["active", "confirmed", "approved"].includes(s)) return false;
    if (activeTab === "completed" && s !== "completed") return false;
    if (activeTab === "cancelled" && !["cancelled", "rejected", "refunded"].includes(s)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = b.id.toLowerCase();
      const itemTitle = b.product?.title?.toLowerCase() || "";
      const renterName = `${b.renter?.first_name || ""} ${b.renter?.last_name || ""}`.toLowerCase();
      const ownerName = `${b.owner?.first_name || ""} ${b.owner?.last_name || ""}`.toLowerCase();
      return code.includes(q) || itemTitle.includes(q) || renterName.includes(q) || ownerName.includes(q);
    }

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Bookings & Reservations Oversight
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor active rentals, dates, financial escrow, and customer-host handoffs.
            </p>
          </div>
        </div>

        <button
          onClick={loadBookings}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs w-fit cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volume</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {bookings.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Requests</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 shadow-xs">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Rentals</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {activeCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111625] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "pending", "active", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search #RH..., item, renter, host..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs font-semibold">Loading booking reservations...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Calendar size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No bookings found</h3>
          <p className="text-xs text-slate-400">There are no reservation records matching your selected filter.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Rental Item</th>
                  <th className="px-4 py-3">Renter</th>
                  <th className="px-4 py-3">Host Owner</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBookings.map((b) => {
                  const status = b.status.toUpperCase();
                  let badgeClass = "bg-slate-100 text-slate-600";
                  if (status === "COMPLETED") badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (status === "ACTIVE" || status === "CONFIRMED" || status === "APPROVED") badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                  if (status === "PENDING") badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                  if (status === "CANCELLED" || status === "REJECTED" || status === "REFUNDED") badgeClass = "bg-rose-50 text-rose-700 border-rose-200";

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        #{b.id.split("-")[0].toUpperCase()}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          {b.product?.image_url ? (
                            <img src={b.product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                              <Package size={14} />
                            </div>
                          )}
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {b.product?.title || "Rental Asset"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {b.renter ? `${b.renter.first_name} ${b.renter.last_name}` : "Customer"}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : "Host Owner"}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {b.start_date} → {b.end_date}
                      </td>

                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900 dark:text-white whitespace-nowrap">
                        ৳{Number(b.total_amount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f1422] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  BOOKING #{selectedBooking.id.split("-")[0].toUpperCase()}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedBooking.product?.title || "Rental Reservation"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Asset & Timeline Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rental Window</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedBooking.start_date} to {selectedBooking.end_date}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status: <strong className="uppercase text-blue-600">{selectedBooking.status}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
                  <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    ৳{Number(selectedBooking.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Two Parties: Customer & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Renter */}
                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                  <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} /> Renter (Customer)
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedBooking.renter ? `${selectedBooking.renter.first_name} ${selectedBooking.renter.last_name}` : "Verified Renter"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={12} /> {selectedBooking.renter?.email || "customer@renthub.com"}
                  </p>
                  {selectedBooking.renter?.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone size={12} /> {selectedBooking.renter.phone}
                    </p>
                  )}
                  <Link
                    href={`/admin/messages`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
                  >
                    <MessageSquare size={12} /> Open Chat
                  </Link>
                </div>

                {/* Host */}
                <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={13} /> Asset Host (Owner)
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedBooking.owner ? `${selectedBooking.owner.first_name} ${selectedBooking.owner.last_name}` : "Registered Host"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={12} /> {selectedBooking.owner?.email || "owner@renthub.com"}
                  </p>
                  {selectedBooking.owner?.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone size={12} /> {selectedBooking.owner.phone}
                    </p>
                  )}
                  <Link
                    href={`/admin/messages`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 pt-1"
                  >
                    <MessageSquare size={12} /> Open Chat
                  </Link>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Financial Breakdown</p>
                <div className="flex justify-between text-slate-500">
                  <span>Rental Subtotal</span>
                  <span className="font-mono font-medium">৳{Number(selectedBooking.subtotal || selectedBooking.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Security Deposit (Escrow)</span>
                  <span className="font-mono font-medium">৳{Number(selectedBooking.security_deposit || 2000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Option</span>
                  <span className="font-medium capitalize">{selectedBooking.delivery_option || "Self Pickup"}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                  <span>Total Escrow Amount</span>
                  <span className="font-mono">৳{Number(selectedBooking.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Sensitive Operator Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Operator Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setActionModal("cancel"); setActionReason(""); }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Cancel Booking with Reason
                  </button>
                  <button
                    onClick={() => { setActionModal("refund"); setActionReason(""); }}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Issue Refund
                  </button>
                  <Link
                    href={`/admin/disputes`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Scale size={12} /> Open Dispute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Sub-Modal for Cancel or Refund */}
      {actionModal && selectedBooking && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111625] rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              {actionModal === "cancel" ? "Cancel Booking Confirmation" : "Issue Refund Confirmation"}
            </h3>
            <p className="text-xs text-slate-500">
              {actionModal === "cancel"
                ? `Are you sure you want to cancel Booking #${selectedBooking.id.split("-")[0]}? Both the renter and host will be notified.`
                : `Issue full refund of ৳${Number(selectedBooking.total_amount).toLocaleString()} to the renter? This action cannot be undone.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Justification Note *
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter mandatory justification for operator audit log..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={actionModal === "cancel" ? handleCancelBooking : handleIssueRefund}
                disabled={actionSubmitting}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                  actionModal === "cancel" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {actionSubmitting && <Loader2 size={13} className="animate-spin" />}
                Confirm {actionModal === "cancel" ? "Cancellation" : "Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
