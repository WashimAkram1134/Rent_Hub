import React from "react";
import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface EarningsChartProps {
  earningsData?: Array<{ name: string; thisMonth: number; lastMonth: number }>;
  bookingTrendData?: Array<{ name: string; bookings: number }>;
}

const defaultEarningsData = [
  { name: "May 13", thisMonth: 15000, lastMonth: 12000 },
  { name: "May 14", thisMonth: 22000, lastMonth: 18000 },
  { name: "May 15", thisMonth: 18000, lastMonth: 24000 },
  { name: "May 16", thisMonth: 32000, lastMonth: 19000 },
  { name: "May 17", thisMonth: 28000, lastMonth: 22000 },
  { name: "May 18", thisMonth: 38000, lastMonth: 28000 },
  { name: "May 19", thisMonth: 35000, lastMonth: 30000 },
];

const defaultBookingTrendData = [
  { name: "Mon", bookings: 12 },
  { name: "Tue", bookings: 18 },
  { name: "Wed", bookings: 24 },
  { name: "Thu", bookings: 16 },
  { name: "Fri", bookings: 32 },
  { name: "Sat", bookings: 42 },
  { name: "Sun", bookings: 38 },
];

export function EarningsChartWidget({
  earningsData = defaultEarningsData,
  bookingTrendData = defaultBookingTrendData,
}: EarningsChartProps) {
  const chartData = earningsData && earningsData.length > 0 ? earningsData : defaultEarningsData;
  const trendData = bookingTrendData && bookingTrendData.length > 0 ? bookingTrendData : defaultBookingTrendData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Earnings Overview Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Earnings Overview</h2>
            <Link href="/earnings" className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold hover:underline">
              View report
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold mb-4">
            <div className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-0.5 bg-indigo-600 rounded-full"></span> This Month
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-300 rounded-full border border-dashed border-slate-400"></span> Last Month
            </div>
          </div>
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThisMonthOwner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94A3B8" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94A3B8" }} tickFormatter={(val) => `৳${Math.round(val / 1000)}k`} />
              <Tooltip
                formatter={(value: any) => [`৳ ${Number(value).toLocaleString()}`, "Earnings"]}
                cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="lastMonth" stroke="#CBD5E1" strokeDasharray="5 5" fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="thisMonth" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThisMonthOwner)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Booking Trend Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Booking Trend</h2>
            <Link href="/owner/bookings" className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold hover:underline">
              View report
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold mb-4">
            <div className="flex items-center gap-1.5 text-indigo-600">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div> Bookings
            </div>
          </div>
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94A3B8" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94A3B8" }} />
              <Tooltip
                formatter={(value: any) => [`${value} Bookings`, "Volume"]}
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px" }}
              />
              <Bar dataKey="bookings" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
