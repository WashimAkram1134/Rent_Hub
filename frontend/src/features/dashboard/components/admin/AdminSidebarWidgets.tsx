import { useState, useEffect } from "react";
import { ArrowUpRight, UserPlus, ListPlus, Users, FileText, ShieldAlert, Settings, Server, CreditCard, Mail, Database, CheckCircle2 } from "lucide-react";

export function AdminPlatformSummaryWidget() {
  return (
    <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <h2 className="text-sm font-bold text-slate-900 mb-6">Platform Summary</h2>
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Active Users</span>
          <span className="font-bold text-slate-900">18,452</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Verified Users</span>
          <span className="font-bold text-slate-900">14,218</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Unverified Users</span>
          <span className="font-bold text-slate-900">4,234</span>
        </div>
        <div className="h-px w-full bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Active Listings</span>
          <span className="font-bold text-slate-900">6,781</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Inactive Listings</span>
          <span className="font-bold text-slate-900">1,975</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Suspended Listings</span>
          <span className="font-bold text-slate-900">134</span>
        </div>
        <div className="h-px w-full bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Completed Bookings</span>
          <span className="font-bold text-slate-900">12,458</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Cancelled Bookings</span>
          <span className="font-bold text-slate-900">1,243</span>
        </div>
      </div>
      <button className="w-full mt-6 bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5">
        View Full Summary <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

export function AdminTopCategoriesWidget() {
  const topCategories = [
    { name: "Vehicles", amount: "৳ 48,750", percentage: "39%", width: "80%" },
    { name: "Electronics", amount: "৳ 32,460", percentage: "26%", width: "60%" },
    { name: "Apartments", amount: "৳ 24,180", percentage: "19%", width: "45%" },
    { name: "Furniture", amount: "৳ 12,340", percentage: "10%", width: "25%" },
    { name: "Others", amount: "৳ 7,850", percentage: "6%", width: "15%" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-900">Top Performing Categories</h2>
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</button>
      </div>
      <div className="space-y-5">
        {topCategories.map((cat, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-600 w-20">{cat.name}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: cat.width }}></div>
            </div>
            <div className="w-24 text-right">
              <span className="text-xs font-bold text-slate-900">{cat.amount}</span>
              <span className="text-[10px] text-slate-400 ml-1">({cat.percentage})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminQuickActionsWidget() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <UserPlus size={16} className="text-indigo-600 shrink-0" />
          Add New Admin
        </button>
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <ListPlus size={16} className="text-blue-600 shrink-0" />
          Add Category
        </button>
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <Users size={16} className="text-emerald-600 shrink-0" />
          Manage Users
        </button>
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <FileText size={16} className="text-purple-600 shrink-0" />
          Manage Listings
        </button>
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          Dispute Center
        </button>
        <button className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <Settings size={16} className="text-slate-500 shrink-0" />
          System Settings
        </button>
      </div>
    </div>
  );
}

export function AdminRecentDisputesWidget() {
  const recentDisputes = [
    { id: "#DP1256", item: "Canon EOS R6", user: "Rahim Hasan", status: "Open", statusColor: "text-red-500" },
    { id: "#DP1255", item: "2BHK Apartment", user: "Karim Uddin", status: "In Review", statusColor: "text-amber-500" },
    { id: "#DP1254", item: "MacBook Air M2", user: "Nayeem Hasan", status: "Resolved", statusColor: "text-emerald-500" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-slate-900">Recent Disputes</h2>
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</button>
      </div>
      <div className="space-y-4">
        {recentDisputes.map((dispute, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {dispute.user.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Dispute {dispute.id}</p>
                <p className="text-[10px] text-slate-500">{dispute.item} • {dispute.user}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold ${dispute.statusColor} bg-slate-50 px-2 py-1 rounded-md`}>
              {dispute.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSystemHealthWidget() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-slate-900">System Health</h2>
        <button className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</button>
      </div>
      <div className="space-y-4">
        {[
          { name: "Server Status", icon: Server },
          { name: "Payment Gateway", icon: CreditCard },
          { name: "Email Service", icon: Mail },
          { name: "Database", icon: Database },
        ].map((sys, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <sys.icon size={16} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-700">{sys.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="text-[10px] font-bold">Operational</span>
              <CheckCircle2 size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPendingListingsWidget() {
  const [pendingListings, setPendingListings] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/products?status=PENDING")
      .then(res => res.json())
      .then(data => {
        setPendingListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      if (res.ok) {
        setPendingListings((prev: any) => prev.filter((p: any) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" })
      });
      if (res.ok) {
        setPendingListings((prev: any) => prev.filter((p: any) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          Pending Approvals
          {pendingListings.length > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pendingListings.length}
            </span>
          )}
        </h2>
      </div>
      {pendingListings.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500">
          No pending listings.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">৳{product.price_per_day}/day</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleApprove(product.id)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                  Approve
                </button>
                <button onClick={() => handleReject(product.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
