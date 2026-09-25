"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Users,
  Store,
  Wallet,
  ArrowUp,
  ArrowDown,
  Info
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
  revenue_change?: string;
  bookings_change?: string;
  customers_change?: string;
  owners_change?: string;
}

interface AdminStatCardsProps {
  stats: AdminStats;
  timeRange?: string;
}

export function AdminStatCardsWidget({ stats, timeRange = "7D" }: AdminStatCardsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const revenue = stats.total_revenue || 0;
  const bookings = stats.total_bookings || 0;
  const customers = stats.total_customers || Math.max(0, (stats.total_users || 0) - (stats.total_owners || 0));
  const owners = stats.total_owners || 0;

  const getRangeLabel = (range: string) => {
    switch (range) {
      case "7D":
        return "previous 7 days";
      case "30D":
        return "previous 30 days";
      case "3M":
        return "previous 3 months";
      case "1Y":
        return "previous 1 year";
      default:
        return "previous period";
    }
  };

  const rangeText = getRangeLabel(timeRange);

  const cards = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `৳ ${Math.round(revenue).toLocaleString()}`,
      trend: stats.revenue_change || "+0.0%",
      isPositive: !stats.revenue_change || !stats.revenue_change.startsWith("-"),
      tooltip: "Gross revenue collected across all completed and confirmed bookings.",
      // Styling matching reference Card 1 (Mint / Emerald)
      cardBg: "bg-[#F2FBF6] dark:bg-[#0c1f17]",
      cardBorder: "border-[#C7F0D8] dark:border-emerald-900/60",
      iconBg: "bg-[#10B981]",
      iconColor: "text-white",
      sparklineColor: "#10B981",
      watermarkColor: "text-[#10B981]/15 dark:text-[#10B981]/10",
      // Stacked coins icon
      iconType: "coins",
      watermarkType: "wallet",
      sparklinePath: "M 0,26 C 25,28 45,18 75,23 C 105,28 135,16 165,22 C 195,27 225,17 255,21 C 280,24 295,18 320,20",
    },
    {
      id: "bookings",
      title: "Total Bookings",
      value: bookings.toLocaleString(),
      trend: stats.bookings_change || "+0.0%",
      isPositive: !stats.bookings_change || !stats.bookings_change.startsWith("-"),
      tooltip: "Total rental bookings initiated and confirmed through the platform.",
      // Styling matching reference Card 2 (Sky / Blue)
      cardBg: "bg-[#F2F7FF] dark:bg-[#0c172a]",
      cardBorder: "border-[#CCE2FE] dark:border-blue-900/60",
      iconBg: "bg-[#3B82F6]",
      iconColor: "text-white",
      sparklineColor: "#3B82F6",
      watermarkColor: "text-[#3B82F6]/15 dark:text-[#3B82F6]/10",
      iconType: "calendar",
      watermarkType: "calendar",
      sparklinePath: "M 0,27 C 30,29 60,16 95,24 C 130,31 165,15 200,21 C 235,26 265,14 295,19 C 308,21 315,16 320,18",
    },
    {
      id: "customers",
      title: "Total Customers",
      value: customers.toLocaleString(),
      trend: stats.customers_change || "+0.0%",
      isPositive: !stats.customers_change || !stats.customers_change.startsWith("-"),
      tooltip: "Registered customers actively browsing and renting products.",
      // Styling matching reference Card 3 (Soft Purple / Lavender)
      cardBg: "bg-[#F7F4FF] dark:bg-[#171029]",
      cardBorder: "border-[#E1D4FE] dark:border-purple-900/60",
      iconBg: "bg-[#8B5CF6]",
      iconColor: "text-white",
      sparklineColor: "#8B5CF6",
      watermarkColor: "text-[#8B5CF6]/15 dark:text-[#8B5CF6]/10",
      iconType: "users",
      watermarkType: "users",
      sparklinePath: "M 0,28 C 30,30 65,17 105,25 C 145,32 180,18 215,23 C 250,28 280,16 305,21 C 312,22 316,18 320,19",
    },
    {
      id: "owners",
      title: "Total Owners",
      value: owners.toLocaleString(),
      trend: stats.owners_change || "+0.0%",
      isPositive: !stats.owners_change || !stats.owners_change.startsWith("-"),
      tooltip: "Verified equipment and item owners listing assets on RentHub.",
      // Styling matching reference Card 4 (Soft Amber / Peach)
      cardBg: "bg-[#FFF9EE] dark:bg-[#23170a]",
      cardBorder: "border-[#FEDEB2] dark:border-amber-900/60",
      iconBg: "bg-[#F59E0B]",
      iconColor: "text-white",
      sparklineColor: "#F59E0B",
      watermarkColor: "text-[#F59E0B]/15 dark:text-[#F59E0B]/10",
      iconType: "store",
      watermarkType: "store",
      sparklinePath: "M 0,25 C 35,27 75,16 115,22 C 155,28 190,14 225,23 C 260,18 285,12 305,10 C 312,9 316,7 320,6",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-5.5 border ${card.cardBg} ${card.cardBorder} shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[160px]`}
          >
            {/* Top Section: Icon on Left, Info & Details */}
            <div className="relative z-10 flex items-start gap-3.5">
              {/* Squircle Badge Icon */}
              <div
                className={`w-11 h-11 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}
              >
                {card.iconType === "coins" && (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="6" rx="8" ry="3" />
                    <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {card.iconType === "calendar" && <CalendarDays size={20} strokeWidth={2.2} />}
                {card.iconType === "users" && <Users size={20} strokeWidth={2.2} />}
                {card.iconType === "store" && <Store size={20} strokeWidth={2.2} />}
              </div>

              {/* Title & Info Icon */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                    {card.title}
                  </span>
                  <div
                    className="relative cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    onMouseEnter={() => setActiveTooltip(card.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <Info size={13} strokeWidth={2} />
                    {activeTooltip === card.id && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        {card.tooltip}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-0.5 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Number */}
                <h3 className="text-2xl sm:text-[27px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate leading-tight">
                  {card.value}
                </h3>

                {/* Trend Badge & Period */}
                <div className="flex items-center gap-1 mt-1.5 text-xs">
                  <span
                    className={`inline-flex items-center font-bold gap-0.5 ${
                      card.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {card.isPositive ? (
                      <ArrowUp size={13} strokeWidth={3} className="shrink-0" />
                    ) : (
                      <ArrowDown size={13} strokeWidth={3} className="shrink-0" />
                    )}
                    <span>{card.trend.replace("+", "")}</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                    vs. {rangeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Watermark Graphic */}
            <div className={`absolute right-3 top-4 sm:top-5 pointer-events-none select-none transition-transform duration-300 group-hover:scale-105 ${card.watermarkColor}`}>
              {card.watermarkType === "wallet" && (
                <Wallet size={78} strokeWidth={1.3} className="rotate-[-6deg]" />
              )}
              {card.watermarkType === "calendar" && (
                <CalendarDays size={74} strokeWidth={1.3} className="rotate-[-4deg]" />
              )}
              {card.watermarkType === "users" && (
                <Users size={76} strokeWidth={1.3} />
              )}
              {card.watermarkType === "store" && (
                <Store size={76} strokeWidth={1.3} className="rotate-[-3deg]" />
              )}
            </div>

            {/* Bottom Wave Sparkline */}
            <div className="relative z-10 w-full mt-3 -mb-1">
              <svg
                className="w-full h-8 overflow-visible"
                viewBox="0 0 320 36"
                preserveAspectRatio="none"
              >
                <path
                  d={card.sparklinePath}
                  fill="none"
                  stroke={card.sparklineColor}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
