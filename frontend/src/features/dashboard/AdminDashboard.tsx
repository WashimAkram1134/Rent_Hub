"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { CalendarDays, ChevronDown } from "lucide-react";
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
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [timeRange, setTimeRange] = useState("30D");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          apiClient.get("/analytics/admin-stats").then(r => r.data).catch(() => null),
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
  }, []);

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full font-sans">
      {/* Header Bar */}
      <header className="bg-transparent border-b border-slate-200 dark:border-slate-800 px-1 py-4 flex items-center justify-between shrink-0 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Business Command Center
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
              Admin Console
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Welcome back, {user.first_name}. Here is your marketplace operational snapshot for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Date Range Pills */}
          <div className="hidden sm:flex items-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
            {["7D", "30D", "3M", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeRange === r
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs w-fit">
            <CalendarDays size={14} className="text-slate-400" />
            {dayjs().format('MMM D')} – {dayjs().add(7, 'day').format('MMM D, YYYY')}
            <ChevronDown size={13} className="text-slate-400 ml-0.5" />
          </button>
        </div>
      </header>

      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        {/* 1. Dynamic "Today's Attention" Command Queue */}
        <AdminTodaysAttentionWidget stats={stats} />

        {/* 2. Top 4 Business KPI Cards (Revenue, Bookings, Customers, Owners) */}
        <AdminStatCardsWidget stats={stats} />

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
