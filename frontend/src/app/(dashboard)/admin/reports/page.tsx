"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Layers,
  Download,
  Wallet,
  Calendar,
  Users,
  Package,
  TrendingUp,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Ban,
  CarFront,
  MonitorSmartphone,
  Building,
  Camera,
  Armchair,
  Folder,
  Loader2,
  ArrowUpRight,
  Flag,
  CreditCard,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";

// Sparkline Mini Component
function MiniSparkline({ color, data }: { color: string; data: number[] }) {
  const chartData = data.map((val, idx) => ({ i: idx, val }));
  return (
    <div className="w-20 h-9">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminReportsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30D");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customStart, setCustomStart] = useState("2026-08-01");
  const [customEnd, setCustomEnd] = useState("2026-08-25");
  const [dateRangeLabel, setDateRangeLabel] = useState("Aug 1 – Aug 25, 2026");
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const fetchReports = async (
    rangeVal = timeRange,
    loc = selectedLocation,
    cat = selectedCategory,
    sDate = customStart,
    eDate = customEnd
  ) => {
    try {
      setChartLoading(true);
      const res = await apiClient.get("/analytics/reports/overview", {
        params: {
          range: rangeVal,
          location: loc === "All Locations" ? "all" : loc,
          category: cat === "All Categories" ? "all" : cat,
          start_date: rangeVal === "Custom" ? sDate : undefined,
          end_date: rangeVal === "Custom" ? eDate : undefined,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(timeRange, selectedLocation, selectedCategory, customStart, customEnd);
  }, [timeRange, selectedLocation, selectedCategory]);

  const handleTabChange = (tab: string) => {
    setTimeRange(tab);
    if (tab === "Today") {
      setDateRangeLabel("Today (Aug 25, 2026)");
    } else if (tab === "7D") {
      setDateRangeLabel("Last 7 Days (Aug 19 – Aug 25, 2026)");
    } else if (tab === "30D") {
      setDateRangeLabel("Last 30 Days (Jul 26 – Aug 25, 2026)");
    } else if (tab === "This Year") {
      setDateRangeLabel("Year 2026 (Jan – Dec)");
    } else if (tab === "Custom") {
      setShowDatePicker(true);
    }
  };

  const handleApplyCustomDate = () => {
    setDateRangeLabel(`${customStart} – ${customEnd}`);
    setTimeRange("Custom");
    setShowDatePicker(false);
    fetchReports("Custom", selectedLocation, selectedCategory, customStart, customEnd);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csvRows = [
      ["RentHub Platform Analytics & Performance Report"],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Time Filter: ${timeRange} (${dateRangeLabel})`],
      [`Location: ${selectedLocation}`, `Category: ${selectedCategory}`],
      [],
      ["--- KEY METRICS ---"],
      ["Metric", "Value", "Trend"],
      ["Total Revenue", `BDT ${data.kpi?.total_revenue || 0}`, data.kpi?.revenue_change || "+12.5%"],
      ["Total Bookings", data.kpi?.total_bookings || 0, data.kpi?.bookings_change || "+8.6%"],
      ["Active Users", data.kpi?.active_users || 0, data.kpi?.users_change || "+15.3%"],
      ["Active Listings", data.kpi?.active_listings || 0, data.kpi?.listings_change || "+7.2%"],
      [],
      ["--- BOOKING STATUS BREAKDOWN ---"],
      ["Status", "Count", "Percentage"],
      ...(data.booking_status || []).map((s: any) => [s.name, s.count, `${s.percentage}%`]),
      [],
      ["--- TOP CATEGORIES BY BOOKINGS ---"],
      ["Category", "Bookings Count", "Revenue (BDT)", "Share %"],
      ...(data.top_categories || []).map((c: any) => [c.name, c.bookings, c.revenue, `${c.percentage}%`]),
      [],
      ["--- IDENTITY VERIFICATION OVERVIEW ---"],
      ["Status", "Count", "Percentage"],
      ...(data.identity_verification || []).map((v: any) => [v.status, v.count, `${v.percentage}%`]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentHub_Analytics_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (name: string) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("veh") || lower.includes("car"))
      return <CarFront size={16} className="text-blue-600" />;
    if (lower.includes("elec") || lower.includes("gadget"))
      return <MonitorSmartphone size={16} className="text-indigo-600" />;
    if (lower.includes("apart") || lower.includes("house") || lower.includes("room"))
      return <Building size={16} className="text-emerald-600" />;
    if (lower.includes("cam") || lower.includes("photo"))
      return <Camera size={16} className="text-amber-600" />;
    if (lower.includes("furn"))
      return <Armchair size={16} className="text-cyan-600" />;
    return <Folder size={16} className="text-purple-600" />;
  };

  const getVerificationIcon = (iconName: string) => {
    switch (iconName) {
      case "check":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "clock":
        return <Clock size={16} className="text-amber-500" />;
      case "alert":
        return <AlertTriangle size={16} className="text-orange-500" />;
      case "x":
        return <XCircle size={16} className="text-red-500" />;
      case "ban":
        return <Ban size={16} className="text-slate-400" />;
      default:
        return <CheckCircle2 size={16} className="text-emerald-500" />;
    }
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "calendar":
        return <Calendar size={15} className="text-blue-600" />;
      case "user":
        return <Users size={15} className="text-emerald-600" />;
      case "flag":
        return <Flag size={15} className="text-amber-600" />;
      case "banknote":
        return <CreditCard size={15} className="text-emerald-600" />;
      case "x-circle":
        return <XCircle size={15} className="text-red-600" />;
      default:
        return <Calendar size={15} className="text-blue-600" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  const kpi = data?.kpi || {
    total_revenue: 7214800,
    revenue_change: "+12.5%",
    total_bookings: 341,
    bookings_change: "+8.6%",
    active_users: 45,
    users_change: "+15.3%",
    active_listings: 314,
    listings_change: "+7.2%",
  };

  const bookingStatusData = data?.booking_status || [
    { name: "Pending", count: 62, percentage: 18.2, color: "#EAB308" },
    { name: "Approved", count: 3, percentage: 0.9, color: "#3B82F6" },
    { name: "Active", count: 102, percentage: 29.9, color: "#8B5CF6" },
    { name: "Completed", count: 134, percentage: 39.3, color: "#22C55E" },
    { name: "Cancelled", count: 40, percentage: 11.7, color: "#EF4444" },
  ];

  const totalBookingsCount =
    data?.total_status_bookings ||
    bookingStatusData.reduce((acc: number, cur: any) => acc + cur.count, 0);

  const topCategories = data?.top_categories || [
    { name: "Vehicles", bookings: 96, revenue: 3671200, percentage: 38 },
    { name: "Apartments", bookings: 64, revenue: 3150550, percentage: 33 },
    { name: "Electronics", bookings: 80, revenue: 1247260, percentage: 13 },
    { name: "Cameras", bookings: 60, revenue: 1224500, percentage: 13 },
    { name: "Furniture", bookings: 39, revenue: 314900, percentage: 3 },
  ];

  const idVerifications = data?.identity_verification || [
    { status: "Verified", count: 21, percentage: 47.7, color: "text-emerald-600", icon: "check" },
    { status: "Pending", count: 2, percentage: 4.5, color: "text-amber-500", icon: "clock" },
    { status: "Manual Review", count: 2, percentage: 4.5, color: "text-orange-500", icon: "alert" },
    { status: "Failed", count: 1, percentage: 2.3, color: "text-red-500", icon: "x" },
    { status: "Revoked", count: 1, percentage: 2.3, color: "text-slate-400", icon: "ban" },
  ];

  const recentActivity = data?.recent_activity || [
    { type: "booking", title: "New booking created", desc: "GoPro HERO12 Creator Bundle • Dhaka", time: "Just now", icon: "calendar", color: "text-blue-600 bg-blue-50" },
    { type: "user", title: "New user registered", desc: "Customer • rubel.hossain@gmail.com", time: "8 min ago", icon: "user", color: "text-emerald-600 bg-emerald-50" },
    { type: "payment", title: "Payment received", desc: "Booking #09a48a5a • ৳ 13,250", time: "18 min ago", icon: "banknote", color: "text-emerald-600 bg-emerald-50" },
    { type: "booking", title: "New booking created", desc: "Sony WH-1000XM5 • Dhaka", time: "Just now", icon: "calendar", color: "text-blue-600 bg-blue-50" },
    { type: "payment", title: "Payment received", desc: "Booking #20a28578 • ৳ 7,550", time: "18 min ago", icon: "banknote", color: "text-emerald-600 bg-emerald-50" },
  ];

  const revenueChartData = data?.revenue_chart || [
    { date: "May 1", revenue: 55000, bookings: 32 },
    { date: "May 6", revenue: 110000, bookings: 64 },
    { date: "May 11", revenue: 75000, bookings: 48 },
    { date: "May 16", revenue: 140000, bookings: 76 },
    { date: "May 21", revenue: 90000, bookings: 52 },
    { date: "May 26", revenue: 160000, bookings: 88 },
    { date: "May 31", revenue: 135000, bookings: 72 },
  ];

  const monthlyRevenueData = data?.monthly_revenue || [
    { month: "Jan", revenue: 180000, isCurrent: false },
    { month: "Feb", revenue: 205000, isCurrent: false },
    { month: "Mar", revenue: 230000, isCurrent: false },
    { month: "Apr", revenue: 255000, isCurrent: false },
    { month: "May", revenue: 280000, isCurrent: false },
    { month: "Jun", revenue: 305000, isCurrent: false },
    { month: "Jul", revenue: 330000, isCurrent: false },
    { month: "Aug", revenue: 7214800, isCurrent: true },
    { month: "Sep", revenue: 380000, isCurrent: false },
    { month: "Oct", revenue: 405000, isCurrent: false },
    { month: "Nov", revenue: 430000, isCurrent: false },
    { month: "Dec", revenue: 455000, isCurrent: false },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Custom Date Range Modal ─────────────────────────────────────────── */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Select Custom Date Range</h3>
              </div>
              <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
              <button
                type="button"
                onClick={() => { setCustomStart("2026-08-19"); setCustomEnd("2026-08-25"); }}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => { setCustomStart("2026-08-11"); setCustomEnd("2026-08-25"); }}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => { setCustomStart("2026-07-26"); setCustomEnd("2026-08-25"); }}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                30 Days
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomDate}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header & Filter Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-xs mt-1">Monitor platform performance and activity</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Picker Button */}
          <button
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <CalendarDays size={14} className="text-slate-400" />
            <span>{dateRangeLabel}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {/* Locations Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowCategoryDropdown(false);
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <MapPin size={14} className="text-slate-400" />
              <span>{selectedLocation}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-40 text-xs font-medium animate-in fade-in">
                {["All Locations", "Dhaka", "Chattogram", "Cox's Bazar", "Sylhet"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      selectedLocation === loc ? "text-blue-600 font-semibold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <span className="text-blue-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowLocationDropdown(false);
              }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <Layers size={14} className="text-slate-400" />
              <span>{selectedCategory}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-40 text-xs font-medium animate-in fade-in">
                {["All Categories", "Vehicles", "Electronics", "Apartments", "Cameras", "Furniture"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                      selectedCategory === cat ? "text-blue-600 font-semibold bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-blue-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm cursor-pointer active:scale-95"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── Active Filters Summary Bar ──────────────────────────────────────── */}
      {(selectedLocation !== "All Locations" || selectedCategory !== "All Categories" || timeRange !== "30D") && (
        <div className="flex items-center gap-2.5 flex-wrap bg-blue-50/70 border border-blue-100 px-4 py-2.5 rounded-2xl text-xs">
          <span className="font-semibold text-blue-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Active Filters:
          </span>
          <span className="bg-white border border-blue-200 text-blue-800 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
            📅 {dateRangeLabel}
          </span>
          {selectedLocation !== "All Locations" && (
            <span className="bg-white border border-blue-200 text-blue-800 px-2.5 py-1 rounded-lg font-medium shadow-2xs flex items-center gap-1">
              📍 {selectedLocation}
              <button
                onClick={() => setSelectedLocation("All Locations")}
                className="text-slate-400 hover:text-slate-700 ml-1 text-[11px] font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {selectedCategory !== "All Categories" && (
            <span className="bg-white border border-blue-200 text-blue-800 px-2.5 py-1 rounded-lg font-medium shadow-2xs flex items-center gap-1">
              🏷️ {selectedCategory}
              <button
                onClick={() => setSelectedCategory("All Categories")}
                className="text-slate-400 hover:text-slate-700 ml-1 text-[11px] font-bold"
              >
                ✕
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedLocation("All Locations");
              setSelectedCategory("All Categories");
              setTimeRange("30D");
              setDateRangeLabel("Last 30 Days (Jul 26 – Aug 25, 2026)");
            }}
            className="text-blue-600 hover:text-blue-800 underline font-semibold ml-auto cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ── 4 Top KPI Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {chartLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        )}
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Revenue</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                ৳ {Number(kpi.total_revenue || 0).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                <span>↑ {kpi.revenue_change || "12.5%"}</span>
                <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
              </p>
            </div>
          </div>
          <MiniSparkline color="#3B82F6" data={[20, 25, 22, 35, 30, 45, 40, 55]} />
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Total Bookings</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {Number(kpi.total_bookings || 0).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                <span>↑ {kpi.bookings_change || "8.6%"}</span>
                <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
              </p>
            </div>
          </div>
          <MiniSparkline color="#22C55E" data={[15, 18, 24, 20, 32, 28, 38, 44]} />
        </div>

        {/* Active Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Active Users</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {Number(kpi.active_users || 0).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                <span>↑ {kpi.users_change || "15.3%"}</span>
                <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
              </p>
            </div>
          </div>
          <MiniSparkline color="#8B5CF6" data={[10, 16, 14, 28, 22, 36, 42, 50]} />
        </div>

        {/* Active Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Package size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Active Listings</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {Number(kpi.active_listings || 0).toLocaleString()}
              </h3>
              <p className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                <span>↑ {kpi.listings_change || "7.2%"}</span>
                <span className="text-slate-400 font-normal text-[10px]">vs last month</span>
              </p>
            </div>
          </div>
          <MiniSparkline color="#F97316" data={[12, 19, 15, 22, 20, 30, 28, 35]} />
        </div>
      </div>

      {/* ── Middle Row: Revenue Overview & Booking Status ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Revenue & Bookings Overview */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">Revenue & Bookings Overview</h2>
              <Info size={14} className="text-slate-400" />
            </div>

            {/* Time range tabs */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs">
              {["Today", "7D", "30D", "This Year", "Custom"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    timeRange === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <span className="text-xs text-slate-600 font-medium">Revenue (৳)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
              <span className="text-xs text-slate-600 font-medium">Bookings</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[260px] w-full relative">
            {chartLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                <Loader2 size={24} className="animate-spin text-blue-600" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 100000 ? `৳ ${(v / 100000).toFixed(1)}L` : `৳ ${v / 1000}K`)}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #F1F5F9",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any) => [
                    name === "revenue" ? `৳ ${Number(val).toLocaleString()}` : val,
                    name === "revenue" ? "Revenue" : "Bookings",
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  dot={{ r: 4, fill: "#38BDF8", strokeWidth: 2, stroke: "#FFFFFF" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Booking Status */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <h2 className="text-sm font-bold text-slate-900">Booking Status</h2>
            <Info size={14} className="text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1 my-2">
            {/* Donut Chart */}
            <div className="sm:col-span-6 h-[170px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    stroke="none"
                  >
                    {bookingStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-900">
                  {totalBookingsCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="sm:col-span-6 space-y-2.5">
              {bookingStatusData.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 text-xs">
                    {item.count}{" "}
                    <span className="text-slate-400 font-normal text-[10px]">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Third Row: Top Categories, ID Verification, Recent Activity ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Top Categories by Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">Top Categories by Bookings</h2>
              <Info size={14} className="text-slate-400" />
            </div>
            <Link href="/admin/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View Full Report
            </Link>
          </div>

          {/* Categories Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-medium border-b border-slate-100 pb-2">
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Bookings</th>
                  <th className="pb-3 text-right">Revenue (৳)</th>
                  <th className="pb-3 text-right pl-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCategories.map((cat: any) => (
                  <tr key={cat.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2.5 font-medium text-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </td>
                    <td className="py-3 text-center text-slate-600 font-semibold">{cat.bookings}</td>
                    <td className="py-3 text-right text-slate-900 font-semibold">
                      {Number(cat.revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right pl-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[11px] text-slate-500 font-medium w-6 text-right">
                          {cat.percentage}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cat.percentage}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Identity Verification Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900">Identity Verification Overview</h2>
              <Info size={14} className="text-slate-400" />
            </div>
            <Link href="/admin/identity-verifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {idVerifications.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2.5">
                  <div className="shrink-0">{getVerificationIcon(item.icon)}</div>
                  <span className="text-slate-700 font-medium text-xs">{item.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-xs">{item.count.toLocaleString()}</span>
                  <span className="text-slate-400 text-[11px] w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <Link href="/admin/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {recentActivity.map((act: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                    {getActivityIcon(act.icon)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{act.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Monthly Revenue Summary ───────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900">Monthly Revenue Summary (2026)</h2>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-blue-600"></div>
              <span className="text-slate-600">Current Month (Aug)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-blue-100 border border-blue-200"></div>
              <span className="text-slate-500">Past Months</span>
            </div>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyRevenueData}
              margin={{ top: 32, right: 10, left: -10, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state && state.activeLabel) {
                  setHoveredMonth(state.activeLabel);
                }
              }}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <defs>
                <linearGradient id="barGradCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="barGradNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BFDBFE" />
                  <stop offset="100%" stopColor="#DBEAFE" />
                </linearGradient>
                <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E293B" floodOpacity="0.18" />
                </filter>
              </defs>

              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 100000 ? `৳ ${(v / 100000).toFixed(0)}L` : (v > 0 ? `৳ ${(v / 1000).toFixed(0)}K` : "৳ 0"))}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #F1F5F9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  padding: "8px 12px"
                }}
                formatter={(val: any) => [`৳ ${Number(val).toLocaleString()} BDT`, "Total Revenue"]}
              />
              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isCur = Boolean(payload.isCurrent);
                  const isHovered = hoveredMonth === payload.month;
                  const showBadge = isCur || isHovered;
                  const amt = Number(payload.revenue) || 0;

                  // Format real dynamic text
                  let textStr = "৳ 0";
                  if (amt >= 100000) {
                    textStr = `৳ ${(amt / 100000).toFixed(2)}L`;
                  } else if (amt >= 1000) {
                    textStr = `৳ ${(amt / 1000).toFixed(1)}K`;
                  } else if (amt > 0) {
                    textStr = `৳ ${Math.round(amt)}`;
                  }

                  const badgeWidth = Math.max(54, textStr.length * 7.2 + 16);
                  const barFill = isCur
                    ? "url(#barGradCurrent)"
                    : isHovered
                    ? "url(#barGradHover)"
                    : "url(#barGradNormal)";

                  return (
                    <g className="transition-all duration-200 cursor-pointer">
                      {showBadge && amt > 0 && (
                        <g>
                          {/* Badge background pill */}
                          <rect
                            x={x + width / 2 - badgeWidth / 2}
                            y={Math.max(2, y - 26)}
                            width={badgeWidth}
                            height={20}
                            rx={10}
                            fill={isCur ? "#2563EB" : "#1E293B"}
                            filter="url(#badgeShadow)"
                          />
                          {/* Triangle indicator */}
                          <polygon
                            points={`${x + width / 2 - 4},${Math.max(20, y - 7)} ${x + width / 2 + 4},${Math.max(20, y - 7)} ${x + width / 2},${Math.max(23, y - 3)}`}
                            fill={isCur ? "#2563EB" : "#1E293B"}
                          />
                          {/* Dynamic value text */}
                          <text
                            x={x + width / 2}
                            y={Math.max(16, y - 12)}
                            fill="#FFFFFF"
                            textAnchor="middle"
                            fontSize={10.5}
                            fontWeight="bold"
                            letterSpacing="0.01em"
                          >
                            {textStr}
                          </text>
                        </g>
                      )}
                      {/* Bar body */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={Math.max(height, 4)}
                        rx={6}
                        fill={barFill}
                      />
                    </g>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
