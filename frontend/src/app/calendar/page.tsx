"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/features/auth/authStore";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import dayjs from "dayjs";
import apiClient from "@/lib/axios";

export default function OwnerCalendarPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/bookings", {
          params: { owner_id: user?.id, limit: 100 },
        });
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load calendar bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.id]);

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfMonth = currentMonth.startOf("month").day();

  const calendarDays = [];
  for (let i = 0; i < startDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(currentMonth.date(d));
  }

  const selectedDateBookings = bookings.filter((b) => {
    const start = dayjs(b.start_date);
    const end = dayjs(b.end_date);
    const sel = dayjs(selectedDate);
    return sel.isSame(start, "day") || sel.isSame(end, "day") || (sel.isAfter(start) && sel.isBefore(end));
  });

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Schedule & Calendar</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {bookings.length} Scheduled Rentals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Track item pickup dates, return deadlines, and active rental reservations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-extrabold text-sm text-slate-900 min-w-[130px] text-center">
              {currentMonth.format("MMMM YYYY")}
            </span>
            <button
              onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid & Side Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Month Grid */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 rounded-xl"></div>;
                }

                const dateStr = day.format("YYYY-MM-DD");
                const isSelected = dateStr === selectedDate;
                const isToday = day.isSame(dayjs(), "day");

                // Check active bookings on this date
                const dayBookings = bookings.filter((b) => {
                  const start = dayjs(b.start_date);
                  const end = dayjs(b.end_date);
                  return day.isSame(start, "day") || day.isSame(end, "day") || (day.isAfter(start) && day.isBefore(end));
                });

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 p-2 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-102 z-10"
                        : isToday
                        ? "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                        : "bg-white border-slate-100 hover:border-indigo-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isSelected ? "text-white" : ""}`}>{day.date()}</span>
                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </div>

                    {dayBookings.length > 0 && (
                      <div className="space-y-0.5">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md truncate block ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {dayBookings.length} Rental{dayBookings.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Schedule Panel */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <p className="text-xs text-slate-400 font-semibold">Schedule for</p>
              <h3 className="font-extrabold text-base text-slate-900">
                {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
              </h3>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {selectedDateBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <CalendarIcon size={32} className="mx-auto text-slate-300" />
                  <p>No bookings scheduled for this date.</p>
                </div>
              ) : (
                selectedDateBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {b.product?.title || "Item"}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md capitalize">
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Customer: {b.renter?.first_name || "Verified Customer"}</span>
                      <span className="font-bold text-slate-900">৳ {Number(b.total_amount).toLocaleString()}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{dayjs(b.start_date).format("MMM D")} → {dayjs(b.end_date).format("MMM D")}</span>
                      <Link href="/owner/bookings" className="text-indigo-600 font-bold hover:underline">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
