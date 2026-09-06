import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical, ChevronRight, Check, X, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import apiClient from "@/lib/axios";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: string;
  product: {
    title: string;
    image_url: string;
  };
  renter?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface RecentRequestsProps {
  requests: Booking[];
  onRequestUpdated?: () => void;
}

export function RecentRequestsWidget({ requests, onRequestUpdated }: RecentRequestsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "approved":
      case "confirmed":
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "rejected":
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      await apiClient.put(`/bookings/${id}/status`, { status: newStatus });
      if (onRequestUpdated) onRequestUpdated();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update booking status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recent Rental Requests</h2>
          <p className="text-[11px] text-slate-400">Incoming requests for your items</p>
        </div>
        <Link
          href="/owner/bookings"
          className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 hover:underline"
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Item</th>
              <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="pb-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                  No rental requests found for your items yet.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3 min-w-[170px]">
                      <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        {req.product?.image_url ? (
                          <img src={req.product.image_url} alt={req.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">Item</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{req.product?.title || "Item"}</p>
                        <p className="text-[10px] font-mono text-slate-400">#{req.id.slice(0, 6)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                        {req.renter?.first_name ? req.renter.first_name.charAt(0) : "C"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                          {req.renter?.first_name ? `${req.renter.first_name} ${req.renter.last_name || ""}` : "Customer"}
                        </p>
                        <span className="text-[9px] text-emerald-600 font-semibold">NID Verified</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {dayjs(req.start_date).format("MMM D")} - {dayjs(req.end_date).format("MMM D, YYYY")}
                    </p>
                    <p className="text-[10px] text-slate-500">{req.total_days} Days Rental</p>
                  </td>

                  <td className="py-3 pr-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                    ৳ {Number(req.total_amount).toLocaleString()}
                  </td>

                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize whitespace-nowrap ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>

                  <td className="py-3 text-right whitespace-nowrap">
                    {req.status.toLowerCase() === "pending" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusUpdate(req.id, "approved")}
                          disabled={actionLoading === req.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === req.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, "rejected")}
                          disabled={actionLoading === req.id}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/owner/bookings"
                        className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        Details <ChevronRight size={13} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
