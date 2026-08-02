import { MoreHorizontal } from "lucide-react";
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
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</button>
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
            {bookings.map((booking) => (
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
                <td className="p-4 font-medium text-slate-700 text-xs">{booking.product?.title || "Unknown"}</td>
                <td className="p-4 text-slate-500 text-xs">{dayjs(booking.start_date).format("MMM DD, YYYY")}</td>
                <td className="p-4 font-bold text-slate-900 text-xs">৳ {booking.total_amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminRecentUsersWidget() {
  const recentUsers = [
    { name: "Arafat Hossain", date: "May 24, 2025" },
    { name: "Tanzila Rahman", date: "May 24, 2025" },
    { name: "MD. Rashed", date: "May 23, 2025" },
    { name: "Sadia Islam", date: "May 23, 2025" },
    { name: "Imran Hossain", date: "May 22, 2025" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-900">Recently Registered Users</h2>
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</button>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {recentUsers.map((u, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-[180px] shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
              {u.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{u.date}</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
