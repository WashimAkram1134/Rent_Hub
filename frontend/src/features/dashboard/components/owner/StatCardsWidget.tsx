import Link from "next/link";
import { FileText, CalendarCheck, Wallet, Clock } from "lucide-react";

interface StatCardsProps {
  stats: {
    total_listings: number;
    active_rentals: number;
    monthly_earnings: number;
    pending_requests: number;
  };
}

export function StatCardsWidget({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Listings Card */}
      <Link href="/products/new" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><FileText size={20} /></div>
          <p className="text-slate-600 text-xs font-semibold">Total Listings</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total_listings}</h3>
        <p className="text-[10px] text-slate-500">Active Listings</p>
        <p className="text-emerald-500 text-[10px] font-bold mt-3">↑ 12% <span className="text-slate-400 font-medium">from last month</span></p>
      </Link>

      {/* Active Rentals Card */}
      <Link href="/owner/bookings" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><CalendarCheck size={20} /></div>
          <p className="text-slate-600 text-xs font-semibold">Active Rentals</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.active_rentals}</h3>
        <p className="text-[10px] text-slate-500">Currently Rented</p>
        <p className="text-emerald-500 text-[10px] font-bold mt-3">↑ 8% <span className="text-slate-400 font-medium">from last month</span></p>
      </Link>

      {/* Monthly Earnings Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl"><Wallet size={20} /></div>
          <p className="text-slate-600 text-xs font-semibold">Monthly Earnings</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">৳ {stats.monthly_earnings.toLocaleString()}</h3>
        <p className="text-[10px] text-slate-500">This Month</p>
        <p className="text-emerald-500 text-[10px] font-bold mt-3">↑ 18% <span className="text-slate-400 font-medium">from last month</span></p>
      </div>

      {/* Pending Requests Card */}
      <Link href="/owner/bookings" className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 bg-amber-50/20 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors"><Clock size={20} /></div>
          <p className="text-slate-700 text-xs font-bold">Pending Requests</p>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.pending_requests}</h3>
        <p className="text-[10px] text-amber-700 font-bold">Waiting Approval</p>
        <p className="text-amber-600 text-[10px] font-bold mt-3 group-hover:underline flex items-center gap-1">Click to review requests →</p>
      </Link>
    </div>
  );
}
