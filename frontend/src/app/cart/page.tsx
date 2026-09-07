"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import {
  ShoppingCart, Trash2, Calendar, ShieldCheck, ShieldAlert, ArrowRight, CheckCircle2,
  AlertCircle, MapPin, Building, ChevronRight, User, Loader2, MessageCircle
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";

export default function RentalCartPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, removeItem, updateDates, clearCart } = useCartStore();
  
  const [submitting, setSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [chatWarningOwner, setChatWarningOwner] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const isVerified =
    user?.identity_verification_status === "VERIFIED" ||
    user?.is_identity_verified === true;

  // Calculate pricing breakdown
  const subtotal = items.reduce((acc, item) => acc + (item.price_per_day * 3), 0);
  const totalDeposit = items.reduce((acc, item) => acc + (item.security_deposit || 2000), 0);
  const serviceFee = Math.round(subtotal * 0.06);
  const grandTotal = subtotal + totalDeposit + serviceFee;

  // Group items by owner
  const groupedByOwner: Record<string, typeof items> = {};
  items.forEach((item) => {
    const ownerKey = item.owner_name || "Verified Owner";
    if (!groupedByOwner[ownerKey]) groupedByOwner[ownerKey] = [];
    groupedByOwner[ownerKey].push(item);
  });

  const handleSendAllRequests = async () => {
    if (items.length === 0) return;
    setBookingError(null);

    if (!isAuthenticated || !user) {
      router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    if (!isVerified) {
      const returnUrl = "/cart";
      sessionStorage.setItem("renthub_verify_return_url", returnUrl);
      router.push(`/verify-identity?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.id.startsWith("cart-") ? "00000000-0000-0000-0000-000000000001" : i.id,
          start_date: i.start_date || new Date().toISOString().split("T")[0],
          end_date: i.end_date || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          delivery_option: i.delivery_option || "pickup",
        })),
      };

      const res = await apiClient.post("/bookings/multi", payload);
      setSuccessResponse(res.data);
      clearCart();
    } catch (err: any) {
      console.error("Multi-booking error:", err);
      if (
        err.response?.status === 403 &&
        err.response?.data?.error?.code === "IDENTITY_VERIFICATION_REQUIRED"
      ) {
        const returnUrl = "/cart";
        sessionStorage.setItem("renthub_verify_return_url", returnUrl);
        router.push(`/verify-identity?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }
      setBookingError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        "Failed to send booking requests. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 font-sans bg-[#F8FAFC] min-h-screen text-slate-800">
        <div className="max-w-[1240px] mx-auto space-y-6">

          {/* Breadcrumb Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <ChevronRight size={12} />
              <span className="text-slate-900 font-extrabold">Rental Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart size={28} className="text-indigo-600" /> My Rental Cart
              <span className="text-sm font-extrabold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </h1>
          </div>

          {/* Identity Verification Warning Banner if logged in and unverified */}
          {isAuthenticated && !isVerified && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                    Identity Verification Required
                    <span className="text-[10px] uppercase font-black bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md">
                      Action Needed
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
                    RentHub requires National ID & facial verification before submitting booking requests to protect lenders.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem("renthub_verify_return_url", "/cart");
                  router.push(`/verify-identity?returnUrl=${encodeURIComponent("/cart")}`);
                }}
                className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-600/20 transition-all shrink-0 flex items-center justify-center gap-1.5"
              >
                Verify Identity Now <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Booking Error Alert Banner */}
          {bookingError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Success Banner Overlay after checkout */}
          {successResponse ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Booking Requests Sent!</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {successResponse.message || "Your booking requests have been dispatched to each item's owner individually."}
              </p>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-xs text-left space-y-2 text-emerald-900">
                <div className="font-extrabold">Notified Item Owners:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                  {(successResponse.owners || Object.keys(groupedByOwner)).map((owner: string, i: number) => (
                    <li key={i}>Request sent to <strong>{owner}</strong> for approval</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex gap-3">
                <Link
                  href="/bookings"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all text-center"
                >
                  View My Bookings Status
                </Link>
                <Link
                  href="/"
                  className="px-5 py-3 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <ShoppingCart size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Your rental cart is empty</h3>
              <p className="text-xs text-slate-400">
                Browse our categories or weekly deals to add items from multiple owners to your cart.
              </p>
              <Link
                href="/categories"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Browse Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
              
              {/* ── Left Column: Items Grouped by Owner (col-span-8) ───────── */}
              <div className="xl:col-span-8 space-y-6">

                {Object.entries(groupedByOwner).map(([ownerName, ownerItems], groupIdx) => (
                  <div key={groupIdx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    
                    {/* Owner Group Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Item Owner</span>
                            <h3 className="font-extrabold text-slate-900 text-sm">{ownerName}</h3>
                          </div>
                          <button 
                            onClick={() => {
                              if (!isAuthenticated || !user) {
                                router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`);
                                return;
                              }
                              setChatWarningOwner(ownerName);
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors w-fit sm:mt-3"
                          >
                            <MessageCircle size={12} /> Chat
                          </button>
                        </div>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full shrink-0 w-fit">
                        {ownerItems.length} {ownerItems.length === 1 ? "Request" : "Requests"}
                      </span>
                    </div>

                    {chatWarningOwner === ownerName && (
                      <div className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex items-start gap-1.5 animate-in fade-in">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        Please send your booking requests first to initiate a chat with this owner.
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-4">
                      {ownerItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Link href={`/products/${item.slug || item.id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200/60 block hover:opacity-80 transition-opacity">
                              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            </Link>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] font-extrabold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                {item.category || "General"}
                              </span>
                              <Link href={`/products/${item.slug || item.id}`} className="block">
                                <h4 className="font-extrabold text-slate-900 text-sm truncate max-w-[220px] hover:text-indigo-600 transition-colors">
                                  {item.title}
                                </h4>
                              </Link>
                              <p className="text-xs text-slate-500 font-medium">
                                ৳ {item.price_per_day.toLocaleString()} <span className="text-[10px] text-slate-400">/ day</span>
                              </p>
                            </div>
                          </div>

                          {/* Rental Period & Controls */}
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">
                            <div className="text-right space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <Calendar size={11} className="text-indigo-500" /> May 25 - May 28 (3 Days)
                              </div>
                              <div className="text-sm font-extrabold text-slate-900">
                                ৳ {(item.price_per_day * 3).toLocaleString()}
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                              title="Remove Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}

              </div>

              {/* ── Right Column: Grand Total & Dispatch Button (col-span-4) ───── */}
              <div className="xl:col-span-4 space-y-6">

                {/* Summary Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">Multi-Rental Order Summary</h3>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Items Total ({items.length} items)</span>
                      <span className="font-bold text-slate-800">৳ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Security Deposit (Refundable)</span>
                      <span className="font-bold text-slate-800">৳ {totalDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform Service Fee (6%)</span>
                      <span className="font-bold text-slate-800">৳ {serviceFee.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="font-extrabold text-slate-900 text-sm">Estimated Grand Total</span>
                      <span className="text-xl font-black text-indigo-600">৳ {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {isAuthenticated && !isVerified ? (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        National ID and facial verification are required before your rental requests can be sent.
                      </span>
                    </div>
                  ) : (
                    <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                      <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        Booking requests will be sent simultaneously to <strong>{Object.keys(groupedByOwner).length} distinct item owners</strong> for approval.
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleSendAllRequests}
                    disabled={submitting}
                    className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      isAuthenticated && !isVerified
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Dispatching Requests...
                      </>
                    ) : isAuthenticated && !isVerified ? (
                      <>
                        Verify Identity to Request Booking <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        Send Requests to All Owners ({items.length} Items) <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => clearCart()}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-rose-600 hover:underline pt-1"
                  >
                    Clear All Cart Items
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
