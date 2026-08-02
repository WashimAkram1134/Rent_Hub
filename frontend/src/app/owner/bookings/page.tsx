"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Calendar, MapPin, Clock, Star, CheckCircle2, XCircle, RefreshCw,
  Check, X, ChevronDown, Phone, Mail, User, MessageCircle, MoreVertical,
  CarFront, Camera, Monitor, Building, Trophy, Package, ChevronRight
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type FilterTab = "all" | "pending" | "approved" | "rejected" | "expired";

function getCategoryIcon(catName: string = "") {
  const lower = catName.toLowerCase();
  if (lower.includes("vehicle") || lower.includes("car")) return <CarFront size={14} className="text-indigo-600" />;
  if (lower.includes("camera")) return <Camera size={14} className="text-indigo-600" />;
  if (lower.includes("electronic") || lower.includes("laptop")) return <Monitor size={14} className="text-indigo-600" />;
  if (lower.includes("apartment") || lower.includes("flat")) return <Building size={14} className="text-indigo-600" />;
  if (lower.includes("sport")) return <Trophy size={14} className="text-indigo-600" />;
  return <Package size={14} className="text-indigo-600" />;
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/v1/bookings")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list);
        if (list.length > 0 && !selectedBooking) {
          setSelectedBooking(list[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
        if (selectedBooking?.id === id) {
          setSelectedBooking((prev: any) => (prev ? { ...prev, status } : null));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const s = b.status.toLowerCase();
    if (activeTab === "all") return true;
    if (activeTab === "pending") return s === "pending";
    if (activeTab === "approved") return s === "approved" || s === "accepted";
    if (activeTab === "rejected") return s === "rejected" || s === "cancelled" || s === "declined";
    if (activeTab === "expired") return s === "expired";
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status.toLowerCase() === "pending").length;
  const approvedCount = bookings.filter((b) => b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "accepted").length;
  const rejectedCount = bookings.filter((b) => b.status.toLowerCase() === "rejected" || b.status.toLowerCase() === "cancelled" || b.status.toLowerCase() === "declined").length;

  return (
    <AppShell>
      <div className="p-6 font-sans min-h-screen bg-[#F8FAFC]">
        <div className="flex gap-6 items-start">

          {/* ── Center / Left Content Area ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Requests</h1>
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {bookings.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage rental requests from customers who want to rent your items.
                </p>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchBookings}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {/* Filter Tabs & Sort Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                {[
                  { key: "all", label: "All Requests", count: bookings.length },
                  { key: "pending", label: "Pending", count: pendingCount },
                  { key: "approved", label: "Accepted", count: approvedCount },
                  { key: "rejected", label: "Declined", count: rejectedCount },
                  { key: "expired", label: "Expired", count: 0 },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as FilterTab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === t.key
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === t.key ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                <span>Sort by: <strong className="text-slate-900">Newest</strong></span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            {/* Booking Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse h-36" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-4">
                <CheckCircle2 size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No booking requests</h3>
                <p className="text-xs text-slate-500 mt-1">There are no requests matching the '{activeTab}' tab.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredBookings.map((b) => {
                  const isSelected = selectedBooking?.id === b.id;
                  const isPending = b.status.toLowerCase() === "pending";
                  const isApproved = b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "accepted";

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-md"
                          : "border-slate-200/80 hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Left: Thumbnail with Category Overlay Badge + Details */}
                      <div className="flex gap-4 items-center">
                        <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img
                            src={b.product?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80"}
                            alt={b.product?.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                          {/* Category Badge Icon Overlay */}
                          <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
                            {getCategoryIcon(b.product?.title)}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                              isPending
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                : isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {b.product?.title || "Toyota Axio 2018"}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {b.product?.category || "Vehicle"}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar size={13} className="text-slate-400" />
                              <span>
                                {dayjs(b.start_date).format("DD MMM")} - {dayjs(b.end_date).format("DD MMM, YYYY")} ({b.total_days} days)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 font-medium">
                              <MapPin size={13} className="text-slate-400" />
                              <span>{b.product?.city || "Dhanmondi, Dhaka"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle/Right: Customer Snippet + Price + Action Buttons */}
                      <div className="flex flex-row sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                          {/* Customer Avatar & Name */}
                          <div className="flex items-center gap-2 text-right">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                              {b.renter?.first_name?.[0] || "F"}
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {b.renter?.first_name || "Fahim"} {b.renter?.last_name || "Ahmed"}
                              </div>
                              <div className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                                <Star size={10} className="fill-amber-400" /> 4.8 <span className="text-slate-400 font-normal">(32 reviews)</span>
                              </div>
                              <div className="text-[9px] text-slate-400">Joined May 2023</div>
                            </div>
                          </div>

                          <div className="text-right sm:ml-4">
                            <div className="text-[10px] text-slate-400 font-medium">
                              {dayjs(b.created_at || new Date()).fromNow()}
                            </div>
                            <div className="text-lg font-black text-indigo-600">
                              ৳ {(b.total_amount || 7500).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {isPending && (
                          <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "rejected")}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "approved")}
                              disabled={actionLoading === b.id}
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ── Right Panel / Request Details Drawer ─────────────────────────── */}
          {selectedBooking && (
            <div className="w-[340px] shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm sticky top-6 space-y-5">

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm">Request Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selected Product Card */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={selectedBooking.product?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80"}
                    alt={selectedBooking.product?.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                    {selectedBooking.product?.title || "Toyota Axio 2018"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {selectedBooking.product?.category || "Vehicle"}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} /> {selectedBooking.product?.city || "Dhanmondi, Dhaka"}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Booking Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Rental Duration</span>
                    <span className="font-semibold text-slate-800">
                      {dayjs(selectedBooking.start_date).format("DD MMM")} – {dayjs(selectedBooking.end_date).format("DD MMM, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Total Days</span>
                    <span className="font-semibold text-slate-800">{selectedBooking.total_days} days</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Pickup Location</span>
                    <span className="font-semibold text-slate-800">Dhanmondi, Dhaka</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Return Location</span>
                    <span className="font-semibold text-slate-800">Dhanmondi, Dhaka</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800">Total Amount</span>
                    <span className="text-base font-black text-indigo-600">
                      ৳ {(selectedBooking.total_amount || 7500).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Customer Information</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {selectedBooking.renter?.first_name?.[0] || "F"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {selectedBooking.renter?.first_name || "Fahim"} {selectedBooking.renter?.last_name || "Ahmed"}
                    </div>
                    <div className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                      <Star size={10} className="fill-amber-400" /> 4.8 <span className="text-slate-400 font-normal">(32 reviews)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Member since May 2023</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400" />
                    <span>+880 1XXX-XXXXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span>fahimahmed@email.com</span>
                  </div>
                </div>

                <button className="w-full py-2 border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-colors">
                  View Customer Profile
                </button>
              </div>

              {/* Message from Customer */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Message from Customer</h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 italic relative">
                  "{selectedBooking.notes || "Hi, I need this item for a trip. Please let me know if it's available on these dates."}"
                  <div className="text-[9px] text-slate-400 not-italic mt-1.5 text-right font-medium">
                    {dayjs(selectedBooking.created_at || new Date()).fromNow()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status?.toLowerCase() === "pending" && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "approved")}
                    disabled={actionLoading === selectedBooking.id}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={15} /> Accept Request
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "rejected")}
                    disabled={actionLoading === selectedBooking.id}
                    className="w-full py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X size={15} /> Decline Request
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
