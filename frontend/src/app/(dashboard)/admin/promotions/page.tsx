"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Calendar,
  Percent,
  Layers,
  Loader2,
  X,
  ExternalLink,
  RefreshCw,
  Palette
} from "lucide-react";
import apiClient from "@/lib/axios";

interface PromotionItem {
  id: string;
  title: string;
  subtitle?: string | null;
  discount_text: string;
  discount_pct?: number | null;
  image_url: string;
  theme_color: string;
  category_id?: string | null;
  is_active: boolean;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [discountText, setDiscountText] = useState("15% OFF");
  const [discountPct, setDiscountPct] = useState(15);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80");
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promosRes, catsRes] = await Promise.all([
        apiClient.get("/cms/admin/promotions").catch(() => ({ data: [] })),
        apiClient.get("/categories").catch(() => ({ data: [] }))
      ]);

      let promos = Array.isArray(promosRes.data) ? promosRes.data : [];
      if (promos.length === 0) {
        // Fallback demo campaigns if DB table is brand new
        promos = [
          {
            id: "p1",
            title: "Eid Rental Festival 2026",
            subtitle: "Exclusive deals on vehicles, cinema lenses, and festive gear",
            discount_text: "20% OFF",
            discount_pct: 20,
            image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            theme_color: "#4f46e5",
            is_active: true
          },
          {
            id: "p2",
            title: "Weekend Roadtrip Special",
            subtitle: "Flat 15% off on all premium SUVs and touring motorbikes",
            discount_text: "15% OFF",
            discount_pct: 15,
            image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
            theme_color: "#059669",
            is_active: true
          },
          {
            id: "p3",
            title: "Creator Gear Promo",
            subtitle: "Top-tier cinema cameras, drones, and lighting packages",
            discount_text: "10% OFF",
            discount_pct: 10,
            image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
            theme_color: "#d97706",
            is_active: false
          }
        ];
      }

      setPromotions(promos);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setTitle("");
    setSubtitle("");
    setDiscountText("15% OFF");
    setDiscountPct(15);
    setImageUrl("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80");
    setThemeColor("#4f46e5");
    setCategoryId("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: PromotionItem) => {
    setEditingPromo(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || "");
    setDiscountText(p.discount_text);
    setDiscountPct(p.discount_pct || 15);
    setImageUrl(p.image_url);
    setThemeColor(p.theme_color || "#4f46e5");
    setCategoryId(p.category_id || "");
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Campaign title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        discount_text: discountText.trim() || `${discountPct}% OFF`,
        discount_pct: Number(discountPct),
        image_url: imageUrl.trim(),
        theme_color: themeColor,
        category_id: categoryId || undefined,
        is_active: isActive
      };

      if (editingPromo) {
        await apiClient.put(`/cms/admin/promotions/${editingPromo.id}`, payload);
        showToast("Campaign updated successfully!");
      } else {
        await apiClient.post("/cms/admin/promotions", payload);
        showToast("New campaign launched successfully!");
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await apiClient.delete(`/cms/admin/promotions/${id}`);
      showToast("Campaign deleted successfully.");
      fetchData();
    } catch (err) {
      alert("Failed to delete campaign.");
    }
  };

  const filteredPromos = promotions.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q));
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
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <Tag size={18} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Deals & Marketing Campaigns
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Launch discount banners, seasonal festivals, and category-wide promotions.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111625] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 px-2">
          <span>Active Campaigns: <strong className="text-emerald-600 font-black">{promotions.filter(p => p.is_active).length}</strong></span>
          <span>•</span>
          <span>Total Launched: <strong className="text-slate-900 dark:text-white font-black">{promotions.length}</strong></span>
        </div>

        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-amber-500" />
          <span className="text-xs font-semibold">Loading campaigns...</span>
        </div>
      ) : filteredPromos.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Tag size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No promotional campaigns found</h3>
          <p className="text-xs text-slate-400">Launch a campaign to boost platform rental demand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromos.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#111625] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Banner Graphic */}
              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide text-white uppercase shadow-sm" style={{ backgroundColor: p.theme_color || "#4f46e5" }}>
                      {p.discount_text}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.is_active ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                    }`}>
                      {p.is_active ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white leading-tight drop-shadow-sm">
                      {p.title}
                    </h3>
                    {p.subtitle && (
                      <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">
                        {p.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Percent size={13} className="text-amber-500" />
                  {p.discount_pct || 15}% Discount
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Campaign"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeletePromo(p.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f1422] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                {editingPromo ? "Edit Promotional Campaign" : "Launch New Marketing Campaign"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Eid Rental Mega Festival"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle / Promo Pitch
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Rent cars, cameras and generators with flat 15% discount"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={discountPct}
                    onChange={(e) => {
                      setDiscountPct(Number(e.target.value));
                      setDiscountText(`${e.target.value}% OFF`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Ribbon Text *
                  </label>
                  <input
                    type="text"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    placeholder="e.g. 20% OFF"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Graphic Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">All Rental Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="promoActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <label htmlFor="promoActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Activate & display campaign immediately on platform
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingPromo ? "Update Campaign" : "Publish Campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
