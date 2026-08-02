"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/authStore";
import AppShell from "@/components/layout/AppShell";
import { StatCardsWidget } from "@/features/dashboard/components/owner/StatCardsWidget";
import { RecentRequestsWidget } from "@/features/dashboard/components/owner/RecentRequestsWidget";
import { EarningsChartWidget } from "@/features/dashboard/components/owner/EarningsChartWidget";
import { MyListingsWidget } from "@/features/dashboard/components/owner/MyListingsWidget";
import { TodaysBusinessWidget } from "@/features/dashboard/components/owner/TodaysBusinessWidget";
import { Plus } from "lucide-react";
import apiClient from "@/lib/axios";

export function OwnerDashboard() {
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState({
    total_listings: 0,
    active_rentals: 0,
    monthly_earnings: 0,
    pending_requests: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const [statsRes, bookingsRes, productsRes] = await Promise.all([
          apiClient.get("/analytics/owner-stats").then(r => r.data).catch(() => null),
          apiClient.get("/bookings", { params: { limit: 5 } }).then(r => r.data).catch(() => []),
          apiClient.get("/products", { params: { owner_id: user?.id, status: "all", limit: 10 } }).then(r => r.data).catch(() => [])
        ]);
        
        setStats(statsRes || { total_listings: 0, active_rentals: 0, monthly_earnings: 0, pending_requests: 0 });
        setRecentBookings(bookingsRes || []);
        setMyListings(productsRes || []);
      } catch (error) {
        console.error("Failed to fetch owner dashboard data:", error);
      }
    };
    fetchOwnerData();
  }, [user]);

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Good morning, {user.first_name}! 👋</h1>
            <p className="text-slate-500 text-xs mt-1">Here's how your rental business is performing today.</p>
          </div>
          <Link
            href="/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
          >
            <Plus size={16} /> Add New Listing
          </Link>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ── Left Column (col-span-8) ── */}
          <div className="xl:col-span-8 space-y-6">
            <StatCardsWidget stats={stats} />
            <EarningsChartWidget />
            <RecentRequestsWidget requests={recentBookings} />
            <MyListingsWidget listings={myListings} />
          </div>

          {/* ── Right Column (col-span-4) ── */}
          <div className="xl:col-span-4 space-y-6">
            {/* Promo Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-[220px] bg-[#EBE9F6]">
              <div className="absolute inset-0 w-full h-full flex justify-end">
                <img src="/images/promo-banner.png" alt="Promo" className="w-full h-full object-cover object-right opacity-30 mix-blend-multiply" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#EBE9F6] via-[#EBE9F6]/90 to-transparent w-3/4"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-center max-w-[85%]">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1B3E] mb-3 leading-tight">Grow Your Rental Business</h3>
                <p className="text-[#645C99] text-sm leading-relaxed mb-6">Manage every rental category from one single dashboard.</p>
              </div>
            </div>

            <TodaysBusinessWidget />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
