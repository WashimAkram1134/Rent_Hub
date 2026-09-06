"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Filter, ChevronRight, CheckCircle2, Clock, XCircle, AlertTriangle, Ban } from "lucide-react";
import { adminIdentityApi } from "@/features/identity-verification/api/identityVerificationApi";

const STATUS_FILTERS = ["ALL", "PENDING", "VERIFIED", "FAILED", "MANUAL_REVIEW", "REVOKED"];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; badge: string }> = {
  VERIFIED: { icon: CheckCircle2, label: "Verified", badge: "bg-emerald-100 text-emerald-700" },
  PENDING: { icon: Clock, label: "Pending", badge: "bg-blue-100 text-blue-700" },
  PROCESSING: { icon: Clock, label: "Processing", badge: "bg-violet-100 text-violet-700" },
  FAILED: { icon: XCircle, label: "Failed", badge: "bg-red-100 text-red-700" },
  MANUAL_REVIEW: { icon: AlertTriangle, label: "Manual Review", badge: "bg-amber-100 text-amber-700" },
  REVOKED: { icon: Ban, label: "Revoked", badge: "bg-slate-100 text-slate-600" },
};

interface VerificationRecord {
  id: string;
  user_id: string;
  status: string;
  attempt_count: number;
  document_type: string | null;
  face_match_score: number | null;
  liveness_score: number | null;
  verified_at: string | null;
  created_at: string;
}

export default function AdminIdentityVerificationsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchRecords = async (filter: string) => {
    setLoading(true);
    try {
      const status = filter === "ALL" ? undefined : filter;
      const data = await adminIdentityApi.list(status);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Identity Verifications</h1>
            <p className="text-sm text-slate-500">Review and manage customer verification records</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === f
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">User ID</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Match Score</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Attempts</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified At</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.FAILED;
                const Icon = cfg.icon;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/identity-verifications/${r.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500">{r.user_id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-mono text-xs">
                      {r.face_match_score != null ? (r.face_match_score * 100).toFixed(1) + "%" : "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">{r.attempt_count}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs">
                      {r.verified_at ? new Date(r.verified_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
