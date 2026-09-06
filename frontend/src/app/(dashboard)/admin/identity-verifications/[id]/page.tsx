"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Ban, AlertTriangle } from "lucide-react";
import { adminIdentityApi } from "@/features/identity-verification/api/identityVerificationApi";

const ACTIONS = [
  { key: "APPROVE", label: "Approve", icon: CheckCircle2, cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { key: "REJECT", label: "Reject", icon: XCircle, cls: "bg-red-500 hover:bg-red-600 text-white" },
  { key: "REQUEST_RETRY", label: "Request Retry", icon: RefreshCw, cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  { key: "REVOKE", label: "Revoke", icon: Ban, cls: "bg-slate-600 hover:bg-slate-700 text-white" },
];

interface Detail {
  id: string;
  user_id: string;
  status: string;
  attempt_count: number;
  document_type: string | null;
  document_number_masked: string | null;
  face_match_score: number | null;
  liveness_score: number | null;
  liveness_challenge_type: string | null;
  verification_method: string | null;
  verification_version: string | null;
  consent_given: boolean;
  consent_at: string | null;
  verified_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export default function AdminVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    adminIdentityApi.getById(id).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [id]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const res = await adminIdentityApi.review(id, action, notes || undefined);
      setActionDone(res.message);
      setDetail((prev) => prev ? { ...prev, status: res.status } : prev);
    } catch {
      setActionDone("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!detail) return <p className="text-slate-500 text-sm">Record not found.</p>;

  const rows: [string, string | number | null][] = [
    ["User ID", detail.user_id],
    ["Status", detail.status],
    ["Attempt Count", detail.attempt_count],
    ["Document Type", detail.document_type],
    ["Document Number", detail.document_number_masked ?? "Not collected"],
    ["Face Match Score", detail.face_match_score != null ? (detail.face_match_score * 100).toFixed(2) + "%" : "—"],
    ["Liveness Score", detail.liveness_score != null ? (detail.liveness_score * 100).toFixed(0) + "%" : "—"],
    ["Liveness Challenge", detail.liveness_challenge_type],
    ["Method", detail.verification_method],
    ["Version", detail.verification_version],
    ["Consent Given", detail.consent_given ? "Yes" : "No"],
    ["Consent At", detail.consent_at ? new Date(detail.consent_at).toLocaleString() : "—"],
    ["Verified At", detail.verified_at ? new Date(detail.verified_at).toLocaleString() : "—"],
    ["Reviewed At", detail.reviewed_at ? new Date(detail.reviewed_at).toLocaleString() : "—"],
    ["Review Notes", detail.review_notes],
    ["Created At", new Date(detail.created_at).toLocaleString()],
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-indigo-500" />
          <h1 className="font-bold text-slate-900">Verification Record</h1>
          <span className="ml-auto font-mono text-xs text-slate-400">{id.slice(0, 8)}…</span>
        </div>

        {/* Detail table */}
        <dl className="divide-y divide-slate-50">
          {rows.map(([label, value]) => (
            <div key={label} className="flex px-6 py-3 gap-4">
              <dt className="w-40 flex-shrink-0 text-xs font-semibold text-slate-500">{label}</dt>
              <dd className="text-xs text-slate-700 font-mono break-all">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Admin actions */}
      {actionDone ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {actionDone}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-800 text-sm">Admin Action</h2>

          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-indigo-400 transition-colors"
            rows={3}
            placeholder="Review notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACTIONS.map(({ key, label, icon: Icon, cls }) => (
              <button
                key={key}
                id={`btn-admin-${key.toLowerCase()}`}
                onClick={() => handleAction(key)}
                disabled={actionLoading}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${cls} disabled:opacity-50`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
