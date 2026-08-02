"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import {
  Calendar, MapPin, Clock, Star, CheckCircle2, XCircle, RefreshCw,
  ChevronDown, Phone, Mail, User, MessageCircle, MoreVertical,
  CarFront, Camera, Monitor, Building, Trophy, Package, ChevronRight,
  Heart, Download, Truck, RotateCcw, AlertCircle, HelpCircle, FileText, ChevronLeft
} from "lucide-react";
import dayjs from "dayjs";

type TabStatus = "upcoming" | "active" | "completed" | "cancelled";

function getCategoryIcon(catName: string = "") {
  const lower = catName.toLowerCase();
  if (lower.includes("vehicle") || lower.includes("car")) return <CarFront size={14} className="text-white" />;
  if (lower.includes("camera")) return <Camera size={14} className="text-white" />;
  if (lower.includes("electronic") || lower.includes("macbook") || lower.includes("laptop")) return <Monitor size={14} className="text-white" />;
  if (lower.includes("apartment") || lower.includes("flat") || lower.includes("house")) return <Building size={14} className="text-white" />;
  if (lower.includes("sport") || lower.includes("bike")) return <Trophy size={14} className="text-white" />;
  return <Package size={14} className="text-white" />;
}

function getCategoryBadgeColor(catName: string = "") {
  const lower = catName.toLowerCase();
  if (lower.includes("vehicle") || lower.includes("car")) return "bg-indigo-100 text-indigo-700";
  if (lower.includes("camera")) return "bg-orange-100 text-orange-700";
  if (lower.includes("electronic") || lower.includes("laptop")) return "bg-blue-100 text-blue-700";
  if (lower.includes("apartment")) return "bg-emerald-100 text-emerald-700";
  if (lower.includes("sport")) return "bg-teal-100 text-teal-700";
  return "bg-slate-100 text-slate-700";
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "approved" || s === "active") {
    return (
      <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
        Active
      </span>
    );
  }
  if (s === "pending" || s === "upcoming") {
    return (
      <span className="px-3 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">
        Upcoming
      </span>
    );
  }
  if (s === "completed") {
    return (
      <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
        Completed
      </span>
    );
  }
  if (s === "cancelled" || s === "rejected") {
    return (
      <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700">
        Cancelled
      </span>
    );
  }
  return <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 capitalize">{status}</span>;
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("active");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/v1/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", notes: "Cancelled by customer" }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const s = b.status.toLowerCase();
    if (activeTab === "upcoming") return s === "pending" || s === "upcoming";
    if (activeTab === "active") return s === "approved" || s === "active";
    if (activeTab === "completed") return s === "completed";
    if (activeTab === "cancelled") return s === "cancelled" || s === "rejected";
    return true;
  });

  const upcomingCount = bookings.filter((b) => b.status.toLowerCase() === "pending" || b.status.toLowerCase() === "upcoming").length;
  const activeCount = bookings.filter((b) => b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "active").length;
  const completedCount = bookings.filter((b) => b.status.toLowerCase() === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status.toLowerCase() === "cancelled" || b.status.toLowerCase() === "rejected").length;

  const totalSpent = bookings
    .filter((b) => b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "completed" || b.status.toLowerCase() === "active")
    .reduce((acc, b) => acc + (b.total_amount || 0), 0);

  // Recommendations carousel items
  const recommendations = [
    {
      id: 1,
      title: "Canon EOS R6 Mark II",
      category: "Camera",
      rating: 4.9,
      reviews: 32,
      price: 6500,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "Apple MacBook Air M2",
      category: "Electronics",
      rating: 4.8,
      reviews: 28,
      price: 5000,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "Toyota Premio 2018",
      category: "Vehicle",
      rating: 4.7,
      reviews: 46,
      price: 3200,
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "Luxury Apartment",
      category: "Apartment",
      rating: 4.9,
      reviews: 17,
      price: 6000,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <AppShell>
      <div className="p-6 font-sans bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-7">

          {/* ── Left / Center Column (col-span-8) ─────────────────────────── */}
          <div className="xl:col-span-8 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
              <p className="text-xs text-slate-500 mt-1">Manage all your rentals in one place.</p>
            </div>

            {/* Tabs & Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { key: "upcoming", label: "Upcoming", count: upcomingCount || 4 },
                  { key: "active", label: "Active", count: activeCount || 2 },
                  { key: "completed", label: "Completed", count: completedCount || 7 },
                  { key: "cancelled", label: "Cancelled", count: cancelledCount || 1 },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as TabStatus)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === t.key
                        ? "bg-[#5B5CEB] text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      activeTab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50">
                <span>Sort by: <strong className="text-slate-900">Recent</strong></span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            {/* Booking Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse h-44" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No bookings in this status</h3>
                <p className="text-xs text-slate-500 mt-1">Check other tabs or browse available categories to make a booking.</p>
                <Link href="/categories" className="mt-4 inline-block bg-[#5B5CEB] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-200">
                  Browse Categories
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const catName = b.product?.category?.name || b.product?.title || "Vehicle";
                  const bookingIdCode = b.notes && b.notes.startsWith("RHBC") ? b.notes : `#RHBC-${b.id.slice(0, 5)}`;
                  const isUpcoming = b.status.toLowerCase() === "pending" || b.status.toLowerCase() === "upcoming";
                  const isCompleted = b.status.toLowerCase() === "completed";

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between relative"
                    >
                      {/* Left: HD Thumbnail + Category Icon Overlay + Info */}
                      <div className="flex gap-4 items-start sm:items-center">
                        <div className="relative w-36 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-inner">
                          <img
                            src={b.product?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80"}
                            alt={b.product?.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                          {/* Category Badge Overlay Icon */}
                          <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-[#5B5CEB] shadow-md flex items-center justify-center">
                            {getCategoryIcon(b.product?.title || catName)}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                              {b.product?.title || "Toyota Axio 2020"}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeColor(catName)}`}>
                              {catName}
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-400">
                            Booking ID: <span className="text-slate-600 font-bold">{bookingIdCode}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar size={13} className="text-slate-400" />
                              <span>
                                {dayjs(b.start_date).format("MMM DD, YYYY")} – {dayjs(b.end_date).format("MMM DD, YYYY")} ({b.total_days} days)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 font-medium">
                              <MapPin size={13} className="text-slate-400" />
                              <span>{b.product?.city || "Dhanmondi, Dhaka"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle/Right: Owner Avatar + Status + Price + Buttons */}
                      <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3 shrink-0">

                        <div className="flex items-center gap-4">
                          {/* Owner Info */}
                          <div className="hidden lg:flex flex-col text-right">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Owner</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                                RH
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold text-slate-800 leading-none block">Rashed Hasan</span>
                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 mt-0.5">
                                  <Star size={10} className="fill-amber-400" /> 4.8
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Price */}
                          <div className="text-right">
                            <div className="mb-1">{getStatusBadge(b.status)}</div>
                            <div className="text-lg font-black text-slate-900 leading-tight">
                              ৳ {(b.total_amount || 7500).toLocaleString()}
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium">Total Amount</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/bookings/${b.id}`}
                            className="px-4 py-2 rounded-xl border border-indigo-200 text-[#5B5CEB] hover:bg-indigo-50 text-xs font-bold transition-all shadow-sm"
                          >
                            View Details
                          </Link>

                          {isUpcoming && (
                            <button
                              onClick={() => handleCancelRequest(b.id)}
                              className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                            >
                              Cancel Request
                            </button>
                          )}

                          {isCompleted && (
                            <button className="px-3 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all">
                              Book Again
                            </button>
                          )}

                          {/* Three Dots Options Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === b.id ? null : b.id)}
                              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {openDropdownId === b.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                                <button className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <MessageCircle size={14} /> Contact Owner
                                </button>
                                <button className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Download size={14} /> Download Invoice
                                </button>
                                <button className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Truck size={14} /> Track Delivery
                                </button>
                                <button className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <RotateCcw size={14} /> Extend Rental
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── You May Like to Rent Again Carousel ────────────────────── */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-slate-900">You May Like to Rent Again</h2>
                <Link href="/categories" className="text-xs font-bold text-[#5B5CEB] hover:underline">View All</Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recommendations.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="relative h-28 rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <Heart size={12} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold">{item.category}</div>
                      <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">{item.title}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-slate-800 font-bold">{item.rating}</span>
                        <span>({item.reviews})</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 pt-0.5">
                        ৳ {item.price.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ day</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right Column: Summary & Support Widgets (col-span-4) ─────── */}
          <div className="xl:col-span-4 space-y-6">

            {/* Booking Summary Widget */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Booking Summary</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Active Rentals</div>
                      <div className="text-[10px] text-slate-400 font-medium">Currently active</div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-600">{activeCount || 2}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Upcoming Bookings</div>
                      <div className="text-[10px] text-slate-400 font-medium">In the next 7 days</div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{upcomingCount || 4}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Completed Rentals</div>
                      <div className="text-[10px] text-slate-400 font-medium">Till now</div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-blue-600">{completedCount || 7}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Total Spent</div>
                      <div className="text-[10px] text-slate-400 font-medium">All time</div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-600">৳ 35,900</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Star size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Reward Points</div>
                      <div className="text-[10px] text-slate-400 font-medium">Available to use</div>
                    </div>
                  </div>
                  <span className="text-lg font-black text-rose-600">120</span>
                </div>
              </div>
            </div>

            {/* Need Help Banner (Exact Match to Reference Image) */}
            <div className="relative rounded-[24px] overflow-hidden bg-[#5B5CEB] p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-500/20 group">
              <div className="space-y-2 z-10 max-w-[62%]">
                <h3 className="font-extrabold text-xl leading-tight">Need Help?</h3>
                <p className="text-indigo-100 text-xs leading-relaxed font-medium">
                  We're here to help you with your bookings.
                </p>
                <div className="pt-2">
                  <button className="bg-white text-[#5B5CEB] hover:bg-indigo-50 font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md transition-all active:scale-95">
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Support Agent with Headphones Avatar */}
              <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-400/40 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                  alt="Customer Support Headset"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Recent Activity</h2>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-semibold">Your booking <strong>#RHBC-23145</strong> is now active</p>
                    <span className="text-[10px] text-slate-400 font-medium">10 mins ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-semibold">Owner Rashed Hasan sent you a message</p>
                    <span className="text-[10px] text-slate-400 font-medium">1 hour ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-semibold">Payment of <strong>৳ 7,500</strong> was successful</p>
                    <span className="text-[10px] text-slate-400 font-medium">2 hours ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-semibold">Reminder: Return Toyota Axio tomorrow</p>
                    <span className="text-[10px] text-slate-400 font-medium">1 day ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-semibold">Invoice generated for <strong>#RHBC-23075</strong></p>
                    <span className="text-[10px] text-slate-400 font-medium">3 days ago</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button className="text-xs font-bold text-[#5B5CEB] hover:underline flex items-center gap-1">
                  View All Activity <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppShell>
  );
}
