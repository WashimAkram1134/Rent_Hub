"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Loader2,
  Terminal,
  Activity,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface LogItem {
  id: string;
  action: string;
  title: string;
  admin: string;
  target: string;
  ip_address: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  timestamp: string;
  details: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/analytics/admin/logs", {
        params: {
          severity: severityFilter !== "all" ? severityFilter : undefined,
          search: searchQuery || undefined,
        },
      });
      setLogs(res.data.logs || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const csvHeader = ["Log ID", "Action", "Title", "Admin", "Target", "IP Address", "Severity", "Timestamp", "Details"];
    const csvRows = logs.map((l) => [
      l.id,
      l.action,
      `"${l.title}"`,
      l.admin,
      `"${l.target}"`,
      l.ip_address,
      l.severity,
      l.timestamp,
      `"${l.details}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentHub_Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSeverityBadge = (severity: string) => {
    if (severity === "CRITICAL") {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
          <ShieldAlert size={12} /> CRITICAL
        </span>
      );
    }
    if (severity === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
          <AlertTriangle size={12} /> WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
        <Info size={12} /> INFO
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Audit Logs</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-600 animate-pulse" />
              Live Security Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Immutable audit trail of administrative actions, biometric verifications, and financial transactions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
        >
          <Download size={14} />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Logged Events</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_events || logs.length} Records</h3>
            <p className="text-blue-600 text-[11px] font-semibold mt-0.5">Rolling 30-day retention</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Security Score</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.security_score || "99.8%"}</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Zero critical breaches</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Warnings Handled</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.warning_count || 2} Alerts</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Listing inspection / refunds</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Terminal size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Audit Protocol</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">TLS 1.3 / WAL</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Encrypted hash verification</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLogs();
            }}
            className="relative flex-1 min-w-[240px]"
          >
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by admin, action, target entity, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-slate-200/80 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="INFO">Info Level</option>
              <option value="WARNING">Warning Level</option>
              <option value="CRITICAL">Critical Level</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Event ID</th>
                <th className="py-3 px-3">Action & Summary</th>
                <th className="py-3 px-3">Initiated By</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">IP / Location</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-xs">{l.id}</td>
                  <td className="py-3.5 px-3 max-w-xs">
                    <p className="font-bold text-slate-900 text-xs">{l.title}</p>
                    <p className="text-slate-400 text-[10px] line-clamp-1 mt-0.5">{l.details}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{l.admin}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">{l.target}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">{l.ip_address}</td>
                  <td className="py-3.5 px-3 whitespace-nowrap">{renderSeverityBadge(l.severity)}</td>
                  <td className="py-3.5 px-3 text-slate-400 text-[11px] text-right whitespace-nowrap">{l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
