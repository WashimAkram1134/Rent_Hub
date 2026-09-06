"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/authStore";
import AppShell from "@/components/layout/AppShell";
import { OwnerHeaderWidget } from "@/features/dashboard/components/owner/OwnerHeaderWidget";
import { StatCardsWidget } from "@/features/dashboard/components/owner/StatCardsWidget";
import { TrendingCategoriesWidget } from "@/features/dashboard/components/owner/TrendingCategoriesWidget";
import { EarningsChartWidget } from "@/features/dashboard/components/owner/EarningsChartWidget";
import { RecentRequestsWidget } from "@/features/dashboard/components/owner/RecentRequestsWidget";
import { MyListingsWidget } from "@/features/dashboard/components/owner/MyListingsWidget";
import { TodaysBusinessWidget } from "@/features/dashboard/components/owner/TodaysBusinessWidget";
import { OwnerPayoutCard } from "@/features/dashboard/components/owner/OwnerPayoutCard";
import { TopPerformingItemsWidget } from "@/features/dashboard/components/owner/TopPerformingItemsWidget";
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
  const [earningsChartData, setEarningsChartData] = useState<any[]>([]);
  const [bookingTrendData, setBookingTrendData] = useState<any[]>([]);
  const [todaysBusinessData, setTodaysBusinessData] = useState<any>(null);
  const [trendingCategories, setTrendingCategories] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const ownerId = user?.id;

      const [statsRes, bookingsRes, productsRes] = await Promise.all([
        apiClient
          .get("/analytics/owner-stats", { params: { owner_id: ownerId } })
          .then((r) => r.data)
          .catch(() => null),
        apiClient
          .get("/bookings", { params: { owner_id: ownerId, limit: 6 } })
          .then((r) => r.data)
          .catch(() => []),
        apiClient
          .get("/products", { params: { owner_id: ownerId, status: "all", limit: 12 } })
          .then((r) => r.data)
          .catch(() => []),
      ]);

      if (statsRes) {
        setStats({
          total_listings: statsRes.total_listings,
          active_rentals: statsRes.active_rentals,
          monthly_earnings: statsRes.monthly_earnings,
          pending_requests: statsRes.pending_requests,
        });
        if (statsRes.earnings_chart) setEarningsChartData(statsRes.earnings_chart);
        if (statsRes.booking_trend) setBookingTrendData(statsRes.booking_trend);
        if (statsRes.todays_business) setTodaysBusinessData(statsRes.todays_business);
        if (statsRes.trending_categories) setTrendingCategories(statsRes.trending_categories);
      }

      setRecentBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      setMyListings(Array.isArray(productsRes) ? productsRes : []);
    } catch (error) {
      console.error("Failed to fetch owner dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, [user?.id]);

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 max-w-[1440px] mx-auto pb-16">
        {/* 1. Rich Welcome & Host Performance Header (Full Width) */}
        <OwnerHeaderWidget
          user={user}
          pendingRequestsCount={stats.pending_requests}
          activeRentalsCount={stats.active_rentals}
        />

        {/* 2. Top 4 KPI Metric Cards (Full Width across 4 Columns) */}
        <StatCardsWidget stats={stats} />

        {/* 3. High-Demand / Most Booked Categories (Full Width with spacious cards) */}
        <TrendingCategoriesWidget categories={trendingCategories} />

        {/* 4. Balanced 2-Column Analytics & Business Operations Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ── Left Column (col-span-8): Charts, Requests & Listings ── */}
          <div className="xl:col-span-8 space-y-6">
            {/* Earnings Chart & Booking Trend */}
            <EarningsChartWidget
              earningsData={earningsChartData}
              bookingTrendData={bookingTrendData}
            />

            {/* Recent Rental Requests */}
            <RecentRequestsWidget
              requests={recentBookings}
              onRequestUpdated={fetchOwnerData}
            />

            {/* My Listings Inventory */}
            <MyListingsWidget listings={myListings} />
          </div>

          {/* ── Right Column (col-span-4): Toolkit, Schedule, Balance & Top Items ── */}
          <div className="xl:col-span-4 space-y-6">
            {/* Grow Your Business Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-[200px] bg-[#EBE9F6] border border-indigo-100">
              <div className="absolute inset-0 w-full h-full flex justify-end">
                <img
                  src="/images/promo-banner.png"
                  alt="Promo"
                  className="w-full h-full object-cover object-right opacity-30 mix-blend-multiply"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#EBE9F6] via-[#EBE9F6]/90 to-transparent w-4/5"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-center max-w-[90%]">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md self-start mb-2 uppercase tracking-wide">
                  Owner Toolkit
                </span>
                <h3 className="text-xl font-extrabold text-[#1F1B3E] mb-1.5 leading-tight">
                  Grow Your Rental Business
                </h3>
                <p className="text-[#645C99] text-xs leading-relaxed mb-3">
                  Manage all rental categories with automated payouts and escrow damage protection.
                </p>
                <Link
                  href="/products/new"
                  className="bg-[#1F1B3E] hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl self-start flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={13} /> Add New Listing
                </Link>
              </div>
            </div>

            {/* Today's Business Telemetry Schedule */}
            <TodaysBusinessWidget data={todaysBusinessData} />

            {/* Quick Payout Balance & Disbursal Card */}
            <OwnerPayoutCard
              pendingAmount={22050}
              paidAmount={34650}
            />

            {/* Top Performing Revenue Generating Items */}
            <TopPerformingItemsWidget />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
