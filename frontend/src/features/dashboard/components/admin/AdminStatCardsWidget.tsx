"use client";

import React from "react";
import {
  Banknote,
  Calendar,
  ShoppingBag,
  Store,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface AdminStats {
  total_users?: number;
  total_customers?: number;
  total_owners?: number;
  total_listings?: number;
  total_bookings?: number;
  total_revenue?: number;
  total_payouts?: number;
  open_disputes?: number;
}

interface AdminStatCardsProps {
  stats: AdminStats;
}

export function AdminStatCardsWidget({ stats }: AdminStatCardsProps) {
  const revenue = stats.total_revenue || 0;
  const bookings = stats.total_bookings || 0;
  const customers = stats.total_customers || Math.max(0, (stats.total_users || 0) - (stats.total_owners || 0));
  const owners = stats.total_owners || 0;
  const listings = stats.total_listings || 0;
  const payouts = stats.total_payouts || 0;

  const topCards = [
    {
      title: "Platform Revenue",
      value: `৳ ${Math.round(revenue).toLocaleString()}`,
      trend: "+12.4%",
      isPositive: true,
      icon: Banknote,
      color: "bg-emerald-600 text-white",
      caption: "Gross rental volume"
    },
    {
      title: "Total Bookings",
      value: bookings.toLocaleString(),
      trend: "+8.2%",
      isPositive: true,
      icon: Calendar,
      color: "bg-blue-600 text-white",
      caption: "Confirmed & completed"
    },
    {
      title: "Active Customers",
      value: (customers || 1).toLocaleString(),
      trend: "+15.0%",
      isPositive: true,
      icon: ShoppingBag,
      color: "bg-indigo-600 text-white",
      caption: "Verified renters"
    },
    {
      title: "Active Owners",
      value: (owners || 1).toLocaleString(),
      trend: "+9.0%",
      isPositive: true,
      icon: Store,
      color: "bg-amber-600 text-white",
      caption: "Asset providers"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {topCards.map((stat, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111625] p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
        >
          {/* Top Row: Icon + Trend */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>

            <span
              className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-black border tracking-tight ${
                stat.isPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
                  : "bg-rose-50 text-rose-600 border-rose-200/60"
              }`}
            >
              {stat.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              <span>{stat.trend}</span>
            </span>
          </div>

          {/* Metric Value & Title */}
          <div className="my-3">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
              {stat.value}
            </h3>
          </div>

          {/* Context Footer */}
          <p className="text-[11px] font-medium text-slate-400 leading-none">
            {stat.caption}
          </p>
        </div>
      ))}
    </div>
  );
}
