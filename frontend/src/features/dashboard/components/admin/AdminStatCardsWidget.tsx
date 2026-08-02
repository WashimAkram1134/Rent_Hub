import { Users, FileText, Calendar, Banknote, CreditCard, Flag, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    { title: "Total Users", value: stats.total_users.toLocaleString(), trend: "12.5%", isPositive: true, icon: Users, color: "bg-indigo-600 text-white" },
    { title: "Total Listings", value: stats.total_listings.toLocaleString(), trend: "9.3%", isPositive: true, icon: FileText, color: "bg-emerald-500 text-white" },
    { title: "Total Bookings", value: stats.total_bookings.toLocaleString(), trend: "11.7%", isPositive: true, icon: Calendar, color: "bg-blue-600 text-white" },
    { title: "Total Revenue", value: `৳ ${(stats.total_revenue || 0).toLocaleString()}`, trend: "15.2%", isPositive: true, icon: Banknote, color: "bg-amber-500 text-white" },
    { title: "Total Payouts", value: `৳ ${(stats.total_payouts || 0).toLocaleString()}`, trend: "13.1%", isPositive: true, icon: CreditCard, color: "bg-purple-600 text-white" },
    { title: "Open Disputes", value: stats.open_disputes.toString(), trend: "5.6%", isPositive: false, icon: Flag, color: "bg-red-500 text-white" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[130px]">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className={`flex items-center gap-1 text-[11px] font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.trend}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-slate-500 text-xs font-medium mb-1">{stat.title}</p>
            <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">vs last week</p>
        </div>
      ))}
    </div>
  );
}
