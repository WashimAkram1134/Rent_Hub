"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import {
  ArrowLeft, Calendar, MapPin, Star, ShieldCheck, CheckCircle2, Check,
  Clock, Download, MessageCircle, RotateCcw, AlertTriangle, Phone, Mail,
  CarFront, Camera, Monitor, Building, Trophy, Package, Headphones, ChevronRight, User
} from "lucide-react";
import dayjs from "dayjs";

import { PaymentModal } from "@/components/common/PaymentModal";

type TabType = "details" | "owner" | "payment" | "timeline";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paidTrxId, setPaidTrxId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/bookings`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const found = list.find((b: any) => b.id === resolvedParams.id || b.notes === resolvedParams.id);
        if (found) {
          setBooking(found);
        } else if (list.length > 0) {
          // Fallback to first booking for demo if ID param differs
          setBooking(list[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-500 font-sans min-h-screen bg-[#F8FAFC]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading booking details...
        </div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-500 font-sans min-h-screen bg-[#F8FAFC]">
          <h2 className="text-xl font-bold text-slate-800">Booking not found</h2>
          <Link href="/bookings" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
            ← Back to My Bookings
          </Link>
        </div>
      </AppShell>
    );
  }

  const prod = booking.product || {};
  const renter = booking.renter || {};
  const owner = booking.owner || {};

  const galleryImages = [
    prod.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
  ];

  const bookingCode = booking.notes && booking.notes.startsWith("RHBC") ? booking.notes : `#RHBC-${booking.id.slice(0, 5)}`;
  const days = booking.total_days || 3;
  const pricePerDay = booking.daily_rate || 2500;
  const subtotal = booking.subtotal || pricePerDay * days;
  const serviceFee = 300;
  const taxVat = 225;
  const totalAmount = subtotal + serviceFee + taxVat;

  const isPending = booking.status.toLowerCase() === "pending";
  const isActive = booking.status.toLowerCase() === "approved" || booking.status.toLowerCase() === "active";
  const isCompleted = booking.status.toLowerCase() === "completed";

  return (
    <AppShell>
      <div className="p-6 font-sans bg-[#F8FAFC] min-h-screen text-slate-800">
        <div className="max-w-[1360px] mx-auto space-y-6">

          {/* Top Breadcrumb Header */}
          <div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to My Bookings
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Booking Details</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                    isActive ? "bg-emerald-100 text-emerald-700" : isPending ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {isActive ? "Active" : booking.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Booking ID: <strong className="text-slate-700 font-bold">{bookingCode}</strong> · Placed on May 20, 2025 at 10:30 AM
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">

            {/* ── Left / Center Column (col-span-8) ─────────────────────────── */}
            <div className="xl:col-span-8 space-y-6">

              {/* Hero Image Gallery + Specs Header Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Gallery (5 cols) */}
                <div className="md:col-span-6 space-y-3">
                  <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                    <img
                      src={galleryImages[activeImgIndex]}
                      alt="Main display"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="grid grid-cols-5 gap-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`relative h-12 rounded-xl overflow-hidden bg-slate-100 border transition-all ${
                          activeImgIndex === idx ? "ring-2 ring-indigo-600 border-indigo-600" : "border-slate-200 hover:opacity-80"
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        {idx === 4 && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-bold">
                            +8
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Middle Specifications & Duration Info (7 cols) */}
                <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block">
                      {prod.category?.name || "Vehicle"}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                      {prod.title || "Toyota Axio 2020"}
                    </h2>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={13} className="fill-amber-400" /> 4.6 <span className="text-slate-400 font-normal">(48 reviews)</span>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="text-slate-400"><CarFront size={15} /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Transmission</p>
                          <p className="font-bold text-slate-800 text-xs">Automatic</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="text-slate-400"><Package size={15} /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Fuel Type</p>
                          <p className="font-bold text-slate-800 text-xs">Petrol</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="text-slate-400"><User size={15} /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Seating</p>
                          <p className="font-bold text-slate-800 text-xs">5 Seats</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="text-slate-400"><Trophy size={15} /></div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Mileage</p>
                          <p className="font-bold text-slate-800 text-xs">16-18 km/l</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1 pt-1 font-medium">
                      <MapPin size={13} className="text-slate-400" /> {prod.city || "Dhanmondi, Dhaka"}
                    </div>
                  </div>

                  {/* Rental Period Card Box */}
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-3">
                    <div>
                      <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Rental Period</div>
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
                        <Calendar size={14} className="text-indigo-600 shrink-0" />
                        <span>May 25, 2025 (10:00 AM) to May 28, 2025 (10:00 AM)</span>
                      </div>
                      <span className="inline-block mt-1.5 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                        {days} Days
                      </span>
                    </div>

                    <div className="pt-2 border-t border-indigo-100/80 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={13} className="text-indigo-500 shrink-0" />
                        <span><strong>Pickup Location:</strong> Dhanmondi, Dhaka</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={13} className="text-indigo-500 shrink-0" />
                        <span><strong>Return Location:</strong> Dhanmondi, Dhaka</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-6 border-b border-slate-200 px-2 text-xs font-bold text-slate-500">
                {[
                  { key: "details", label: "Item Details" },
                  { key: "owner", label: "Owner Details" },
                  { key: "payment", label: "Payment Details" },
                  { key: "timeline", label: "Activity Timeline" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as TabType)}
                    className={`pb-3 transition-all relative ${
                      activeTab === t.key ? "text-indigo-600 font-extrabold" : "hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                    {activeTab === t.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Section */}
              {activeTab === "details" && (
                <div className="space-y-6">

                  {/* About & Specifications */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-2">About this Vehicle</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Well maintained Toyota Axio 2020 in excellent condition. Perfect for city driving with great fuel efficiency and smooth performance. Clean interior, non-smoker previous rentals, regular servicing completed.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">Air Conditioning</span></div>
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">Bluetooth Connectivity</span></div>
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">Back Camera</span></div>
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">Power Steering</span></div>
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">ABS Braking System</span></div>
                        <div className="flex items-center gap-2 text-indigo-600"><Check size={14} className="stroke-[3]" /><span className="text-slate-700">Dual Airbags</span></div>
                      </div>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                        <div><span className="text-slate-400 block text-[10px]">Brand</span><strong className="text-slate-800">Toyota</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Doors</span><strong className="text-slate-800">4</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Model</span><strong className="text-slate-800">Axio 2020</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Transmission</span><strong className="text-slate-800">Automatic</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Year</span><strong className="text-slate-800">2020</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Fuel Type</span><strong className="text-slate-800">Petrol</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Color</span><strong className="text-slate-800">Black</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Minimum Driver Age</span><strong className="text-slate-800">21+</strong></div>
                      </div>

                      <button className="mt-4 px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors">
                        View Full Specifications
                      </button>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">Reviews (48)</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star size={12} className="fill-amber-400" /> 4.6
                        </div>
                      </div>
                      <button className="text-xs font-bold text-indigo-600 hover:underline">See All Reviews</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Rating Bars (4 cols) */}
                      <div className="md:col-span-4 space-y-1.5 text-xs text-slate-500">
                        {[
                          { stars: "5 Stars", count: 32, pct: "70%" },
                          { stars: "4 Stars", count: 10, pct: "20%" },
                          { stars: "3 Stars", count: 4, pct: "8%" },
                          { stars: "2 Stars", count: 1, pct: "2%" },
                          { stars: "1 Star", count: 1, pct: "2%" },
                        ].map((r) => (
                          <div key={r.stars} className="flex items-center gap-2">
                            <span className="w-12 text-[10px] font-semibold">{r.stars}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: r.pct }} />
                            </div>
                            <span className="w-5 text-right text-[10px] font-bold text-slate-700">{r.count}</span>
                          </div>
                        ))}
                      </div>

                      {/* Review Cards (8 cols) */}
                      <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                              SH
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-none">Sabbir Hossain</div>
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-0.5">
                                <Star size={10} className="fill-amber-400" /> 5.0 <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1 rounded font-bold">Verified</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            "Excellent car! Smooth drive and very fuel efficient. Owner was very friendly and professional."
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center">
                              NJ
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-none">Nusrat Jahan</div>
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-0.5">
                                <Star size={10} className="fill-amber-400" /> 4.0 <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1 rounded font-bold">Verified</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            "Good condition car. Pickup and return process was very easy and convenient."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Details Card */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Owner Details</h3>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                          RH
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-base">Rashed Hasan</h4>
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Super Owner
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Member since January 2022</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star size={12} className="fill-amber-400" /> 4.8 <span className="text-slate-400 font-normal">(128 reviews)</span>
                            </span>
                            <span>· Typically replies within 1 hour</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Response Rate</span>
                          <strong className="text-slate-900 font-extrabold text-sm">98%</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Total Listings</span>
                          <strong className="text-slate-900 font-extrabold text-sm">24</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Total Bookings</span>
                          <strong className="text-slate-900 font-extrabold text-sm">186</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === "payment" && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Payment & Escrow Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Payment Status</span>
                      <span className="inline-block bg-emerald-100 text-emerald-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                        ✓ PAID & HELD IN ESCROW
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Payment Gateway / Method</span>
                      <strong className="text-slate-900 font-extrabold text-xs">bKash / Nagad / Credit Card</strong>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Transaction Reference ID</span>
                      <strong className="text-indigo-600 font-mono font-bold text-xs">{paidTrxId || "TXN-RH-849201"}</strong>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Escrow Protection</span>
                      <span className="text-emerald-600 font-bold text-xs">100% Refund Guaranteed</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/payments/invoice/${booking.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      <Download size={15} /> Download Official Printable Invoice
                    </Link>
                  </div>
                </div>
              )}

            </div>

            {/* ── Right Column: Summary & Actions Widgets (col-span-4) ─────── */}
            <div className="xl:col-span-4 space-y-6">

              {/* Booking Summary Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Booking Summary</h2>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price per day</span>
                    <span className="font-bold text-slate-800">৳ {pricePerDay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-bold text-slate-800">{days} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-bold text-slate-800">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service Fee</span>
                    <span className="font-bold text-slate-800">৳ {serviceFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax & VAT</span>
                    <span className="font-bold text-slate-800">৳ {taxVat}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm">Total Amount</span>
                    <span className="text-xl font-black text-indigo-600">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Booking Status Widget */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Booking Status</h3>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-extrabold text-slate-900 text-sm">Active</span>
                </div>
                <p className="text-xs text-slate-500">This booking is currently active.</p>
                <p className="text-[11px] text-slate-400 font-semibold">Ends on May 28, 2025 at 10:00 AM</p>
              </div>

              {/* Action Buttons Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1">Actions</h3>

                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} /> Pay Now (Escrow Secured)
                </button>

                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  <MessageCircle size={15} /> Contact Owner
                </button>

                <Link
                  href={`/payments/invoice/${booking.id}`}
                  target="_blank"
                  className="w-full py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Download Printable Invoice
                </Link>

                <button className="w-full py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors">
                  Request Cancellation
                </button>
              </div>

              {/* Need Help Banner (Matches Reference Image) */}
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

                <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-400/40 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                    alt="Support Agent"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Payment Checkout Modal */}
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          booking={booking}
          onSuccess={(trxId) => {
            setPaidTrxId(trxId);
            setBooking((prev: any) => ({ ...prev, status: "approved", notes: `Paid via Escrow (TrxID: ${trxId})` }));
          }}
        />

      </div>
    </AppShell>
  );
}
