"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Building,
  Navigation,
  Globe,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Sparkles,
  X,
  Radio,
  Share2,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface CityItem {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  listing_count: number;
  is_active: boolean;
  sort_order: number;
  division: string;
  delivery_radius_km: number;
  is_primary_hub: boolean;
}

interface LocationSummary {
  total_locations: number;
  active_hubs: number;
  total_listings_covered: number;
  primary_metro_hubs: number;
  fast_delivery_coverage: string;
}

export default function AdminLocationsPage() {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [summary, setSummary] = useState<LocationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityItem | null>(null);
  const [name, setName] = useState("");
  const [division, setDivision] = useState("Dhaka Division");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80");
  const [radiusKm, setRadiusKm] = useState(25);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/cms/admin/cities", {
        params: {
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      setCities(res.data.cities);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setEditingCity(null);
    setName("");
    setDivision("Dhaka Division");
    setImageUrl("https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80");
    setRadiusKm(25);
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (city: CityItem) => {
    setEditingCity(city);
    setName(city.name);
    setDivision(city.division);
    setImageUrl(city.image_url);
    setRadiusKm(city.delivery_radius_km);
    setIsActive(city.is_active);
    setModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      if (editingCity) {
        await apiClient.put(`/cms/admin/cities/${editingCity.id}`, {
          name,
          image_url: imageUrl,
          is_active: isActive,
          sort_order: editingCity.sort_order,
        });
        showToast(`Location '${name}' updated successfully!`);
      } else {
        await apiClient.post("/cms/admin/cities", {
          name,
          image_url: imageUrl,
          is_active: isActive,
        });
        showToast(`Location '${name}' added to platform hubs!`);
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (city: CityItem) => {
    if (!confirm(`Are you sure you want to remove '${city.name}' from active rental locations?`)) return;
    try {
      await apiClient.delete(`/cms/admin/cities/${city.id}`);
      showToast(`Location '${city.name}' removed!`);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete location");
    }
  };

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rental Hub Locations</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Radio size={12} className="text-emerald-600 animate-pulse" />
              8 Major BD Divisions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage nationwide city coverage, metropolitan delivery zones, and regional hubs
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Location</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Active Coverage Hubs</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {summary?.active_hubs || 8} Cities
            </h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">
              <span>98.4% Population Reach</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Building size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Regional Listings</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {summary?.total_listings_covered || 393} Items
            </h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">
              <span>Across all hubs</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Navigation size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Fast Delivery Radius</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">25–35 km</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">
              <span>Doorstep Pickup & Drop</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Globe size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Primary Metros</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Dhaka & CTG</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">
              <span>Highest Rental Volume</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLocations();
            }}
            className="relative flex-1 min-w-[240px]"
          >
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search location by name or division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

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

        {/* Location Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <div
              key={city.id}
              className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                <div className="absolute top-2.5 left-2.5">
                  {city.is_primary_hub && (
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      PRIMARY HUB
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      city.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-500 text-white"
                    }`}
                  >
                    {city.is_active ? "Active Hub" : "Disabled"}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h3 className="font-extrabold text-base leading-tight">{city.name}</h3>
                  <p className="text-[11px] text-slate-200">{city.division}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-400">Available Listings:</span>
                  <span className="font-bold text-slate-900">{city.listing_count} items</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-400">Delivery Radius:</span>
                  <span className="font-medium text-slate-800">{city.delivery_radius_km} km radius</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">/{city.slug}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(city)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(city)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveLocation}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin size={20} />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCity ? "Edit Location Hub" : "Add New Location Hub"}
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
                <label className="font-bold text-slate-700 block mb-1">City / Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mymensingh, Comilla..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Dhaka Division">Dhaka Division</option>
                  <option value="Chittagong Division">Chittagong Division</option>
                  <option value="Sylhet Division">Sylhet Division</option>
                  <option value="Rajshahi Division">Rajshahi Division</option>
                  <option value="Khulna Division">Khulna Division</option>
                  <option value="Barisal Division">Barisal Division</option>
                  <option value="Rangpur Division">Rangpur Division</option>
                  <option value="Mymensingh Division">Mymensingh Division</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-700 cursor-pointer">
                  Active in Marketplace for Rentals
                </label>
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
                <span>Save Location</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
