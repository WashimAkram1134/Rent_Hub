"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutTemplate,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
  Layers,
  X,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/axios";

interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta_text: string;
  cta_href: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminCmsPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hero" | "collections" | "preview">("hero");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [eyebrow, setEyebrow] = useState("Trusted Peer-to-Peer Rentals");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Explore Rentals");
  const [ctaHref, setCtaHref] = useState("/categories");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Selected slide for live preview
  const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/cms/admin/hero-slides");
      const data = res.data || [];
      setSlides(data);
      if (data.length > 0 && !previewSlide) {
        setPreviewSlide(data[0]);
      }
    } catch (err) {
      console.error("Failed to load hero slides:", err);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setEyebrow("Trusted Peer-to-Peer Rentals");
    setTitle("");
    setSubtitle("");
    setCtaText("Explore Rentals");
    setCtaHref("/categories");
    setImageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80");
    setSortOrder(slides.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: HeroSlide) => {
    setEditingSlide(s);
    setEyebrow(s.eyebrow || "Trusted Peer-to-Peer Rentals");
    setTitle(s.title);
    setSubtitle(s.subtitle || "");
    setCtaText(s.cta_text || "Explore Rentals");
    setCtaHref(s.cta_href || "/categories");
    setImageUrl(s.image_url);
    setSortOrder(s.sort_order || 0);
    setIsActive(s.is_active);
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      showToast("Headline title and Image URL are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        cta_text: ctaText.trim(),
        cta_href: ctaHref.trim(),
        image_url: imageUrl.trim(),
        sort_order: Number(sortOrder),
        is_active: isActive,
      };

      if (editingSlide) {
        await apiClient.put(`/cms/admin/hero-slides/${editingSlide.id}`, payload);
        showToast("Hero slide updated successfully!");
      } else {
        await apiClient.post("/cms/admin/hero-slides", payload);
        showToast("New hero slide published to storefront!");
      }

      setIsModalOpen(false);
      fetchSlides();
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(err?.response?.data?.detail || "Failed to save hero slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete slide "${name}"?`)) return;
    try {
      await apiClient.delete(`/cms/admin/hero-slides/${id}`);
      showToast("Hero slide removed from homepage rotation.");
      fetchSlides();
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast("Failed to delete slide.");
    }
  };

  const handleToggleStatus = async (slide: HeroSlide) => {
    try {
      const updated = !slide.is_active;
      await apiClient.put(`/cms/admin/hero-slides/${slide.id}`, {
        ...slide,
        is_active: updated,
      });
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: updated } : s))
      );
      showToast(`Slide ${updated ? "activated" : "paused"} on storefront.`);
    } catch (err) {
      showToast("Failed to toggle status.");
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white border border-slate-700 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <LayoutTemplate size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Website Content & Storefront CMS
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage hero promotional carousels, featured collections, and regional showcase banners without writing code.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <span>Preview Storefront</span>
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "hero"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers size={14} />
            <span>Homepage Hero Slides ({slides.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "collections"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={14} />
            <span>Featured Collections</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/locations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <MapPin size={13} />
            <span>Regional Cities & Delivery Hubs &rarr;</span>
          </Link>
        </div>
      </div>

      {/* TAB 1: HERO SLIDES & LIVE PREVIEW */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Live Storefront Hero Preview */}
          {previewSlide && (
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative text-white">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Storefront Preview
              </div>

              <div className="relative min-h-[320px] flex items-center p-8 sm:p-12">
                {/* Background Image with Gradient Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 brightness-[0.4]"
                  style={{ backgroundImage: `url(${previewSlide.image_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />

                {/* Hero Text Content */}
                <div className="relative z-10 max-w-xl space-y-3">
                  {previewSlide.eyebrow && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-xs">
                      {previewSlide.eyebrow}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    {previewSlide.title}
                  </h2>
                  {previewSlide.subtitle && (
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {previewSlide.subtitle}
                    </p>
                  )}
                  <div className="pt-2 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 font-bold text-xs shadow-lg shadow-indigo-600/30">
                      <span>{previewSlide.cta_text || "Explore Rentals"}</span>
                      <ArrowRight size={14} />
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Link: {previewSlide.cta_href}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slides Management Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Active Storefront Rotation ({slides.filter((s) => s.is_active).length} Active)
              </h3>
              <span className="text-xs text-slate-400">
                Click any slide to view its live preview above
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center p-12 bg-white rounded-2xl border border-slate-200">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <ImageIcon size={36} className="mx-auto text-slate-400 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Hero Slides Configured</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Create your first homepage banner slide to welcome visitors.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Hero Slide
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slides.map((s) => {
                  const isSelected = previewSlide?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setPreviewSlide(s)}
                      className={`group bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Thumbnail Header */}
                      <div className="h-36 relative overflow-hidden bg-slate-100">
                        <img
                          src={s.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                            Order #{s.sort_order}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              s.is_active
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {s.is_active ? "Active" : "Paused"}
                          </span>
                        </div>

                        {/* Eyebrow in thumbnail */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                            {s.eyebrow}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                            {s.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {s.subtitle || "No subtitle provided."}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {s.cta_text} &rarr;
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(s);
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                s.is_active
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                              title={s.is_active ? "Pause slide" : "Activate slide"}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(s);
                              }}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Edit slide"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSlide(s.id, s.title);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Delete slide"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEATURED COLLECTIONS */}
      {activeTab === "collections" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Homepage Featured Tags</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Curate high-converting rental collections displayed in the top discovery pills on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { name: "Luxury Wedding Cars", tag: "wedding-cars", count: "48 items", status: "Active", bg: "from-amber-500 to-orange-600" },
                { name: "Sony & Canon Cinema Kits", tag: "cinema-gear", count: "72 items", status: "Active", bg: "from-blue-600 to-indigo-600" },
                { name: "Weekend Camping Tents", tag: "camping-gear", count: "29 items", status: "Active", bg: "from-emerald-600 to-teal-700" },
                { name: "Power Drills & Home Tools", tag: "diy-tools", count: "54 items", status: "Active", bg: "from-slate-700 to-slate-900" },
                { name: "Party Sound Systems", tag: "sound-dj", count: "33 items", status: "Active", bg: "from-purple-600 to-pink-600" },
                { name: "Heavy Generator Sets", tag: "generators", count: "16 items", status: "Active", bg: "from-red-600 to-rose-700" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.bg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                      ★
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">#{c.tag} • {c.count}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT HERO SLIDE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <LayoutTemplate size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingSlide ? "Edit Storefront Hero Slide" : "Create Homepage Hero Slide"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure headline, background image, and call-to-action button.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Eyebrow Tag (Small Accent Banner)
                </label>
                <input
                  type="text"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="e.g., Trusted Peer-to-Peer Rentals"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Main Headline Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Rent Premium Vehicles & Cameras in Dhaka"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Subtitle / Explanatory Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., Skip high capital purchase costs. Rent verified gear with security deposit escrow protection."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Explore Rentals"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    value={ctaHref}
                    onChange={(e) => setCtaHref(e.target.value)}
                    placeholder="/categories"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Hero Background Image URL <span className="text-rose-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                />

                {/* Preset Image Options */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                  {[
                    { label: "Luxury Car", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" },
                    { label: "Cinema Camera", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80" },
                    { label: "Wedding Attire", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80" },
                  ].map((p, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setImageUrl(p.url)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Publish on Storefront</p>
                      <p className="text-[10px] text-slate-400">Include in hero slider rotation</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50 mt-4 -mx-5 -mb-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{editingSlide ? "Update Hero Slide" : "Publish Slide"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
