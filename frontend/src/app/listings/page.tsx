"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  Star,
  MapPin,
  Tag,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  Percent,
  X,
  Zap,
} from "lucide-react";
import apiClient from "@/lib/axios";

export default function OwnerListingsPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Offer modal state
  const [selectedListingForOffer, setSelectedListingForOffer] = useState<any | null>(null);
  const [offerDiscount, setOfferDiscount] = useState<number>(15);
  const [offerTitle, setOfferTitle] = useState<string>("Host Special Offer");
  const [offerActive, setOfferActive] = useState<boolean>(true);
  const [isSavingOffer, setIsSavingOffer] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products", {
        params: {
          owner_id: user?.id,
          status: "all",
          limit: 50,
        },
      });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user?.id]);

  const handleDeleteListing = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your active rental listings?`)) return;
    try {
      await apiClient.delete(`/products/${id}`);
      showToast(`Listing "${title}" deleted.`);
      fetchListings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete listing");
    }
  };

  const openOfferModal = (item: any) => {
    setSelectedListingForOffer(item);
    setOfferDiscount(item.discount_percentage || 15);
    setOfferTitle(item.offer_title || "Host Special Offer");
    setOfferActive(item.offer_active !== undefined ? item.offer_active : true);
  };

  const handleSaveOffer = async () => {
    if (!selectedListingForOffer) return;
    try {
      setIsSavingOffer(true);
      await apiClient.patch(`/products/${selectedListingForOffer.id}/offer`, {
        discount_percentage: Number(offerDiscount),
        offer_title: offerTitle.trim() || `${offerDiscount}% OFF`,
        offer_active: offerActive,
      });
      showToast(`Discount offer updated for "${selectedListingForOffer.title}"!`);
      setSelectedListingForOffer(null);
      fetchListings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update listing offer");
    } finally {
      setIsSavingOffer(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && item.status === "PENDING") ||
      (statusFilter === "active" && (item.status === "APPROVED" || item.status === "ACTIVE") && item.is_active) ||
      (statusFilter === "inactive" && (!item.is_active || item.status === "REJECTED")) ||
      (statusFilter === "offers" && item.offer_active && item.discount_percentage > 0);

    return matchesSearch && matchesStatus;
  });

  const totalEarningsPotential = listings.reduce((sum, item) => sum + (Number(item.price_per_day) || 0) * 15, 0);

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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Rental Listings</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {listings.length} Registered Items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage your rental inventory, pricing, availability, and promotional discount offers
            </p>
          </div>

          <Link
            href="/products/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add New Listing</span>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Package size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Listings</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{listings.length} Items</h3>
              <p className="text-indigo-600 text-[11px] font-semibold mt-0.5">Live in catalog</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Active & Available</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {listings.filter((l) => (l.status === "APPROVED" || l.status === "ACTIVE") && l.is_active).length} Available
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Instant booking enabled</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <Percent size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Active Discount Offers</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {listings.filter((l) => l.offer_active && l.discount_percentage > 0).length} on Sale
              </h3>
              <p className="text-rose-600 text-[11px] font-semibold mt-0.5">Boosting renter demand</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Earnings Potential</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                ৳ {totalEarningsPotential.toLocaleString()}
              </h3>
              <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Estimated / month</p>
            </div>
          </div>
        </div>

        {/* Listings Table & Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search your listings by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Items</option>
                <option value="pending">Pending Approval ⏳</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="offers">Active Offers Only 🏷️</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Item Details</th>
                  <th className="py-3 px-3">Daily Rate & Offers</th>
                  <th className="py-3 px-3">Security Deposit</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No listings found. Click "+ Add New Listing" to publish your first item!
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((item) => {
                    const origPrice = Number(item.price_per_day) || 0;
                    const discount = item.discount_percentage || 0;
                    const hasOffer = item.offer_active && discount > 0;
                    const discountedPrice = Math.round(origPrice * (1 - discount / 100));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <Link href={`/listings/${item.slug || item.id}`} className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs group-hover:text-indigo-600 transition-colors">{item.title}</p>
                              <p className="text-slate-400 text-[11px] truncate">{item.category_name || "General"}</p>
                            </div>
                          </Link>
                        </td>

                        <td className="py-3.5 px-3">
                          {hasOffer ? (
                            <div>
                              <span className="font-bold text-rose-600 text-xs">
                                ৳ {discountedPrice.toLocaleString()}/day
                              </span>
                              <span className="text-slate-400 line-through text-[10px] ml-1.5">
                                ৳ {origPrice.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <p className="font-bold text-indigo-600 text-xs">
                              ৳ {origPrice.toLocaleString()}/day
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          ৳ {Number(item.security_deposit || item.price_per_day * 2).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {item.city || "Dhaka"}, {item.area || "Gulshan"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            ★ {item.avg_rating || "4.9"}{" "}
                            <span className="text-slate-400 font-normal text-[10px]">
                              ({item.review_count || 12})
                            </span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {item.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Approval
                            </span>
                          ) : item.status === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Rejected
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                              {item.is_active ? "Live" : "Paused"}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Offer / Discount Button */}
                            <button
                              onClick={() => openOfferModal(item)}
                              title="Set Discount / Offer"
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                hasOffer
                                  ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                              }`}
                            >
                              <Tag size={12} />
                              <span>{hasOffer ? `${item.discount_percentage}% OFF` : "Offer"}</span>
                            </button>

                            <Link
                              href={`/listings/${item.slug || item.id}`}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                              title="Manage listing"
                            >
                              <Eye size={13} />
                            </Link>

                            <button
                              onClick={() => handleDeleteListing(item.id, item.title)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Edit Listing Offer Modal ── */}
        {selectedListingForOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Manage Listing Offer</h3>
                    <p className="text-xs text-slate-500 truncate max-w-[240px]">
                      {selectedListingForOffer.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedListingForOffer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Price Calculation Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Regular Rate:</span>
                  <span className="font-mono line-through">
                    ৳ {Number(selectedListingForOffer.price_per_day).toLocaleString()}/day
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      Promotional Offer Price
                    </p>
                    <h2 className="text-2xl font-black text-white">
                      ৳{" "}
                      {offerActive && offerDiscount > 0
                        ? Math.round(
                            selectedListingForOffer.price_per_day * (1 - offerDiscount / 100)
                          ).toLocaleString()
                        : Number(selectedListingForOffer.price_per_day).toLocaleString()}
                      <span className="text-xs font-normal text-slate-300"> / day</span>
                    </h2>
                  </div>

                  {offerActive && offerDiscount > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md">
                      {offerDiscount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Preset Discount Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Discount Percentage</label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setOfferDiscount(pct);
                        setOfferActive(true);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        offerDiscount === pct && offerActive
                          ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Offer / Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Host Flash Deal, Weekend Promo, Eid Deal"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Offer Status</p>
                  <p className="text-[11px] text-slate-500">
                    {offerActive ? "Active & showing on rental listing" : "Paused / standard rate applied"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOfferActive(!offerActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    offerActive ? "bg-rose-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      offerActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {selectedListingForOffer.offer_active && (
                  <button
                    type="button"
                    onClick={() => {
                      setOfferDiscount(0);
                      setOfferActive(false);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Remove Offer
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedListingForOffer(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isSavingOffer}
                    onClick={handleSaveOffer}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingOffer && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Offer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
