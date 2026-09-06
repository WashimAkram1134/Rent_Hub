"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  ExternalLink,
  Tag,
  Percent,
  SlidersHorizontal,
  Star,
  User,
  MapPin,
  Sparkles,
  Zap,
  Filter,
  X,
  Package,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";

export default function AdminListingsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchItemName, setSearchItemName] = useState("");
  const [searchOwnerName, setSearchOwnerName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedOfferStatus, setSelectedOfferStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  // Bulk Offer Modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkScope, setBulkScope] = useState<"all" | "category">("all");
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const [bulkDiscount, setBulkDiscount] = useState<number>(20);
  const [bulkOfferTitle, setBulkOfferTitle] = useState<string>("Eid Mega Promo");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Single Item Offer Modal state
  const [selectedProductForOffer, setSelectedProductForOffer] = useState<any | null>(null);
  const [singleDiscount, setSingleDiscount] = useState<number>(15);
  const [singleOfferTitle, setSingleOfferTitle] = useState<string>("Admin Special Deal");
  const [singleOfferActive, setSingleOfferActive] = useState<boolean>(true);
  const [isSavingSingleOffer, setIsSavingSingleOffer] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isAdmin = user?.primary_role === "admin";

  const loadData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        apiClient.get("/products?status=all&limit=150"),
        apiClient.get("/categories").catch(() => ({ data: [] })),
      ]);
      setProducts(Array.isArray(resProd.data) ? resProd.data : []);
      setCategories(Array.isArray(resCat.data) ? resCat.data : []);
      if (Array.isArray(resCat.data) && resCat.data.length > 0 && !bulkCategoryId) {
        setBulkCategoryId(resCat.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadData();
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

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/products/${id}/status`, { status });
      showToast(`Listing status updated to ${status}`);
      loadData();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      showToast("Listing deleted successfully");
      loadData();
    } catch (e) {
      alert("Failed to delete listing.");
    }
  };

  // 1-Click Bulk Offer Handler
  const handleApplyBulkOffer = async () => {
    try {
      setIsSubmittingBulk(true);
      const payload = {
        scope: bulkScope,
        category_id: bulkScope === "category" ? bulkCategoryId : undefined,
        discount_percentage: Number(bulkDiscount),
        offer_title: bulkOfferTitle.trim() || `${bulkDiscount}% OFF Campaign`,
        action: "apply",
      };
      const res = await apiClient.post("/products/admin/bulk-offer", payload);
      showToast(res.data.message || "Bulk offer applied successfully!");
      setShowBulkModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to apply bulk offer");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // 1-Click Clear All Offers
  const handleClearAllOffers = async () => {
    if (!confirm("Are you sure you want to remove all active promotional discounts across the platform?")) return;
    try {
      setIsSubmittingBulk(true);
      const res = await apiClient.post("/products/admin/bulk-offer", {
        scope: "all",
        action: "remove",
      });
      showToast(res.data.message || "All offers removed successfully!");
      setShowBulkModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to remove offers");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Single Item Offer Save Handler
  const handleSaveSingleOffer = async () => {
    if (!selectedProductForOffer) return;
    try {
      setIsSavingSingleOffer(true);
      await apiClient.patch(`/products/${selectedProductForOffer.id}/offer`, {
        discount_percentage: Number(singleDiscount),
        offer_title: singleOfferTitle.trim() || `${singleDiscount}% OFF`,
        offer_active: singleOfferActive,
      });
      showToast(`Offer updated for "${selectedProductForOffer.title}"!`);
      setSelectedProductForOffer(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update offer");
    } finally {
      setIsSavingSingleOffer(false);
    }
  };

  const openSingleOfferModal = (p: any) => {
    setSelectedProductForOffer(p);
    setSingleDiscount(p.discount_percentage || 15);
    setSingleOfferTitle(p.offer_title || "Special Deal");
    setSingleOfferActive(p.offer_active !== undefined ? p.offer_active : true);
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search by Item Name
        if (searchItemName.trim()) {
          const q = searchItemName.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Search by Owner Name or Email
        if (searchOwnerName.trim()) {
          const q = searchOwnerName.toLowerCase();
          const matchOwnerName = p.owner_name?.toLowerCase().includes(q);
          const matchOwnerEmail = p.owner_email?.toLowerCase().includes(q);
          if (!matchOwnerName && !matchOwnerEmail) return false;
        }

        // Category Filter
        if (selectedCategory !== "all") {
          if (p.category_id !== selectedCategory && p.category_name?.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Price Filter
        const price = Number(p.price_per_day) || 0;
        if (selectedPriceRange === "under1000" && price >= 1000) return false;
        if (selectedPriceRange === "1000to5000" && (price < 1000 || price > 5000)) return false;
        if (selectedPriceRange === "5000to15000" && (price < 5000 || price > 15000)) return false;
        if (selectedPriceRange === "above15000" && price <= 15000) return false;

        // Rating Filter
        const rating = Number(p.avg_rating) || 0;
        if (selectedRating === "4.5" && rating < 4.5) return false;
        if (selectedRating === "4.0" && rating < 4.0) return false;
        if (selectedRating === "3.5" && rating < 3.5) return false;

        // Offer Status Filter
        if (selectedOfferStatus === "offers_only" && (!p.offer_active || !p.discount_percentage)) return false;
        if (selectedOfferStatus === "no_offers" && p.offer_active && p.discount_percentage > 0) return false;

        // Status Filter
        if (statusFilter !== "all" && p.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return Number(a.price_per_day) - Number(b.price_per_day);
        if (sortBy === "price_desc") return Number(b.price_per_day) - Number(a.price_per_day);
        if (sortBy === "rating_desc") return (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0);
        if (sortBy === "discount_desc") return (Number(b.discount_percentage) || 0) - (Number(a.discount_percentage) || 0);
        return 0; // Default newest
      });
  }, [
    products,
    searchItemName,
    searchOwnerName,
    selectedCategory,
    selectedPriceRange,
    selectedRating,
    selectedOfferStatus,
    statusFilter,
    sortBy,
  ]);

  const totalOffersCount = products.filter((p) => p.offer_active && p.discount_percentage > 0).length;

  const resetAllFilters = () => {
    setSearchItemName("");
    setSearchOwnerName("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSelectedRating("all");
    setSelectedOfferStatus("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header & 1-Click Campaign Action ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Package size={14} />
            <span>Platform Inventory Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Listings & Campaign Offers 🏷️
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Control platform listings, set 1-click global/category promotional discounts, and audit host inventory.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Zap size={16} className="fill-white" />
            <span>⚡ 1-Click Campaign / Offer</span>
          </button>

          <button
            onClick={loadData}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Refresh Listings"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Listings</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{products.length} Items</h3>
            <p className="text-indigo-600 text-[11px] font-semibold mt-0.5">Platform catalog</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Active Campaign Offers</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalOffersCount} on Sale</h3>
            <p className="text-rose-600 text-[11px] font-semibold mt-0.5">
              {Math.round((totalOffersCount / (products.length || 1)) * 100)}% of platform
            </p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Approved & Live</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {products.filter((p) => p.status === "APPROVED" || p.status === "ACTIVE").length} Live
            </h3>
            <p className="text-emerald-600 text-[11px] font-semibold mt-0.5">Rentable by users</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Pending Review</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {products.filter((p) => p.status === "PENDING").length} Items
            </h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Awaiting verification</p>
          </div>
        </div>
      </div>

      {/* ── Advanced Multi-Parameter Search & Filter Toolbar ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Search & Multi-Filters</h3>
            <span className="text-xs text-slate-400 font-medium">
              (Showing {filteredProducts.length} of {products.length} listings)
            </span>
          </div>

          <button
            onClick={resetAllFilters}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>

        {/* Row 1: Item Name Search & Owner Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Item Name Search */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Search Item Name</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Toyota Axio, MacBook, Canon R6..."
                value={searchItemName}
                onChange={(e) => setSearchItemName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* 2. Owner Name / Email Search */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Search Owner / Host</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Jahid, Washim, host@renthub.com..."
                value={searchOwnerName}
                onChange={(e) => setSearchOwnerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* 3. Category Dropdown */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Price Range, Rating, Offer Status, and Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* 4. Price Range */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Price Range</label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Daily Rates</option>
              <option value="under1000">&lt; ৳ 1,000 / day</option>
              <option value="1000to5000">৳ 1,000 - ৳ 5,000 / day</option>
              <option value="5000to15000">৳ 5,000 - ৳ 15,000 / day</option>
              <option value="above15000">&gt; ৳ 15,000 / day</option>
            </select>
          </div>

          {/* 5. Rating Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Minimum Rating</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">★ 4.5+ Rating</option>
              <option value="4.0">★ 4.0+ Rating</option>
              <option value="3.5">★ 3.5+ Rating</option>
            </select>
          </div>

          {/* 6. Offer Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Promotional Offer</label>
            <select
              value={selectedOfferStatus}
              onChange={(e) => setSelectedOfferStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Listings</option>
              <option value="offers_only">🏷️ On Sale / Offer Active</option>
              <option value="no_offers">Standard Price Only</option>
            </select>
          </div>

          {/* 7. Sort By */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated ★</option>
              <option value="discount_desc">Highest Discount %</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Listings Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-3">Owner / Host</th>
                <th className="py-3 px-3">Category & Area</th>
                <th className="py-3 px-3">Daily Rate & Offers</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Loading listings catalog...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <Package size={32} className="text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No listings match your search criteria</p>
                    <button
                      onClick={resetAllFilters}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasOffer = p.offer_active && p.discount_percentage > 0;
                  const origPrice = Number(p.price_per_day) || 0;
                  const discountedPrice = hasOffer
                    ? Math.round(origPrice * (1 - p.discount_percentage / 100))
                    : origPrice;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Item Details */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/products/${p.slug || p.id}`}
                          className="flex items-center gap-3 group cursor-pointer"
                        >
                          <div className="w-12 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 line-clamp-1">
                              {p.title}
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(0, 8)}</span>
                          </div>
                        </Link>
                      </td>

                      {/* 2. Owner Details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {p.owner_name ? p.owner_name[0] : "H"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{p.owner_name || "Verified Host"}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{p.owner_email || "host@renthub.com"}</p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Category & Area */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {p.category_name || "General"}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            {p.area ? `${p.area}, ` : ""}{p.city || "Dhaka"}
                          </p>
                        </div>
                      </td>

                      {/* 4. Daily Rate & Offers */}
                      <td className="py-3.5 px-3">
                        {hasOffer ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-emerald-600 text-xs">
                                ৳ {discountedPrice.toLocaleString()}/day
                              </span>
                              <span className="text-slate-400 line-through text-[10px]">
                                ৳ {origPrice.toLocaleString()}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black">
                              <Tag size={9} /> {p.discount_percentage}% OFF ({p.offer_title || "Special Deal"})
                            </span>
                          </div>
                        ) : (
                          <p className="font-bold text-indigo-600 text-xs">
                            ৳ {origPrice.toLocaleString()}/day
                          </p>
                        )}
                      </td>

                      {/* 5. Rating */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          ★ {Number(p.avg_rating || 4.8).toFixed(1)}{" "}
                          <span className="text-slate-400 font-normal text-[10px]">
                            ({p.review_count || 15})
                          </span>
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.status === "APPROVED" || p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "APPROVED" || p.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : p.status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Offer Button */}
                          <button
                            onClick={() => openSingleOfferModal(p)}
                            title="Edit Listing Offer"
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              hasOffer
                                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            }`}
                          >
                            <Tag size={11} />
                            <span>{hasOffer ? `${p.discount_percentage}%` : "Offer"}</span>
                          </button>

                          {/* Approve / Suspend Toggle */}
                          {p.status === "PENDING" ? (
                            <button
                              onClick={() => handleStatusUpdate(p.id, "APPROVED")}
                              className="p-1.5 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Approve Listing"
                            >
                              <CheckCircle size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  p.id,
                                  p.status === "APPROVED" ? "SUSPENDED" : "APPROVED"
                                )
                              }
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                              title={p.status === "APPROVED" ? "Suspend Listing" : "Approve Listing"}
                            >
                              {p.status === "APPROVED" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
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

      {/* ── ⚡ 1-Click Admin Campaign / Bulk Offer Modal ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <Zap size={20} className="fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">1-Click Campaign Offers</h3>
                  <p className="text-xs text-slate-500">Apply discounts platform-wide or category-wise</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scope Selection: All Items vs Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Campaign Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkScope("all")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    bulkScope === "all"
                      ? "bg-indigo-50/60 border-indigo-500 text-indigo-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs font-black">All Platform Listings</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Apply to all {products.length} items</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkScope("category")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    bulkScope === "category"
                      ? "bg-indigo-50/60 border-indigo-500 text-indigo-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs font-black">Category-Wise</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Specific category only</p>
                </button>
              </div>
            </div>

            {/* Category Selector (when Category-Wise is chosen) */}
            {bulkScope === "category" && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-slate-700 block">Target Category</label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Preset Discount Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Discount Percentage</label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 15, 20, 25, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setBulkDiscount(pct)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bulkDiscount === pct
                        ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. Eid-ul-Fitr Mega Holiday Sale 🎉"
                value={bulkOfferTitle}
                onChange={(e) => setBulkOfferTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAllOffers}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Clear All Platform Offers
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmittingBulk}
                  onClick={handleApplyBulkOffer}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingBulk && <Loader2 size={13} className="animate-spin" />}
                  <span>
                    Apply {bulkDiscount}% to {bulkScope === "all" ? "All Items" : "Category"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Single Listing Offer Modal ── */}
      {selectedProductForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Set Listing Offer</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {selectedProductForOffer.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForOffer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Price Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Original Rate:</span>
                <span className="font-mono line-through">
                  ৳ {Number(selectedProductForOffer.price_per_day).toLocaleString()}/day
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                    Discounted Offer Price
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    ৳{" "}
                    {singleOfferActive && singleDiscount > 0
                      ? Math.round(
                          selectedProductForOffer.price_per_day * (1 - singleDiscount / 100)
                        ).toLocaleString()
                      : Number(selectedProductForOffer.price_per_day).toLocaleString()}
                    <span className="text-xs font-normal text-slate-300"> / day</span>
                  </h2>
                </div>

                {singleOfferActive && singleDiscount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md">
                    {singleDiscount}% OFF
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
                      setSingleDiscount(pct);
                      setSingleOfferActive(true);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      singleDiscount === pct && singleOfferActive
                        ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Offer Title</label>
              <input
                type="text"
                placeholder="e.g. Platform Special Deal, Weekend Promo"
                value={singleOfferTitle}
                onChange={(e) => setSingleOfferTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">Offer Status</p>
                <p className="text-[11px] text-slate-500">
                  {singleOfferActive ? "Active on listing" : "Paused / Regular rate"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSingleOfferActive(!singleOfferActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  singleOfferActive ? "bg-rose-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    singleOfferActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedProductForOffer.offer_active && (
                <button
                  type="button"
                  onClick={() => {
                    setSingleDiscount(0);
                    setSingleOfferActive(false);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Remove Offer
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedProductForOffer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSavingSingleOffer}
                  onClick={handleSaveSingleOffer}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSingleOffer && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Offer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
