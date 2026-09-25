"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { CalendarDays, ChevronDown, Crown } from "lucide-react";
import dayjs from "dayjs";

import { AdminTodaysAttentionWidget } from "@/features/dashboard/components/admin/AdminTodaysAttentionWidget";
import { AdminStatCardsWidget } from "@/features/dashboard/components/admin/AdminStatCardsWidget";
import { AdminChartsWidget, AdminUserGrowthChart } from "@/features/dashboard/components/admin/AdminChartsWidget";
import { AdminRecentBookingsWidget, AdminRecentUsersWidget } from "@/features/dashboard/components/admin/AdminTablesWidget";
import { 
  AdminPlatformSummaryWidget, 
  AdminTopCategoriesWidget, 
  AdminQuickActionsWidget, 
  AdminRecentDisputesWidget, 
  AdminSystemHealthWidget,
  AdminPendingListingsWidget
} from "@/features/dashboard/components/admin/AdminSidebarWidgets";
import apiClient from "@/lib/axios";

export function AdminDashboard() {
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState({
    total_users: 0,
    total_customers: 0,
    total_owners: 0,
    total_listings: 0,
    total_bookings: 0,
    total_revenue: 0,
    total_payouts: 0,
    open_disputes: 0,
    pending_listings: 0,
    pending_listers: 0,
    pending_payouts: 0,
    failed_payouts: 0,
    revenue_change: "+0.0%",
    bookings_change: "+0.0%",
    customers_change: "+0.0%",
    owners_change: "+0.0%",
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [timeRange, setTimeRange] = useState("7D");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          apiClient.get("/analytics/admin-stats", { params: { range: timeRange } }).then(r => r.data).catch(() => null),
          apiClient.get("/bookings", { params: { limit: 6 } }).then(r => r.data).catch(() => [])
        ]);
        
        if (statsRes) {
          setStats(statsRes);
        }
        
        setRecentBookings(bookingsRes || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      }
    };
    fetchAdminData();
  }, [timeRange]);

  if (!user) return null;

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRangeDays = () => {
    if (timeRange === "7D") return 7;
    if (timeRange === "30D") return 30;
    if (timeRange === "3M") return 90;
    return 365;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full font-sans">
      {/* Header Bar — Hero Greeting Section matching reference design */}
      <header className="bg-transparent px-1 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#4A85F6] via-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Crown size={26} className="text-white fill-white/20 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase block">
              Business Command Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              {getGreeting()}, {user.first_name || "Admin"}! 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Here&apos;s what&apos;s happening with your RentHub platform today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Calendar Date Range Button */}
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs w-fit">
            <CalendarDays size={14} className="text-slate-400" />
            <span>
              {dayjs().format("MMM D, YYYY")} – {dayjs().add(getRangeDays(), "day").format("MMM D, YYYY")}
            </span>
            <ChevronDown size={13} className="text-slate-400 ml-0.5" />
          </button>

          {/* Quick Date Range Pills */}
          <div className="flex items-center bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-xs">
            {["7D", "30D", "3M", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#1E293B] dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold"
                    : "hover:text-slate-900 dark:hover:text-white font-medium"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        {/* 1. Top 4 Business KPI Cards (Revenue, Bookings, Customers, Owners) */}
        <AdminStatCardsWidget stats={stats} timeRange={timeRange} />

        {/* 2. Today's Attention Command Queue Banner */}
        <AdminTodaysAttentionWidget stats={stats} />

        {/* 3. Middle Performance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AdminChartsWidget />
          <AdminPlatformSummaryWidget stats={stats} />
        </div>

        {/* 4. Bottom Operations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side (col 8) */}
          <div className="lg:col-span-8 space-y-6">
            <AdminRecentBookingsWidget bookings={recentBookings} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminTopCategoriesWidget />
              <AdminUserGrowthChart />
            </div>

            <AdminRecentUsersWidget />
          </div>

          {/* Right Side (col 4) */}
          <div className="lg:col-span-4 space-y-6">
            <AdminPendingListingsWidget />
            <AdminQuickActionsWidget />
            <AdminRecentDisputesWidget />
            <AdminSystemHealthWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
