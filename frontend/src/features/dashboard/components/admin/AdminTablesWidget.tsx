import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import apiClient from "@/lib/axios";

interface Booking {
  id: string;
  product_id?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: string;
  product: {
    id?: string;
    title: string;
    image_url: string;
    category_id: string;
  };
  user?: {
    first_name: string;
    last_name: string;
  };
}

interface AdminTablesProps {
  bookings: Booking[];
}

export function AdminRecentBookingsWidget({ bookings }: AdminTablesProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "ongoing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "completed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
        <Link href="/admin/bookings" className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
              <th className="font-medium p-4">Booking ID</th>
              <th className="font-medium p-4">User</th>
              <th className="font-medium p-4">Item</th>
              <th className="font-medium p-4">Date</th>
              <th className="font-medium p-4">Amount</th>
              <th className="font-medium p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookings.map((booking) => {
              const productId = booking.product?.id || booking.product_id;
              return (
                <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 font-medium text-slate-900 text-xs">{booking.id.substring(0, 8)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 uppercase">
                        {booking.user ? `${booking.user.first_name[0]}${booking.user.last_name[0]}` : "U"}
                      </div>
                      <span className="font-medium text-slate-700 text-xs">{booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : "Unknown"}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-700 text-xs">
                    {productId ? (
                      <Link href={`/products/${productId}`} className="hover:text-indigo-600 transition-colors">
                        {booking.product?.title || "Unknown"}
                      </Link>
                    ) : (
                      booking.product?.title || "Unknown"
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{dayjs(booking.start_date).format("MMM DD, YYYY")}</td>
                  <td className="p-4 font-bold text-slate-900 text-xs">৳ {booking.total_amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminRecentUsersWidget() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/users")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setUsers(list.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-[#111625] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recently Registered Users</h2>
        <Link href="/admin/users" className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</Link>
      </div>
      {users.length === 0 && !loading ? (
        <p className="text-xs text-slate-400 py-4 text-center">No users registered yet.</p>
      ) : (
        <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {users.map((u, i) => {
            const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "User";
            const initials = fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
            const regDate = u.created_at ? dayjs(u.created_at).format("MMM DD, YYYY") : "Recently";

            return (
              <div key={u.id || i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl p-3 min-w-[200px] shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{regDate}</p>
                </div>
                <Link href={`/admin/users`} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MoreHorizontal size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
