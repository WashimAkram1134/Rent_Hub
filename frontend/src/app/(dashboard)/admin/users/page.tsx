"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Users,
  UserCheck,
  Building2,
  Shield,
  ShieldCheck,
  RefreshCw,
  X,
  AlertTriangle,
  Send,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { DataTable } from "@/components/common/DataTable";
import apiClient from "@/lib/axios";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState<"all" | "customer" | "owner" | "admin">("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Verification modal states
  const [selectedUserForVerify, setSelectedUserForVerify] = useState<any | null>(null);
  const [submissionData, setSubmissionData] = useState<any | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const [selectedUserForUnverify, setSelectedUserForUnverify] = useState<any | null>(null);
  const [unverifyReason, setUnverifyReason] = useState("");
  const [isSubmittingUnverify, setIsSubmittingUnverify] = useState(false);

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

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId);
      const res = await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      
      // Update local user state immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...res.data } : u))
      );

      showToast(`User role updated to ${newRole.toUpperCase()} successfully!`, "success");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to update user role.";
      showToast(msg, "error");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openVerifyModal = async (u: any) => {
    setSelectedUserForVerify(u);
    setVerifyNote("");
    setSubmissionData(null);
    setLoadingSubmission(true);
    try {
      const res = await apiClient.get(`/users/${u.id}/verification-submission`);
      setSubmissionData(res.data);
    } catch (err: any) {
      console.error(err);
      showToast("Could not load verification submission details.", "error");
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleApproveVerification = async () => {
    if (!selectedUserForVerify) return;
    try {
      setIsSubmittingVerify(true);
      const res = await apiClient.patch(`/users/${selectedUserForVerify.id}/verification-status`, {
        status: "VERIFIED",
        reason: verifyNote || "Identity verified and approved by Administrator",
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUserForVerify.id ? { ...u, ...res.data, identity_verification_status: "VERIFIED" } : u))
      );
      showToast(`User ${selectedUserForVerify.first_name || ""} is now verified!`, "success");
      setSelectedUserForVerify(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to approve verification.";
      showToast(msg, "error");
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const openUnverifyModal = (u: any) => {
    setSelectedUserForUnverify(u);
    setUnverifyReason("");
  };

  const handleRevokeVerification = async () => {
    if (!selectedUserForUnverify) return;
    if (!unverifyReason.trim()) {
      showToast("Please provide a reason / SMS notice for the user.", "error");
      return;
    }
    try {
      setIsSubmittingUnverify(true);
      const res = await apiClient.patch(`/users/${selectedUserForUnverify.id}/verification-status`, {
        status: "UNVERIFIED",
        reason: unverifyReason.trim(),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUserForUnverify.id ? { ...u, ...res.data, identity_verification_status: "NOT_STARTED" } : u))
      );
      showToast(`User verification revoked and notice message sent.`, "success");
      setSelectedUserForUnverify(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to revoke verification.";
      showToast(msg, "error");
    } finally {
      setIsSubmittingUnverify(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User deleted successfully.", "success");
    } catch (e) {
      showToast("Failed to delete user.", "error");
    }
  };

  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-slate-900 font-semibold text-xl">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  // Filtered by selected role tab
  const filteredUsers = users.filter((u) => {
    if (activeRoleFilter === "all") return true;
    const role = (u.primary_role || (u.role_names?.includes("owner") ? "owner" : "customer")).toLowerCase();
    return role === activeRoleFilter;
  });

  // Metrics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.primary_role === "admin" || u.role_names?.includes("admin")).length;
  const ownerCount = users.filter((u) => (u.primary_role === "owner" || u.role_names?.includes("owner")) && u.primary_role !== "admin").length;
  const customerCount = users.filter((u) => u.primary_role === "customer" || (!u.role_names?.includes("owner") && !u.role_names?.includes("admin"))).length;

  const columns = [
    {
      accessorKey: "avatar",
      header: "User",
      cell: (info: any) => {
        const u = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 shadow-xs">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}` || "U"
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                {u.first_name} {u.last_name}
              </p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (info: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {info.getValue() || "N/A"}
        </span>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (info: any) => {
        const u = info.row.original;
        const role = (u.primary_role || (u.role_names?.includes("owner") ? "owner" : "customer")).toLowerCase();

        if (role === "admin") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              <Shield size={12} className="text-purple-600" />
              Admin
            </span>
          );
        }
        if (role === "owner") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Building2 size={12} className="text-indigo-600" />
              Owner
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck size={12} className="text-slate-500" />
            Customer
          </span>
        );
      },
    },
    {
      id: "change_role",
      header: "Change Role",
      cell: (info: any) => {
        const u = info.row.original;
        const currentRole = (u.primary_role || (u.role_names?.includes("owner") ? "owner" : "customer")).toLowerCase();
        const isUpdating = updatingUserId === u.id;

        return (
          <div className="flex items-center gap-2">
            <select
              value={currentRole}
              disabled={isUpdating || (u.id === user?.id && currentRole === "admin")}
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:border-indigo-400 focus:outline-none focus:border-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
            {isUpdating && <RefreshCw size={14} className="animate-spin text-indigo-600" />}
          </div>
        );
      },
    },
    {
      accessorKey: "identity_verification_status",
      header: "Identity Status & Action",
      cell: (info: any) => {
        const u = info.row.original;
        const status = u.identity_verification_status;
        const isVerified = status === "VERIFIED";
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                isVerified
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {isVerified ? (
                <>
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Verified
                </>
              ) : (
                "Unverified"
              )}
            </span>

            {isVerified ? (
              <button
                type="button"
                onClick={() => openUnverifyModal(u)}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                title="Revoke verification and send notice SMS"
              >
                Unverify
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openVerifyModal(u)}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Inspect verification submission and verify user"
              >
                <Eye size={12} />
                Verify
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className="text-xs text-slate-500">
            {val ? new Date(val).toLocaleDateString() : "N/A"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info: any) => {
        const u = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleDelete(u.id)}
              disabled={u.id === user?.id}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={u.id === user?.id ? "Cannot delete own account" : "Delete user"}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Toast Feedback */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : "bg-rose-900 text-rose-100 border-rose-700"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, toggle roles (Customer ↔ Owner ↔ Admin), and view verification status.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
            <Building2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Owners / Listers</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{ownerCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <UserCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{customerCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Administrators</span>
          </div>
          <p className="text-2xl font-black text-purple-600">{adminCount}</p>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "all", label: "All Users", count: totalCount },
          { id: "customer", label: "Customers", count: customerCount },
          { id: "owner", label: "Owners", count: ownerCount },
          { id: "admin", label: "Admins", count: adminCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRoleFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRoleFilter === tab.id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center p-12 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredUsers}
            searchKey="first_name"
            searchPlaceholder="Search users by name or email..."
          />
        </div>
      )}

      {/* In-Page Modal: Verify & Review Submission */}
      {selectedUserForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Verify User Identity</h3>
                  <p className="text-xs text-slate-500">
                    {selectedUserForVerify.first_name} {selectedUserForVerify.last_name} ({selectedUserForVerify.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForVerify(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {loadingSubmission ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
                  <span>Checking verification submission data...</span>
                </div>
              ) : submissionData?.has_submission ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-900 text-xs">Identity Documents Submitted</p>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        The user completed identity submission. Details are listed below for your review.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2.5">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Document Type</span>
                      <span className="font-bold text-slate-800">{submissionData.submission?.document_type || "NID / Passport"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Document ID Number</span>
                      <span className="font-mono font-bold text-slate-800 tracking-wider">
                        {submissionData.submission?.document_number_masked || "Protected"}
                      </span>
                    </div>
                    {submissionData.submission?.face_match_score !== null && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">AI Face Match Score</span>
                        <span className="font-bold text-emerald-600">
                          {Math.round((submissionData.submission.face_match_score || 0) * 100)}% Match
                        </span>
                      </div>
                    )}
                    {submissionData.submission?.liveness_score !== null && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Liveness Detection</span>
                        <span className="font-bold text-emerald-600">
                          {Math.round((submissionData.submission.liveness_score || 0) * 100)}% (Passed)
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Submitted Date</span>
                      <span className="text-slate-700 font-semibold">
                        {submissionData.submission?.created_at
                          ? new Date(submissionData.submission.created_at).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 text-xs">No Verification Submission Found</p>
                    <p className="text-amber-700 text-[11px] mt-1 leading-relaxed">
                      This user has not yet submitted an NID, Passport, or biometric selfie through the identity portal.
                    </p>
                    <p className="text-amber-800 text-[11px] mt-2 font-medium">
                      As an Administrator, you can still grant verified status manually if you have confirmed this user offline or via direct channels.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin Approval Note (Optional)
                </label>
                <input
                  type="text"
                  value={verifyNote}
                  onChange={(e) => setVerifyNote(e.target.value)}
                  placeholder="e.g., Documents inspected and verified by Admin team"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedUserForVerify(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveVerification}
                disabled={isSubmittingVerify}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingVerify ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Approve & Mark Verified</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Page Modal: Revoke Verification & Send User Notice */}
      {selectedUserForUnverify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Revoke Verification Status</h3>
                  <p className="text-xs text-slate-500">
                    {selectedUserForUnverify.first_name} {selectedUserForUnverify.last_name} ({selectedUserForUnverify.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForUnverify(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="text-rose-800 text-xs leading-relaxed">
                  Changing this user to <strong className="font-bold">Unverified</strong> will revoke their verified identity badge.
                  Per platform requirements, you must provide an explanatory message / SMS notice to this user detailing why verification was revoked.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Notice Message / Reason to User <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={unverifyReason}
                  onChange={(e) => setUnverifyReason(e.target.value)}
                  placeholder="e.g., Uploaded identity card was expired or illegible. Please submit a clear, valid government ID to re-verify."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 resize-none font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This message will be immediately dispatched to the user as an urgent in-app notification.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedUserForUnverify(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeVerification}
                disabled={isSubmittingUnverify || !unverifyReason.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingUnverify ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Revoke & Send Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
