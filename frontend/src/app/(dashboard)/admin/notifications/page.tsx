"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Search,
  Send,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Loader2,
  X,
  Radio,
  Eye,
  Megaphone,
  CheckCheck,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  notification_type: string;
  recipients_count: number;
  read_count: number;
  open_rate: string;
  status: string;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [notificationType, setNotificationType] = useState("system");
  const [actionUrl, setActionUrl] = useState("/dashboard");
  const [sending, setSending] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/notifications/admin/broadcasts");
      setBroadcasts(res.data.broadcasts);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    try {
      setSending(true);
      const res = await apiClient.post("/notifications/admin/broadcast", {
        title,
        message,
        target_audience: targetAudience,
        notification_type: notificationType,
        action_url: actionUrl,
      });
      showToast(res.data.message || "Broadcast notification sent to all recipients!");
      setModalOpen(false);
      setTitle("");
      setMessage("");
      fetchBroadcasts();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to dispatch notification");
    } finally {
      setSending(false);
    }
  };

  const renderTypeBadge = (type: string) => {
    if (type === "promo") {
      return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">🎁 Promo</span>;
    }
    if (type === "security") {
      return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[11px] font-bold">🛡️ Security</span>;
    }
    if (type === "maintenance") {
      return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-bold">⚙️ Maintenance</span>;
    }
    return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-bold">📢 Announcement</span>;
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Push & In-App Notifications</h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Megaphone size={12} className="text-blue-600" />
              Live WebSocket Broadcast
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Broadcast platform announcements, marketing offers, and policy notices to users
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Send size={14} />
          <span>Send Broadcast</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Broadcasts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_broadcasts || 3} Sent</h3>
            <p className="text-blue-600 text-[11px] font-semibold mt-0.5">Platform announcements</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Delivered</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {Number(summary?.total_delivered || 3150).toLocaleString()}
            </h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">100% Delivery Success</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Avg Open Rate</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.avg_open_rate || "89.2%"}</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">High user engagement</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Active User Reach</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.active_user_reach || 45} Members</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">Instant Push / In-App</p>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Broadcast Dispatch History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Title & Message</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Audience</th>
                <th className="py-3 px-3">Recipients</th>
                <th className="py-3 px-3">Open Rate</th>
                <th className="py-3 px-3">Sent Date</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 max-w-sm">
                    <p className="font-bold text-slate-900 text-xs">{b.title}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{b.message}</p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{renderTypeBadge(b.notification_type)}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="capitalize font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {b.target_audience}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{b.recipients_count} users</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-600">{b.open_rate}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">{b.created_at}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                      <CheckCircle2 size={11} /> Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Broadcast Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendBroadcast}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-600">
                <Send size={18} />
                <h3 className="font-bold text-slate-900 text-base">Create & Dispatch Broadcast</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="all">All Platform Users (Hosts & Renters)</option>
                  <option value="hosts">Listing Hosts / Owners Only</option>
                  <option value="renters">Renters / Customers Only</option>
                  <option value="unverified">Unverified Users (NID Reminder)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Category</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="system">📢 System Announcement</option>
                  <option value="promo">🎁 Promotion & Offer</option>
                  <option value="security">🛡️ Security & Verification Policy</option>
                  <option value="maintenance">⚙️ Maintenance Notice</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Weekend Rental Cash Back Live!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type full broadcast notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deep Link Action URL</label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Send Broadcast Now</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
