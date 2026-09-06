"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  DollarSign,
  Car,
  Fuel,
  Users,
  Settings,
  Shield,
  Star,
  MessageSquare,
  Eye,
  Edit2,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Package,
  Sparkles,
  Loader2,
  ArrowLeft,
  Tag,
} from "lucide-react";

export default function OwnerListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "analytics">("bookings");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    price_per_day: "",
    security_deposit: "",
    condition: "Good",
    delivery_option: "both",
    city: "Dhaka",
    area: "Gulshan-2",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadListingData = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${slug}`);
      const prodData = res.data;
      setProduct(prodData);
      setEditForm({
        title: prodData.title || "",
        price_per_day: prodData.price_per_day?.toString() || "",
        security_deposit: prodData.security_deposit?.toString() || "",
        condition: prodData.condition || "Good",
        delivery_option: prodData.delivery_option || "both",
        city: prodData.city || "Dhaka",
        area: prodData.area || "Gulshan-2",
        description: prodData.description || "",
      });

      // Load bookings for this product
      if (prodData.id) {
        const bRes = await apiClient.get("/bookings", {
          params: { product_id: prodData.id, limit: 50 },
        }).catch(() => ({ data: [] }));
        setBookings(Array.isArray(bRes.data) ? bRes.data : []);
      }
    } catch (err) {
      console.error("Failed to load listing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListingData();
  }, [slug]);

  const images: string[] = product
    ? [
        ...(product.images?.map((img: any) => img.url) || []),
        ...(product.image_url && !product.images?.some((i: any) => i.url === product.image_url)
          ? [product.image_url]
          : []),
      ]
    : [];

  const handleToggleActive = async () => {
    if (!product) return;
    const newActive = !product.is_active;
    try {
      await apiClient.patch(`/products/${product.id}`, { is_active: newActive });
      setProduct({ ...product, is_active: newActive });
      showToast(newActive ? "Listing is now Active and visible to customers!" : "Listing has been paused.");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update listing status.");
    }
  };

  const handleDeleteListing = async () => {
    if (!product) return;
    if (!confirm(`Are you sure you want to permanently delete "${product.title}"? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`/products/${product.id}`);
      alert("Listing deleted successfully.");
      router.push("/listings");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete listing.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      setIsSaving(true);
      const payload = {
        title: editForm.title.trim(),
        price_per_day: parseFloat(editForm.price_per_day) || product.price_per_day,
        security_deposit: parseFloat(editForm.security_deposit) || 0,
        condition: editForm.condition,
        delivery_option: editForm.delivery_option,
        city: editForm.city.trim(),
        area: editForm.area.trim(),
        description: editForm.description.trim(),
      };
      const res = await apiClient.patch(`/products/${product.id}`, payload);
      setProduct({ ...product, ...res.data });
      setIsEditModalOpen(false);
      showToast("Listing details updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update listing.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading listing details...</p>
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Listing Not Found</h2>
          <p className="text-xs text-slate-500">The requested listing does not exist or has been removed.</p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back to My Listings
          </Link>
        </div>
      </AppShell>
    );
  }

  // Calculate quick stats
  const totalEarnings = bookings
    .filter((b) => ["confirmed", "completed", "active", "approved"].includes(b.status))
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0) * 0.9, 0);

  // Extract / derive specs for vehicle or general item
  const isVehicle = (product.category?.name || "").toLowerCase().includes("vehic") ||
    product.title.toLowerCase().includes("car") ||
    product.title.toLowerCase().includes("toyota") ||
    product.title.toLowerCase().includes("bmw") ||
    product.title.toLowerCase().includes("honda") ||
    product.title.toLowerCase().includes("nissan");

  // Derive brand & year from title
  const titleParts = product.title.split(" ");
  const possibleYear = titleParts.find((w: string) => /^(19|20)\d{2}$/.test(w)) || "2024";
  const brand = isVehicle ? titleParts[0] || "Toyota" : "Premium Brand";
  const model = isVehicle ? titleParts.slice(1).filter((w: string) => !/^(19|20)\d{2}$/.test(w)).join(" ") || "Standard" : "Standard Model";

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 max-w-[1440px] mx-auto pb-20">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Sparkles size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Top Breadcrumb & Title Header ───────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link href="/listings" className="hover:text-indigo-600 transition-colors">
              My Listings
            </Link>
            <span>&gt;</span>
            <span className="text-slate-700 font-bold truncate max-w-md">{product.title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
            <span className="flex items-center gap-1.5">
              <Car size={14} className="text-slate-400" />
              <span>{product.category?.name || "Vehicle"}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              <span>{product.city ? `${product.area || "Gulshan-2"}, ${product.city}` : "Dhaka, Bangladesh"}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>Listed on {dayjs(product.created_at).format("MMM D, YYYY")}</span>
            </span>
          </div>
        </div>

        {/* ── Main 2-Column Grid Layout (Image 2 Replica) ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column (col-span-8): Image Showcase, Specs, Tabs ─────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Image Showcase Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
              {/* Main Image Container */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 group border border-slate-100">
                {images.length > 0 ? (
                  <img
                    src={images[activeImageIdx] || images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Package size={36} />
                    <span className="text-xs font-semibold">No Image Available</span>
                  </div>
                )}

                {/* Status Badge (Top-Left) */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  {product.status === "APPROVED" && product.is_active ? (
                    <span className="bg-white/95 backdrop-blur-md text-emerald-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  ) : product.status === "PENDING" ? (
                    <span className="bg-white/95 backdrop-blur-md text-amber-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-amber-100">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending Approval
                    </span>
                  ) : product.status === "REJECTED" ? (
                    <span className="bg-white/95 backdrop-blur-md text-rose-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-rose-100">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Rejected
                    </span>
                  ) : (
                    <span className="bg-white/95 backdrop-blur-md text-slate-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Paused
                    </span>
                  )}
                </div>

                {/* Left / Right Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-md transition-transform active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-md transition-transform active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image Counter (Bottom-Right) */}
                {images.length > 0 && (
                  <div className="absolute bottom-3.5 right-3.5 bg-slate-900/70 backdrop-blur-md text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {activeImageIdx + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx
                          ? "border-blue-600 ring-2 ring-blue-500/20 shadow-sm scale-102"
                          : "border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Specifications & Details Card (Image 2 style) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
              {/* Header Price & Tag */}
              <div className="space-y-1 border-b border-slate-100 pb-5">
                <h2 className="text-xl font-bold text-slate-900">{product.title}</h2>
                <div className="flex items-center gap-3 pt-1">
                  <div className="text-2xl font-black text-blue-600">
                    ৳ {Number(product.price_per_day).toLocaleString()}{" "}
                    <span className="text-xs font-semibold text-slate-400 font-sans">/ day</span>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                    Daily Rental
                  </span>
                </div>
              </div>

              {/* Key Specs Grid with Clean Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Car size={14} className="text-slate-400" /> Brand
                  </span>
                  <span className="font-bold text-slate-800">{brand}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Package size={14} className="text-slate-400" /> Model
                  </span>
                  <span className="font-bold text-slate-800">{model}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-400" /> Year
                  </span>
                  <span className="font-bold text-slate-800">{possibleYear}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Fuel size={14} className="text-slate-400" /> Fuel Type
                  </span>
                  <span className="font-bold text-slate-800">Petrol / Octane</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Settings size={14} className="text-slate-400" /> Transmission
                  </span>
                  <span className="font-bold text-slate-800">Automatic</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Users size={14} className="text-slate-400" /> Seating Capacity
                  </span>
                  <span className="font-bold text-slate-800">5 Persons</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Shield size={14} className="text-slate-400" /> Condition
                  </span>
                  <span className="font-bold text-slate-800 capitalize">{product.condition || "Good"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <DollarSign size={14} className="text-slate-400" /> Security Deposit
                  </span>
                  <span className="font-bold text-slate-800">
                    ৳ {Number(product.security_deposit || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2">
                <p
                  className={`text-xs text-slate-600 leading-relaxed ${
                    !showFullDesc && "line-clamp-2"
                  }`}
                >
                  {product.description ||
                    `Well maintained ${product.title}. Smooth drive, excellent fuel efficiency. Perfect for city and long trips. AC, power steering, and comfortable seats.`}
                </p>
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-1 cursor-pointer"
                >
                  {showFullDesc ? "Show less ▴" : "Show more ▾"}
                </button>
              </div>
            </div>

            {/* ── Tabs Section: Booking History, Reviews, Analytics ────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="flex border-b border-slate-100 px-6 pt-2">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`py-3.5 px-4 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === "bookings" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Booking History
                  {activeTab === "bookings" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-3.5 px-4 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === "reviews" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Reviews ({product.review_count || 0})
                  {activeTab === "reviews" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-3.5 px-4 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === "analytics" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Analytics
                  {activeTab === "analytics" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>

              <div className="p-6">
                {activeTab === "bookings" && (
                  <div className="overflow-x-auto">
                    {bookings.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 space-y-2">
                        <Clock size={32} className="mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No bookings recorded yet for this item.</p>
                        <p className="text-[11px] text-slate-400">
                          When customers request or book this item, their rental history will appear here.
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                          <tr>
                            <th className="pb-3 font-semibold">Booking ID</th>
                            <th className="pb-3 font-semibold">Customer</th>
                            <th className="pb-3 font-semibold">Rental Period</th>
                            <th className="pb-3 font-semibold">Total Amount</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bookings.map((b) => {
                            const renterName = b.renter
                              ? `${b.renter.first_name} ${b.renter.last_name || ""}`
                              : "Verified Customer";
                            const statusColor =
                              b.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : b.status === "active"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : b.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200";

                            return (
                              <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 font-mono text-[11px] font-bold text-slate-600">
                                  #BKG-{b.id.slice(0, 4).toUpperCase()}
                                </td>
                                <td className="py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                      {renterName.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-slate-800">{renterName}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 text-slate-600">
                                  {dayjs(b.start_date).format("MMM D")} – {dayjs(b.end_date).format("MMM D, YYYY")}
                                </td>
                                <td className="py-3.5 font-bold text-slate-900">
                                  ৳ {Number(b.total_amount || 0).toLocaleString()}
                                </td>
                                <td className="py-3.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusColor}`}
                                  >
                                    {b.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right">
                                  <Link
                                    href={`/bookings/${b.id}`}
                                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-[11px] text-slate-700 transition-colors inline-block"
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <Star size={32} className="mx-auto text-amber-400 fill-amber-400" />
                    <h3 className="text-sm font-bold text-slate-900">
                      ★ {(product.avg_rating || 4.9).toFixed(1)} Rating
                    </h3>
                    <p className="text-xs text-slate-500">
                      Based on {product.review_count || 0} customer reviews.
                    </p>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Page Views</p>
                      <h4 className="text-xl font-bold text-slate-900">{product.view_count || 48}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold">↑ 14% this week</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Booking Conversion</p>
                      <h4 className="text-xl font-bold text-slate-900">
                        {product.view_count ? `${Math.min(100, Math.round((bookings.length / product.view_count) * 100))}%` : "12%"}
                      </h4>
                      <p className="text-[10px] text-blue-600 font-bold">Above category avg</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Net Earnings Potential</p>
                      <h4 className="text-xl font-bold text-slate-900">
                        ৳ {(Number(product.price_per_day) * 15 * 0.9).toLocaleString()}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Est. monthly income</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column (col-span-4): Status, Quick Stats & Actions ─────── */}
          <div className="lg:col-span-4 space-y-5 sticky top-6">
            {/* 1. Listing Status Card */}
            <div
              className={`p-5 rounded-3xl border shadow-xs transition-colors flex items-start justify-between gap-3 ${
                product.status === "APPROVED" && product.is_active
                  ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900"
                  : product.status === "PENDING"
                  ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    product.status === "APPROVED" && product.is_active
                      ? "bg-emerald-500 text-white"
                      : product.status === "PENDING"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-400 text-white"
                  }`}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {product.status === "APPROVED" && product.is_active
                      ? "Listing is Active"
                      : product.status === "PENDING"
                      ? "Pending Approval"
                      : "Listing is Paused"}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {product.status === "APPROVED" && product.is_active
                      ? "Your item is visible to customers"
                      : product.status === "PENDING"
                      ? "Waiting for admin verification"
                      : "Item hidden from public search"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleActive}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                title="Toggle Active Status"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            {/* 2. Quick Stats Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{bookings.length || 0}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Total Bookings</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      ৳ {totalEarnings.toLocaleString()}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Total Earnings</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {(product.avg_rating || 4.8).toFixed(1)}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Average Rating</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {product.review_count || 0}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Total Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Actions Card (Image 2 Replica) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Actions</h3>

              {/* Edit Listing (Primary Blue) */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <Edit2 size={14} /> Edit Listing
              </button>

              {/* View on Website (Opens Public Product Page - Image 1) */}
              <Link
                href={`/products/${product.slug || product.id}`}
                target="_blank"
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink size={14} /> View on Website
              </Link>

              {/* Pause / Activate Listing */}
              <button
                onClick={handleToggleActive}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {product.is_active ? (
                  <>
                    <Pause size={14} /> Pause Listing
                  </>
                ) : (
                  <>
                    <Play size={14} /> Activate Listing
                  </>
                )}
              </button>

              {/* Delete Listing */}
              <button
                onClick={handleDeleteListing}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Delete Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Listing Modal ──────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 size={16} className="text-blue-600" />
                Edit Listing Details
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Item Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Daily Rate (৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editForm.price_per_day}
                    onChange={(e) => setEditForm({ ...editForm, price_per_day: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Security Deposit (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.security_deposit}
                    onChange={(e) => setEditForm({ ...editForm, security_deposit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good Condition</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Delivery Option</label>
                  <select
                    value={editForm.delivery_option}
                    onChange={(e) => setEditForm({ ...editForm, delivery_option: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="both">Pick-up & Delivery</option>
                    <option value="pickup">Pick-up Only</option>
                    <option value="delivery">Delivery Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Area / Neighborhood</label>
                  <input
                    type="text"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white resize-none"
                  placeholder="Describe vehicle features, rules, condition..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
