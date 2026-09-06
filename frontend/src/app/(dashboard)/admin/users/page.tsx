"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trash2, Pencil, Search, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { DataTable } from "@/components/common/DataTable";
import apiClient from "@/lib/axios";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.primary_role === "admin";

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users");
      setUsers(res.data);
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
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      await load();
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  const columns = [
    {
      accessorKey: "avatar",
      header: "User",
      cell: (info: any) => {
        const u = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
              {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : u.first_name[0] + u.last_name[0]}
            </div>
            <div>
              <p className="font-medium text-slate-900">{u.first_name} {u.last_name}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (info: any) => <span className="text-sm text-slate-600">{info.getValue() || 'N/A'}</span>,
    },
    {
      accessorKey: "identity_verification_status",
      header: "Status",
      cell: (info: any) => {
        const status = info.getValue();
        const isVerified = status === "VERIFIED";
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isVerified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            {isVerified ? 'Verified' : status}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: (info: any) => {
        return <span className="text-sm text-slate-600">{new Date(info.getValue()).toLocaleDateString()}</span>;
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info: any) => {
        const u = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage platform users</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <DataTable columns={columns} data={users} searchKey="first_name" searchPlaceholder="Search users by first name..." />
        </div>
      )}
    </div>
  );
}
