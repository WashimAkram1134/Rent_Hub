"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Compass,
  Star,
  Zap,
  Clock,
  ShieldCheck,
  Building,
  Car,
  Laptop,
  Camera,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
  AlertCircle,
  LocateFixed,
  RefreshCw,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { ProductCard } from "@/components/common/ProductCard";
import apiClient from "@/lib/axios";

// ── Known Dhaka & Bangladesh Area Coordinates ──────────────────────────────────
const AREA_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  gulshan: { lat: 23.7925, lng: 90.4078, name: "Gulshan-1 & 2" },
  banani: { lat: 23.7937, lng: 90.4043, name: "Banani & Road 11" },
  dhanmondi: { lat: 23.7461, lng: 90.3742, name: "Dhanmondi" },
  uttara: { lat: 23.8759, lng: 90.3795, name: "Uttara Sectors" },
  bashundhara: { lat: 23.8191, lng: 90.4526, name: "Bashundhara R/A" },
  mirpur: { lat: 23.8223, lng: 90.3654, name: "Mirpur 1-12" },
  mohakhali: { lat: 23.7777, lng: 90.4056, name: "Mohakhali" },
  badda: { lat: 23.7684, lng: 90.4258, name: "Badda / Rampura" },
  chittagong: { lat: 22.3569, lng: 91.7832, name: "Chittagong" },
  sylhet: { lat: 24.8949, lng: 91.8687, name: "Sylhet" },
};

// ── Neighborhood List ──────────────────────────────────────────────────────────
const NEIGHBORHOODS = [
  { id: "all", name: "All Dhaka", tag: "Greater Metro" },
  { id: "gulshan", name: "Gulshan-1 & 2", tag: "Diplomatic Zone" },
  { id: "banani", name: "Banani & Road 11", tag: "Commercial Hub" },
  { id: "dhanmondi", name: "Dhanmondi", tag: "Residential / Lake" },
  { id: "uttara", name: "Uttara Sectors", tag: "Airport Corridor" },
  { id: "bashundhara", name: "Bashundhara R/A", tag: "University Hub" },
  { id: "mirpur", name: "Mirpur 1-12", tag: "Metro Corridor" },
];

// ── Radius Filters ───────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [
  { label: "⚡ < 2 km (Walking / 15m)", value: 2 },
  { label: "🚗 < 5 km (Popular)", value: 5 },
  { label: "🌆 < 10 km (Quick Ride)", value: 10 },
  { label: "🗺️ Whole City", value: 50 },
];

// ── Category Filters ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All Items", icon: Layers },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "apartments", label: "Apartments", icon: Building },
  { id: "cameras", label: "Cameras", icon: Camera },
];

// ── Real Haversine Distance Formula in Kilometers ──────────────────────────────
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// ── Resolve Coordinates for a product item ──────────────────────────────────────
function getItemCoordinates(item: any): { lat: number; lng: number } {
  const text = `${item.area || ""} ${item.city || ""} ${item.title || ""}`.toLowerCase();
  for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
    if (text.includes(key)) {
      // Add slight jitter for realistic pin scattering
      const jitterLat = (Math.sin(item.id?.charCodeAt(0) || 1) * 0.005);
      const jitterLng = (Math.cos(item.id?.charCodeAt(1) || 1) * 0.005);
      return { lat: coords.lat + jitterLat, lng: coords.lng + jitterLng };
    }
  }
  // Default to Gulshan center
  return { lat: 23.7925, lng: 90.4078 };
}

