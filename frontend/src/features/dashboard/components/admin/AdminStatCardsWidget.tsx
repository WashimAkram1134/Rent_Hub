"use client";

import React from "react";
import {
  Users,
  FileText,
  Calendar,
  Banknote,
  CreditCard,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  total_listings: number;
  total_bookings: number;
  total_revenue: number;
  total_payouts: number;
  open_disputes: number;
}

interface AdminStatCardsProps {
  stats: AdminStats;
}

export function AdminStatCardsWidget({ stats }: AdminStatCardsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: (stats.total_users || 0).toLocaleString(),
      trend: "+12.5%",
      isPositive: true,
      icon: Users,
      color: "bg-indigo-600 text-white",
      bgLight: "bg-indigo-50",
    },
    {
      title: "Total Listings",
      value: (stats.total_listings || 0).toLocaleString(),
      trend: "+9.3%",
      isPositive: true,
      icon: FileText,
      color: "bg-emerald-600 text-white",
      bgLight: "bg-emerald-50",
    },
    {
      title: "Total Bookings",
      value: (stats.total_bookings || 0).toLocaleString(),
      trend: "+11.7%",
      isPositive: true,
      icon: Calendar,
      color: "bg-blue-600 text-white",
      bgLight: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: `৳ ${Math.round(stats.total_revenue || 0).toLocaleString()}`,
      trend: "+15.2%",
      isPositive: true,
      icon: Banknote,
      color: "bg-amber-500 text-white",
      bgLight: "bg-amber-50",
    },
    {
      title: "Total Payouts",
      value: `৳ ${Math.round(stats.total_payouts || 0).toLocaleString()}`,
      trend: "+13.1%",
      isPositive: true,
      icon: CreditCard,
      color: "bg-purple-600 text-white",
      bgLight: "bg-purple-50",
    },
    {
      title: "Open Disputes",
      value: (stats.open_disputes || 0).toString(),
      trend: "-5.6%",
      isPositive: false,
      icon: Flag,
      color: "bg-rose-500 text-white",
      bgLight: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-4.5 sm:p-5 rounded-2xl shadow-xs border border-slate-100/90 flex flex-col justify-between min-h-[145px] hover:shadow-md hover:border-slate-200 transition-all group"
        >
          {/* Top Row: Icon + Trend Pill */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${stat.color}`}
            >
              <stat.icon size={18} />
            </div>

            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border tracking-tight ${
                stat.isPositive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                  : "bg-rose-50 text-rose-600 border-rose-200/60"
              }`}
            >
              {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{stat.trend}</span>
            </span>
          </div>

          {/* Metric Value & Title */}
          <div className="my-2">
            <p className="text-slate-500 text-xs font-semibold tracking-tight">{stat.title}</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              {stat.value}
            </h3>
          </div>

          {/* Context Footer */}
          <p className="text-[11px] font-medium text-slate-400 leading-none">
            vs last week
          </p>
        </div>
      ))}
    </div>
  );
}
