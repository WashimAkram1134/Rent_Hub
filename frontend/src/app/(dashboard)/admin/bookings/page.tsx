"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Trash2, Calendar, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { DataTable } from "@/components/common/DataTable";
import apiClient from "@/lib/axios";

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.primary_role === "admin";

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/bookings");
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin]);

  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-slate-900 font-semibold text-xl">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/bookings/${id}`);
      await load();
    } catch (e) {
      alert("Failed to delete booking.");
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: (info: any) => {
        const id = info.getValue() as string;
        return <span className="font-mono text-xs font-bold text-slate-900">#{id.split('-')[0]}</span>;
      },
    },
    {
      accessorKey: "product",
      header: "Item",
      cell: (info: any) => {
        const p = info.getValue();
        if (!p) return <span className="text-slate-400">Unknown</span>;
        return (
          <Link href={`/products/${p.id}`} className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
              {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <span className="font-medium text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.title}</span>
          </Link>
        );
      },
    },
    {
      accessorKey: "renter",
      header: "Renter",
      cell: (info: any) => {
        const u = info.getValue();
        if (!u) return <span className="text-slate-400">Unknown</span>;
        return <span className="text-sm text-slate-600">{u.first_name} {u.last_name}</span>;
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: (info: any) => <span className="text-sm font-bold text-slate-900">৳{info.getValue()}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => {
        const status = info.getValue()?.toUpperCase() || 'UNKNOWN';
        let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
        if (status === 'COMPLETED') colorClass = 'bg-green-50 text-green-700 border-green-200';
        if (status === 'CONFIRMED' || status === 'ACTIVE') colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        if (status === 'PENDING') colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        if (status === 'CANCELLED' || status === 'REJECTED') colorClass = 'bg-red-50 text-red-700 border-red-200';
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info: any) => {
        const b = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => handleDelete(b.id)} title="Delete Record" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Monitor and manage all platform reservations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <DataTable columns={columns} data={bookings} searchKey="id" searchPlaceholder="Search by booking ID..." />
        </div>
      )}
    </div>
  );
}