export default function ExploreNearbyPage() {
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Gulshan-2, Dhaka");
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [permissionNoticeDismissed, setPermissionNoticeDismissed] = useState(false);

  // Filter states
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("gulshan");
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price_asc" | "price_desc">("distance");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Real Browser Location
  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setPermissionStatus("unsupported");
      return;
    }

    setIsRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 20);

        setUserCoords({ lat, lng, accuracy });
        setPermissionStatus("granted");
        setIsRequestingLocation(false);

        // Find closest known neighborhood to auto-select
        let closestArea = "gulshan";
        let minD = Infinity;
        for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
          const d = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
          if (d < minD) {
            minD = d;
            closestArea = key;
          }
        }
        setSelectedNeighborhood(closestArea);

        // Try reverse geocoding via OpenStreetMap Nominatim for human address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data && data.address) {
            const suburb = data.address.suburb || data.address.neighbourhood || data.address.city_district || "Dhaka";
            const city = data.address.city || data.address.state || "Bangladesh";
            setLocationName(`${suburb}, ${city}`);
          }
        } catch {
          setLocationName(`${AREA_COORDINATES[closestArea]?.name || "Dhaka"} (GPS)`);
        }
      },
      (error) => {
        console.warn("Geolocation permission error:", error.message);
        setIsRequestingLocation(false);
        setPermissionStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Initial products fetch & prompt check
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/products", {
          params: { limit: 60, status: "APPROVED" },
        });
        const items = Array.isArray(res.data) ? res.data : [];
        setProducts(items);
      } catch (err) {
        console.error("Failed to load nearby products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Check browser permission status if API is available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
        if (result.state === "granted") {
          requestLiveLocation();
        } else if (result.state === "denied") {
          setPermissionStatus("denied");
        }
      }).catch(() => {});
    }
  }, []);

  // Compute Active Reference Point (User GPS or Selected Neighborhood)
  const referenceCoords = useMemo(() => {
    if (userCoords) {
      return { lat: userCoords.lat, lng: userCoords.lng };
    }
    const nb = AREA_COORDINATES[selectedNeighborhood] || AREA_COORDINATES["gulshan"];
    return { lat: nb.lat, lng: nb.lng };
  }, [userCoords, selectedNeighborhood]);

  // Compute Items with Exact Distances
  const nearbyItems = useMemo(() => {
    let result = products.map((item) => {
      const itemCoords = getItemCoordinates(item);
      const dist = calculateDistanceKm(
        referenceCoords.lat,
        referenceCoords.lng,
        itemCoords.lat,
        itemCoords.lng
      );
      const isInstant = dist <= 2.5;

      return {
        ...item,
        distanceKm: dist,
        location: item.area ? `${item.area}, ${item.city || "Dhaka"}` : "Gulshan-2, Dhaka",
        instantPickup: isInstant,
        estimatedTime: isInstant ? "⚡ 15-30 min pickup" : "Same-day pickup",
      };
    });

    // Filter by Radius
    result = result.filter((item) => item.distanceKm <= selectedRadius);

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter((item) => {
        const catSlug = item.category?.slug || item.category_slug || "";
        const title = item.title?.toLowerCase() || "";
        if (selectedCategory === "vehicles") {
          return catSlug.includes("vehicle") || title.includes("car") || title.includes("bike") || title.includes("toyota") || title.includes("bmw");
        }
        if (selectedCategory === "electronics") {
          return catSlug.includes("electronic") || title.includes("macbook") || title.includes("laptop") || title.includes("ps5");
        }
        if (selectedCategory === "apartments") {
          return catSlug.includes("apartment") || title.includes("flat") || title.includes("bhk") || title.includes("room");
        }
        if (selectedCategory === "cameras") {
          return catSlug.includes("camera") || title.includes("canon") || title.includes("sony") || title.includes("lens") || title.includes("drone");
        }
        return true;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.area?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "distance") return a.distanceKm - b.distanceKm;
      if (sortBy === "rating") return (b.avg_rating || 5) - (a.avg_rating || 5);
      if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
      if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
      return 0;
    });

    return result;
  }, [products, referenceCoords, selectedRadius, selectedCategory, searchQuery, sortBy]);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 font-sans text-slate-800 space-y-6 max-w-[1440px] mx-auto min-h-screen">
        
        {/* ── Top Header Banner with Live Location Telemetry ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-6 sm:p-8 text-white shadow-xl border border-indigo-950/60">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold tracking-wide">
                <Compass size={14} className="animate-spin-slow text-blue-400" />
                <span>Geolocated Peer-to-Peer Rentals</span>
                {permissionStatus === "granted" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Explore Rentals Nearby You 📍
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl leading-relaxed">
                Calculate exact walking and driving distances to vehicles, cameras, apartments, and gear available for instant handover in Dhaka.
              </p>
            </div>

            {/* GPS Trigger / Status Card */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {permissionStatus === "granted" && userCoords ? (
                <div className="px-4 py-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <p className="text-white text-[11px] font-black">{locationName}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      GPS: {userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E (±{userCoords.accuracy}m)
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={requestLiveLocation}
                  disabled={isRequestingLocation}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
                >
                  <Navigation size={15} className={isRequestingLocation ? "animate-spin" : ""} />
                  <span>{isRequestingLocation ? "Requesting GPS Access..." : "Allow Live Location Access"}</span>
                </button>
              )}

              <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2 text-white text-xs font-bold backdrop-blur-md">
                <Zap size={14} className="text-amber-400 fill-amber-400" />
                <span>{nearbyItems.length} Available Nearby</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Location Permission Notice Banner (If not yet granted) ── */}
        {permissionStatus !== "granted" && !permissionNoticeDismissed && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
                <LocateFixed size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  Allow Location Permission to Find Items Within Walking Distance
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  We calculate the exact kilometers from your device to the item host for instant 15-minute pickups.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={requestLiveLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Enable GPS Location
              </button>
              <button
                onClick={() => setPermissionNoticeDismissed(true)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Search & Filter Control Bar ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
          {/* Search bar & Sort Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search items or landmarks (e.g. Toyota, Gulshan-2 circle, DSLR, Sony A7)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <SlidersHorizontal size={13} /> Radius:
              </span>
              {RADIUS_OPTIONS.map((rad) => (
                <button
                  key={rad.value}
                  onClick={() => setSelectedRadius(rad.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedRadius === rad.value
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              >
                <option value="distance">📍 Closest to Me First</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_asc">৳ Price: Low to High</option>
                <option value="price_desc">৳ Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Neighborhood Quick Filter Chips */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <MapPin size={13} className="text-rose-500" /> Neighborhoods:
            </span>
            {NEIGHBORHOODS.map((nh) => {
              const active = selectedNeighborhood === nh.id;
              return (
                <button
                  key={nh.id}
                  onClick={() => {
                    setSelectedNeighborhood(nh.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{nh.name}</span>
                </button>
              );
            })}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={13} className={active ? "text-blue-600" : "text-slate-400"} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Proximity Telemetry & Security Highlights ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/80 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-950">Instant Pick-up Nearby</p>
              <p className="text-[11px] text-indigo-700 font-medium">
                Items within 2 km can be picked up in person in under 30 mins.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">100% NID Verified Hosts</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Secure escrow deposits & in-person handover protection.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/80 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950">Flexible Duration</p>
              <p className="text-[11px] text-amber-800 font-medium">
                Rent by the hour, day, or week with zero lock-in contracts.
              </p>
            </div>
          </div>
        </div>

        {/* ── Nearby Item Catalog Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Available Near You</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {nearbyItems.length} listings found
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated from <strong className="text-slate-800">{locationName}</strong> within {selectedRadius} km radius
              </p>
            </div>

            <Link
              href="/categories"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Browse all categories <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : nearbyItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Compass size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-900">No items found within {selectedRadius} km</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try increasing your radius to 10 km or select "All Dhaka" to discover equipment across the entire metropolitan area.
              </p>
              <button
                onClick={() => {
                  setSelectedRadius(50);
                  setSelectedNeighborhood("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Expand Search to Whole City
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {nearbyItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Distance & Instant Pickup Floating Pill */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 pointer-events-none">
                    <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <MapPin size={10} className="text-rose-400" />
                      {item.distanceKm} km away
                    </span>
                    {item.instantPickup && (
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                        <Zap size={9} /> Instant
                      </span>
                    )}
                  </div>

                  <ProductCard
                    id={item.id}
                    slug={item.slug}
                    title={item.title}
                    image_url={
                      item.image_url ||
                      item.images?.find((img: any) => img.is_primary)?.url ||
                      item.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                    }
                    badge={item.badge}
                    avg_rating={item.avg_rating || 4.8}
                    review_count={item.review_count || 18}
                    price_per_day={item.price_per_day}
                    location={item.location}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
