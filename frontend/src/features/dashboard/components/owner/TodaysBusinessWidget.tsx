import React from "react";
import Link from "next/link";
import { Calendar, AlertCircle, RefreshCw, MessageSquare, ChevronRight } from "lucide-react";

interface TodaysBusinessProps {
  data?: {
    todays_bookings: number;
    pending_pickup: number;
    returns_today: number;
    new_messages: number;
  };
}

export function TodaysBusinessWidget({ data }: TodaysBusinessProps) {
  const business = data || {
    todays_bookings: 8,
    pending_pickup: 3,
    returns_today: 2,
    new_messages: 5,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Today's Business</h2>
      <div className="space-y-4">
        <Link
          href="/owner/bookings"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 text-slate-600">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-700">Today's Bookings</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{business.todays_bookings}</span>
        </Link>

        <Link
          href="/owner/bookings?status=pending"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 text-slate-600">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <AlertCircle size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-700">Pending Pickup</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{business.pending_pickup}</span>
        </Link>

        <Link
          href="/calendar"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 text-slate-600">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <RefreshCw size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-700">Returns Today</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{business.returns_today}</span>
        </Link>

        <Link
          href="/messages"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 text-slate-600">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <MessageSquare size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-700">New Messages</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{business.new_messages}</span>
        </Link>
      </div>

      <Link
        href="/calendar"
        className="w-full mt-5 bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 active:scale-98"
      >
        View Schedule <ChevronRight size={14} />
      </Link>
    </div>
  );
}
