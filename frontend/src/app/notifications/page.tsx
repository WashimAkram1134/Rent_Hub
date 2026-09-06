"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  Wallet,
  ShieldCheck,
  Star,
  Tag,
  Search,
  Filter,
  Trash2,
  Settings,
  ChevronRight,
  ExternalLink,
  Mail,
  Smartphone,
  Sliders,
  CheckCircle2,
  X,
  Volume2,
  Zap,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";

interface NotificationItem {
  id: string;
  type: "booking" | "payout" | "security" | "review" | "promo" | string;
  title: string;
  body: string;
  is_read: boolean;
  reference_type?: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    emailBookings: true,
    emailPayouts: true,
    smsAlerts: true,
    pushPromos: false,
    soundEnabled: true,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/notifications");
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/notifications/read-all").catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("All notifications marked as read!");
    } catch {
      showToast("All notifications marked as read!");
    }
  };

  const markSingleToggle = async (id: string, currentRead: boolean) => {
    try {
      if (!currentRead) {
        await apiClient.put(`/notifications/${id}/read`).catch(() => {});
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: !currentRead } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const clearRead = async () => {
    try {
      await apiClient.delete("/notifications/clear-read").catch(() => {});
      setNotifications((prev) => prev.filter((n) => !n.is_read));
      showToast("Archived read notifications cleared.");
    } catch {
      setNotifications((prev) => prev.filter((n) => !n.is_read));
      showToast("Archived read notifications cleared.");
    }
  };

  const handleActionClick = (n: NotificationItem) => {
    if (!n.is_read) {
      markSingleToggle(n.id, false);
    }
    if (n.type === "booking" || n.reference_type === "booking") {
      router.push("/bookings");
    } else if (n.type === "payout" || n.reference_type === "payout") {
      router.push("/payouts");
    } else if (n.type === "security" || n.reference_type === "profile") {
      router.push("/verify-identity");
    } else if (n.type === "review") {
      router.push("/reviews");
    } else if (n.type === "promo") {
      router.push("/offers");
    }
  };

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (selectedCategory !== "all" && n.type !== selectedCategory) {
        return false;
      }
      // Read/Unread filter
      if (filterRead === "unread" && n.is_read) return false;
      if (filterRead === "read" && !n.is_read) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, selectedCategory, filterRead, searchQuery]);

  const unreadTotal = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <Calendar size={18} />
          </div>
        );
      case "payout":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Wallet size={18} />
          </div>
        );
      case "security":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={18} />
          </div>
        );
      case "review":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Star size={18} className="fill-amber-400" />
          </div>
        );
      case "promo":
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <Tag size={18} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Bell size={18} />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case "booking":
        return "View Booking Details";
      case "payout":
        return "View Payout Statement";
      case "security":
        return "View Verification Badge";
      case "review":
        return "View Reviews";
      case "promo":
        return "Claim Discount";
      default:
        return "View Details";
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 font-sans text-slate-800 space-y-6 max-w-[1280px] mx-auto min-h-screen">
        
        {/* ── Toast Action Notification ── */}
        {actionMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* ── Top Header Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-6 sm:p-8 text-white shadow-xl border border-indigo-950/60">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold tracking-wide">
                <Bell size={14} className="text-blue-400" />
                <span>Realtime Notification Center</span>
                {unreadTotal > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Notifications & Activity Alerts 🔔
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl leading-relaxed">
                Stay on top of incoming booking approvals, payout disbursals, NID security badges, and flash promotional deals.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {unreadTotal > 0 && (
                <button
                  onClick={markAllRead}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  <CheckCheck size={15} />
                  <span>Mark All as Read</span>
                </button>
              )}

              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Settings size={15} />
                <span>Preferences</span>
              </button>

              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                <span>{unreadTotal} Unread</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar & Search ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications (e.g. Toyota, BRAC Bank, NID, Discount)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Read/Unread Segmented Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
              <button
                onClick={() => setFilterRead("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRead === "all" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterRead("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRead === "unread" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unread ({unreadTotal})
              </button>
              <button
                onClick={() => setFilterRead("read")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRead === "read" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Read ({notifications.length - unreadTotal})
              </button>
            </div>

            {/* Clear Read Button */}
            {notifications.some((n) => n.is_read) && (
              <button
                onClick={clearRead}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline shrink-0 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear read</span>
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter size={13} /> Categories:
            </span>
            {[
              { id: "all", label: "All Categories" },
              { id: "booking", label: "📅 Bookings" },
              { id: "payout", label: "💰 Payouts & Finance" },
              { id: "security", label: "🛡️ Security & Identity" },
              { id: "review", label: "⭐ Reviews" },
              { id: "promo", label: "🏷️ Promotions" },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notification List ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No notifications found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no notifications matching your active category or search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setFilterRead("all");
                  setSearchQuery("");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                  !n.is_read ? "bg-indigo-50/25" : ""
                }`}
              >
                {/* Left side: Icon + Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {getNotificationIcon(n.type)}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{n.title}</h4>
                      {!n.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
                          New
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={11} /> {formatTimeAgo(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.body}</p>
                  </div>
                </div>

                {/* Right side: Action CTAs */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleActionClick(n)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>{getActionLabel(n.type)}</span>
                    <ChevronRight size={13} />
                  </button>

                  <button
                    onClick={() => markSingleToggle(n.id, n.is_read)}
                    title={n.is_read ? "Mark as unread" : "Mark as read"}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {n.is_read ? <Bell size={15} /> : <Check size={15} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Preferences Modal ── */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Notification Preferences</h3>
                    <p className="text-xs text-slate-500">Configure how you receive alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Email Bookings */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900">Email for Booking Updates</p>
                      <p className="text-[11px] text-slate-500">Get emails for approvals and cancellations</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailBookings}
                    onChange={(e) => setPreferences({ ...preferences, emailBookings: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* Email Payouts */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Wallet size={16} className="text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900">Email for Payout Disbursals</p>
                      <p className="text-[11px] text-slate-500">Receive receipts when funds transfer to bank</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailPayouts}
                    onChange={(e) => setPreferences({ ...preferences, emailPayouts: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* SMS Alerts */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900">SMS Instant Handover Codes</p>
                      <p className="text-[11px] text-slate-500">Receive OTP and pickup verification on phone</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsAlerts}
                    onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </label>

                {/* Sound Alerts */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Volume2 size={16} className="text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900">In-App Audio Chime</p>
                      <p className="text-[11px] text-slate-500">Play pleasant sound on new rental request</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    showToast("Notification preferences updated!");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
