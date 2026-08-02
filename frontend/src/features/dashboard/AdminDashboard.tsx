"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { CalendarDays, ChevronDown } from "lucide-react";
import dayjs from "dayjs";

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
    total_listings: 0,
    total_bookings: 0,
    total_revenue: 0,
    total_payouts: 0,
    open_disputes: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          apiClient.get("/analytics/admin-stats").then(r => r.data).catch(() => null),
          apiClient.get("/bookings", { params: { limit: 6 } }).then(r => r.data).catch(() => [])
        ]);
        
        setStats(statsRes || { 
          total_users: 0, total_listings: 0, total_bookings: 0, 
          total_revenue: 0, total_payouts: 0, open_disputes: 0 
        });
        
        setRecentBookings(bookingsRes || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      }
    };
    fetchAdminData();
  }, []);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar for Navigation */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Good morning, {user.first_name}! 👋</h1>
            <p className="text-slate-500 text-xs mt-1">Here's what's happening on your platform today.</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm w-fit">
            <CalendarDays size={16} className="text-slate-500" />
            {dayjs().format('MMM D')} – {dayjs().add(7, 'day').format('MMM D, YYYY')}
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Top Stat Cards */}
            <AdminStatCardsWidget stats={stats} />

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <AdminChartsWidget />
              <AdminPlatformSummaryWidget />
            </div>

            {/* Bottom Row */}
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
      </div>
    </div>
  );
}
