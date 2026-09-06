"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCcw,
  Plus,
  Download,
  Database,
  HardDrive,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
  Server,
  Cloud,
  FileArchive,
  RotateCcw,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface BackupItem {
  id: string;
  filename: string;
  size_mb: number;
  type: string;
  storage: string;
  status: string;
  created_at: string;
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/analytics/admin/backups");
      setBackups(res.data.backups || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateSnapshot = async () => {
    try {
      setCreating(true);
      const res = await apiClient.post("/analytics/admin/backups/create");
      showToast(res.data.message || "Manual database backup created successfully!");
      fetchBackups();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create snapshot");
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadDump = (b: BackupItem) => {
    showToast(`Downloading database snapshot ${b.filename}...`);
    // Simulated dump download
    const content = `-- RentHub PostgreSQL Database Snapshot\n-- Snapshot ID: ${b.id}\n-- Timestamp: ${b.created_at}\n-- Size: ${b.size_mb} MB\n-- Schema: public\n-- Tables: users, products, bookings, payments, payouts, reviews, cities, notifications;\n`;
    const blob = new Blob([content], { type: "application/x-gzip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = b.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Database Backup & Disaster Recovery</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Cloud size={12} className="text-emerald-600" />
              S3 Multi-Region Redundant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Automated daily PostgreSQL snapshots, encrypted WAL backups, and 1-click disaster recovery
          </p>
        </div>

        <button
          onClick={handleCreateSnapshot}
          disabled={creating}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {creating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
          <span>Create Snapshot Now</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Database size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Stored Snapshots</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_snapshots || backups.length} Copies</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">30-day rolling storage</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Latest Snapshot</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Today 03:00 AM</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Automated Daily Sync</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <HardDrive size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Size</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_size_mb || 125.3} MB</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">GZIP AES-256 Encrypted</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Server size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Auto-Schedule</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">03:00 AM Daily</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">UTC+6 Dhaka Time</p>
          </div>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">PostgreSQL Snapshot Archive</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Snapshot ID & Archive</th>
                <th className="py-3 px-3">Backup Type</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Storage Location</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-3">Integrity</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <FileArchive size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{b.filename}</p>
                        <span className="text-[10px] text-slate-400">{b.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {b.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">{b.size_mb} MB</td>

                  <td className="py-3.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{b.storage}</td>

                  <td className="py-3.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">{b.created_at}</td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                      <CheckCircle2 size={11} /> {b.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadDump(b)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download SQL</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
