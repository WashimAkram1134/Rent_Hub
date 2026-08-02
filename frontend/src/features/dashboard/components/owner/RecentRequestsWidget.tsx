import Link from "next/link";
import { MoreVertical, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

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
}

interface RecentRequestsProps {
  requests: Booking[];
}

export function RecentRequestsWidget({ requests }: RecentRequestsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ongoing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
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
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div className="w-10 h-8 rounded-md overflow-hidden shrink-0 bg-slate-100">
                      {req.product?.image_url && <img src={req.product.image_url} alt={req.product.title} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{req.product?.title || "Unknown"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                      G
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Guest Renter</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {dayjs(req.start_date).format("MMM D")} - {dayjs(req.end_date).format("MMM D, YYYY")}
                  </p>
                  <p className="text-[10px] text-slate-500">{req.total_days} Days</p>
                </td>
                <td className="py-3 pr-4 text-xs font-bold text-slate-900 whitespace-nowrap">৳ {req.total_amount.toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <Link href="/owner/bookings" className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize whitespace-nowrap hover:opacity-80 transition-opacity ${getStatusColor(req.status)}`}>
                    {req.status}
                  </Link>
                </td>
                <td className="py-3 text-right min-w-[30px]">
                  <Link href="/owner/bookings" className="text-slate-400 hover:text-indigo-600 p-1 block">
                    <MoreVertical size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  No recent requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
