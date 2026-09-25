import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, UserPlus, ListPlus, Users, FileText, ShieldAlert, Settings, Server, CreditCard, Mail, Database, CheckCircle2 } from "lucide-react";
import apiClient from "@/lib/axios";

export function AdminPlatformSummaryWidget({ stats }: { stats?: any }) {
  const safeStats = stats || {};
  return (
    <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <h2 className="text-sm font-bold text-slate-900 mb-6">Platform Summary</h2>
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Active Users</span>
          <span className="font-bold text-slate-900">{(safeStats.total_users || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Verified Users</span>
          <span className="font-bold text-slate-900">{(safeStats.verified_users || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Unverified Users</span>
          <span className="font-bold text-slate-900">{(safeStats.unverified_users || 0).toLocaleString()}</span>
        </div>
        <div className="h-px w-full bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Active Listings</span>
          <span className="font-bold text-slate-900">{(safeStats.active_listings || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Inactive Listings</span>
          <span className="font-bold text-slate-900">{(safeStats.inactive_listings || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Suspended Listings</span>
          <span className="font-bold text-slate-900">{(safeStats.suspended_listings || 0).toLocaleString()}</span>
        </div>
        <div className="h-px w-full bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Completed Bookings</span>
          <span className="font-bold text-slate-900">{(safeStats.completed_bookings || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 text-xs">Cancelled Bookings</span>
          <span className="font-bold text-slate-900">{(safeStats.cancelled_bookings || 0).toLocaleString()}</span>
        </div>
      </div>
      <button className="w-full mt-6 bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5">
        View Full Summary <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

export function AdminTopCategoriesWidget() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/analytics/chart/categories")
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-[#111625] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Categories</h2>
        <Link href="/admin/categories" className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</Link>
      </div>
      {categories.length === 0 && !loading ? (
        <p className="text-xs text-slate-400 py-4 text-center">No categories recorded yet.</p>
      ) : (
        <div className="space-y-5">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-24 truncate">{cat.name}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: cat.percentage || "50%", backgroundColor: cat.color || "#4F46E5" }}></div>
              </div>
              <div className="w-20 text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.value}</span>
                <span className="text-[10px] text-slate-400 ml-1">({cat.percentage})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminQuickActionsWidget() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/staff" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <UserPlus size={16} className="text-indigo-600 shrink-0" />
          Add New Admin
        </Link>
        <Link href="/admin/categories" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <ListPlus size={16} className="text-blue-600 shrink-0" />
          Add Category
        </Link>
        <Link href="/admin/users" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <Users size={16} className="text-emerald-600 shrink-0" />
          Manage Users
        </Link>
        <Link href="/admin/listings" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <FileText size={16} className="text-purple-600 shrink-0" />
          Manage Listings
        </Link>
        <Link href="/admin/disputes" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          Dispute Center
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-colors text-xs font-medium text-slate-700">
          <Settings size={16} className="text-slate-500 shrink-0" />
          System Settings
        </Link>
      </div>
    </div>
  );
}

export function AdminRecentDisputesWidget() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/bookings/admin/disputes/list")
      .then((res) => {
        const list = res.data?.disputes || [];
        setDisputes(list.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-[#111625] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Disputes</h2>
        <Link href="/admin/disputes" className="text-indigo-600 text-xs font-bold hover:text-indigo-700">View all</Link>
      </div>
      {disputes.length === 0 && !loading ? (
        <p className="text-xs text-slate-400 py-4 text-center">No disputes on file.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute, i) => {
            const customerName = dispute.customer?.name || "Customer";
            const initials = customerName.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
            const isResolved = dispute.status?.toLowerCase() === "resolved";
            const isReview = dispute.status?.toLowerCase() === "under_review";
            const statusColor = isResolved
              ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
              : isReview
              ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
              : "text-red-500 bg-red-50 dark:bg-red-950/40";

            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 uppercase">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Dispute {dispute.dispute_code || dispute.id.substring(0, 8)}</p>
                    <p className="text-[10px] text-slate-500 truncate">{dispute.item_title} • {customerName}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${statusColor} px-2 py-1 rounded-md shrink-0 capitalize`}>
                  {dispute.status?.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      )}
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

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products", { params: { status: "PENDING" } });
      setPendingListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pending listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.patch(`/products/${id}/status`, { status: "APPROVED" });
      if (res.status === 200 || res.status === 204) {
        setPendingListings((prev: any) => prev.filter((p: any) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiClient.patch(`/products/${id}/status`, { status: "REJECTED" });
      if (res.status === 200 || res.status === 204) {
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
              <Link href={`/products/${product.slug || product.id}`} className="flex items-center gap-3 overflow-hidden group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                  <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{product.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">৳{product.price_per_day}/day</p>
                </div>
              </Link>
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
