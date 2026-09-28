import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, UserPlus, ListPlus, Users, FileText, ShieldAlert, Settings, Server, CreditCard, Mail, Database, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8;

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/products", { params: { status: "PENDING", limit: 200 } });
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

  const totalPages = Math.ceil(pendingListings.length / ITEMS_PER_PAGE) || 1;

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await apiClient.patch(`/products/${id}/status`, { status: "APPROVED" });
      if (res.status === 200 || res.status === 204) {
        setPendingListings((prev: any[]) => {
          const next = prev.filter((p) => p.id !== id);
          const newTotalPages = Math.ceil(next.length / ITEMS_PER_PAGE) || 1;
          if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to approve product:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await apiClient.patch(`/products/${id}/status`, { status: "REJECTED" });
      if (res.status === 200 || res.status === 204) {
        setPendingListings((prev: any[]) => {
          const next = prev.filter((p) => p.id !== id);
          const newTotalPages = Math.ceil(next.length / ITEMS_PER_PAGE) || 1;
          if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to reject product:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center py-12">
        <Loader2 size={24} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = pendingListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      {/* Header with Title, Count Badge and Page Dropdown */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          Pending Approvals
          {pendingListings.length > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pendingListings.length}
            </span>
          )}
        </h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Page</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              aria-label="Select page"
              className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {p} of {totalPages}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Listing Content (strictly 8 items per page) */}
      {pendingListings.length === 0 ? (
        <div className="text-center py-8 text-xs font-medium text-slate-400">
          No pending listings.
        </div>
      ) : (
        <div className="space-y-3.5 flex-1">
          {currentListings.map((product: any) => {
            const isProcessing = actionLoadingId === product.id;
            return (
              <div
                key={product.id}
                className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0"
              >
                <Link
                  href={`/products/${product.slug || product.id}`}
                  className="flex items-center gap-3 overflow-hidden group cursor-pointer flex-1 min-w-0 pr-2"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all border border-slate-100">
                    <img
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={product.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors"
                      title={product.title}
                    >
                      {product.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      ৳{Number(product.price_per_day || 0).toLocaleString()}/day
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApprove(product.id)}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    {isProcessing ? "..." : "Approve"}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleReject(product.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    {isProcessing ? "..." : "Reject"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Footer */}
      {totalPages > 1 && (
        <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium">
            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, pendingListings.length)} of {pendingListings.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft size={13} />
            </button>

            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="w-4 text-center text-xs text-slate-400 font-bold">
                  …
                </span>
              )
            )}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
