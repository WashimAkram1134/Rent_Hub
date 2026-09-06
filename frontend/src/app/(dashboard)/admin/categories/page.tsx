"use client";

import React, { useState, useEffect } from "react";
import {
  FileBox,
  Plus,
  Search,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Loader2,
  X,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<CategoryItem[]>("/categories", {
        params: { include_inactive: true },
        timeout: 10000,
      });
      setCategories(res.data || []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      // Fallback to cms categories if needed
      try {
        const fallbackRes = await apiClient.get<CategoryItem[]>("/cms/categories");
        setCategories(fallbackRes.data || []);
      } catch (fbErr) {
        console.error("Fallback also failed:", fbErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80");
    setIconUrl("");
    setSortOrder(categories.length);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: CategoryItem) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || "");
    setImageUrl(c.image_url || "");
    setIconUrl(c.icon_url || "");
    setSortOrder(c.sort_order);
    setIsActive(c.is_active);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, {
          name,
          description,
          image_url: imageUrl,
          icon_url: iconUrl,
          sort_order: sortOrder,
          is_active: isActive,
        });
        showToast(`Category '${name}' updated successfully!`);
      } else {
        await apiClient.post("/categories", {
          name,
          description,
          image_url: imageUrl,
          icon_url: iconUrl,
          sort_order: sortOrder,
          is_active: isActive,
        });
        showToast(`Category '${name}' created successfully!`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (c: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category '${c.name}'?`)) return;
    try {
      await apiClient.delete(`/categories/${c.id}`);
      showToast(`Category '${c.name}' deleted!`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.is_active) ||
      (statusFilter === "inactive" && !c.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);
  const activeCount = categories.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rental Categories</h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Tag size={12} className="text-blue-600" />
              {categories.length} Categories Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage product rental classifications, SEO slugs, icons, and marketplace visibility
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Categories</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{categories.length} Types</h3>
            <p className="text-blue-600 text-[11px] font-semibold mt-0.5">Structured Catalog</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Active Categories</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{activeCount} Active</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Visible to renters</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Classified Items</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{totalProducts} Items</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Assigned to catalog</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <FileBox size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Top Category</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Vehicles</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Highest Booking Volume</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Listings Count</th>
                <th className="py-3 px-3">Sort Order</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {c.image_url || c.icon_url ? (
                          <img
                            src={c.image_url || c.icon_url || ""}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-blue-600">/{c.slug}</td>

                  <td className="py-3.5 px-3 max-w-xs text-slate-500 text-[11px] line-clamp-2">
                    {c.description || "—"}
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                      {c.product_count || 0} items
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-600 font-mono">{c.sort_order}</td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {c.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Tag size={18} />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drones & Aerial Gear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image / Banner URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="catIsActive" className="font-bold text-slate-700 cursor-pointer">
                    Active & Visible
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
