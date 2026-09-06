"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldCheck,
  Building,
  Car,
  Calendar,
  DollarSign,
  Lock,
  Flag,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Ban,
  Check,
  Sparkles,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  HelpCircle,
  Tag,
  ArrowRight,
  Eye,
  X,
  MessageCircle,
} from "lucide-react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";

export default function AdminMessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [counts, setCounts] = useState({ all: 0, support: 0, reported: 0, disputes: 0, unread: 0 });

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "support" | "reported" | "disputes" | "unread">("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Input Box State
  const [replyMode, setReplyMode] = useState<"reply" | "warning" | "note">("reply");
  const [replyText, setReplyText] = useState("");
  const [warningReason, setWarningReason] = useState("Off-platform transaction attempt");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Unresolved damage and deposit dispute.");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/messages/admin/conversations", {
        params: {
          tab: activeTab,
          topic: selectedTopic !== "all" ? selectedTopic : undefined,
          search: searchQuery || undefined,
        },
      });
      const list = res.data?.conversations || [];
      setConversations(list);
      if (res.data?.counts) {
        setCounts(res.data.counts);
      }
      // If no active conversation selected, default to first
      if (list.length > 0 && !activeBookingId) {
        setActiveBookingId(list[0].booking_id);
      }
    } catch (err) {
      console.error("Failed to load admin conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (bookingId: string) => {
    try {
      setThreadLoading(true);
      const res = await apiClient.get(`/messages/admin/conversations/${bookingId}`);
      setActiveThread(res.data);
    } catch (err) {
      console.error("Failed to load conversation thread:", err);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeTab, selectedTopic]);

  useEffect(() => {
    if (activeBookingId) {
      fetchThreadDetails(activeBookingId);
    }
  }, [activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeBookingId) return;

    try {
      setIsSending(true);
      const res = await apiClient.post("/messages/admin/reply", {
        booking_id: activeBookingId,
        content: replyText.trim(),
        message_type: replyMode === "note" ? "internal_note" : replyMode,
        warning_reason: replyMode === "warning" ? warningReason : undefined,
      });

      setReplyText("");
      showToast(replyMode === "note" ? "Internal note attached!" : "Message sent into conversation!");
      fetchThreadDetails(activeBookingId);
      fetchConversations();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleAdminAction = async (action: string, reason?: string) => {
    if (!activeBookingId) return;
    try {
      const res = await apiClient.post("/messages/admin/action", {
        booking_id: activeBookingId,
        action,
        reason,
      });
      showToast(res.data?.message || `Action ${action} completed!`);
      fetchThreadDetails(activeBookingId);
      fetchConversations();
      setWarningModalOpen(false);
      setDisputeModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to execute action");
    }
  };

  const getPriorityDot = (priority: string) => {
    if (priority === "critical") return "bg-rose-500 shadow-rose-500/50";
    if (priority === "high") return "bg-amber-500 shadow-amber-500/50";
    return "bg-emerald-500 shadow-emerald-500/50";
  };

  return (
    <div className="space-y-4 pb-12 font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Communication Center</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-indigo-600" />
              Safety & Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitor, moderate, and intervene in Customer ↔ Owner communications, support requests, and disputes
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-2xs">
            💬 {counts.all} Total Chats
          </span>
          <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl font-bold text-rose-700 shadow-2xs">
            🚩 {counts.reported} Reported
          </span>
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl font-bold text-amber-700 shadow-2xs">
            ⚖️ {counts.disputes} In Dispute
          </span>
        </div>
      </div>

      {/* ── Tabs and Search Bar ────────────────────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs font-semibold">
          {[
            { key: "all", label: "All Conversations", count: counts.all },
            { key: "support", label: "Support Tickets", count: counts.support },
            { key: "reported", label: "Reported / Safety", count: counts.reported },
            { key: "disputes", label: "Disputes", count: counts.disputes },
            { key: "unread", label: "Unread", count: counts.unread },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Topic Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, booking, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </form>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Topics</option>
            <option value="booking">Booking Problems</option>
            <option value="payment">Payment Problems</option>
            <option value="verification">Account Verification</option>
            <option value="listing">Listing Inquiry</option>
            <option value="refund">Refund / Cancellation</option>
            <option value="general">General Support</option>
          </select>
        </div>
      </div>

      {/* ── Main 3-Column Workable Interface ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* ── COLUMN 1: Conversations List (col-span-3 or 4) ────────────────── */}
        <div className="lg:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/40">
          <div className="p-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Conversations ({conversations.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Monitoring</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No conversations found in this view.
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeBookingId === c.booking_id;
                return (
                  <div
                    key={c.booking_id}
                    onClick={() => setActiveBookingId(c.booking_id)}
                    className={`p-3.5 transition-all cursor-pointer relative ${
                      isActive ? "bg-indigo-50/80 border-l-4 border-indigo-600 shadow-xs" : "hover:bg-white bg-slate-50/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Status Priority Dot */}
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ${getPriorityDot(c.priority)}`} />
                        <span className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                          {c.customer?.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">↔</span>
                        <span className="font-semibold text-slate-700 text-xs truncate max-w-[110px]">
                          {c.owner?.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {c.last_message?.time_ago}
                      </span>
                    </div>

                    {/* Topic Pill & Badges */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                        {c.topic}
                      </span>
                      {c.is_reported && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-extrabold flex items-center gap-1">
                          <Flag size={9} /> Reported
                        </span>
                      )}
                      {c.is_dispute && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold">
                          ⚖️ Dispute
                        </span>
                      )}
                    </div>

                    {/* Last message snippet */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        <span className="font-semibold text-slate-700">{c.last_message?.sender_name}: </span>
                        {c.last_message?.content}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── COLUMN 2: Active Conversation Thread (col-span-5) ─────────────── */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white border-r border-slate-100">
          {threadLoading || !activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin text-indigo-600" />
              <span className="text-xs">Loading conversation thread...</span>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    💬
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">
                        {activeThread.customer?.name} <span className="text-slate-400 font-normal">↔</span> {activeThread.owner?.name}
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active conversation" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Topic: <span className="font-bold text-indigo-600">{activeThread.topic}</span> • Booking {activeThread.booking_code}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons Bar */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWarningModalOpen(true)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Send official warning"
                  >
                    <AlertTriangle size={12} /> Warning
                  </button>

                  <button
                    onClick={() => handleAdminAction("resolve")}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Mark conversation as resolved"
                  >
                    <CheckCircle2 size={12} /> Resolve
                  </button>

                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Escalate to dispute case"
                  >
                    <Flag size={12} /> Dispute
                  </button>
                </div>
              </div>

              {/* Moderation Alert Banner (if reported) */}
              {activeThread.is_reported && (
                <div className="p-2.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs text-rose-700 px-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="shrink-0 text-rose-600" />
                    <span className="font-semibold text-[11px]">
                      Safety Flag: This conversation was reported for policy review.
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdminAction("unflag")}
                    className="text-[10px] font-bold text-rose-800 underline hover:text-rose-900"
                  >
                    Clear Flag
                  </button>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/20">
                {activeThread.messages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    No messages sent yet in this booking chat.
                  </div>
                ) : (
                  activeThread.messages.map((m: any) => {
                    const isCustomer = m.sender_role === "customer";
                    const isOwner = m.sender_role === "owner";
                    const isAdmin = m.sender_role === "admin";
                    const isSystem = m.sender_role === "system" || m.is_warning;

                    if (isSystem) {
                      return (
                        <div key={m.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs shadow-2xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                            <AlertTriangle size={13} className="text-amber-600" />
                            <span>RentHub Official Intervention</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-auto">{m.created_at}</span>
                          </div>
                          <p className="font-medium text-xs leading-relaxed">{m.content}</p>
                        </div>
                      );
                    }

                    if (isAdmin) {
                      return (
                        <div key={m.id} className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white text-xs shadow-md space-y-1 ml-auto max-w-[90%]">
                          <div className="flex items-center gap-1.5 font-bold text-[10px] text-indigo-200">
                            <ShieldCheck size={13} className="text-indigo-300" />
                            <span>RentHub Support Official Response</span>
                            <span className="text-[10px] text-indigo-300 font-mono ml-auto">{m.created_at}</span>
                          </div>
                          <p className="font-normal text-xs leading-relaxed text-white">{m.content}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[82%] space-y-1 ${
                          isCustomer ? "mr-auto" : "ml-auto items-end"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                            isCustomer ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isCustomer ? "Customer" : "Host Owner"}
                          </span>
                          <span>{m.sender_name}</span>
                          <span className="font-mono text-slate-400">{m.created_at}</span>
                        </div>

                        <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isCustomer
                            ? "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                            : "bg-indigo-600 text-white rounded-tr-xs"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Admin Intervention Input Bar ────────────────────────────── */}
              <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                {/* Reply Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setReplyMode("reply")}
                    className={`px-3 py-1 rounded-lg transition ${
                      replyMode === "reply" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    💬 Official Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMode("warning")}
                    className={`px-3 py-1 rounded-lg transition ${
                      replyMode === "warning" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ⚠️ Issue Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMode("note")}
                    className={`px-3 py-1 rounded-lg transition ${
                      replyMode === "note" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🔒 Staff Note
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyMode === "reply"
                        ? "Type official support message to both parties..."
                        : replyMode === "warning"
                        ? "Enter specific policy warning notice..."
                        : "Write private staff internal note (hidden from users)..."
                    }
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      replyMode === "warning"
                        ? "bg-amber-50 border-amber-300 focus:ring-amber-500/20 text-amber-900"
                        : replyMode === "note"
                        ? "bg-slate-100 border-slate-300 focus:ring-slate-500/20 text-slate-900 font-mono"
                        : "bg-slate-50 border-slate-200 focus:ring-indigo-500/20 text-slate-800"
                    }`}
                  />

                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer ${
                      replyMode === "warning"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : replyMode === "note"
                        ? "bg-slate-900 hover:bg-slate-800"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>{replyMode === "note" ? "Attach Note" : "Send"}</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* ── COLUMN 3: User & Booking Details Context Panel (col-span-3) ─────── */}
        <div className="lg:col-span-3 flex flex-col h-full bg-slate-50/50 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5 text-xs">
          {activeThread ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Context & Entities
                </h4>
                <span className="font-mono font-bold text-indigo-600">{activeThread.booking_code}</span>
              </div>

              {/* Customer Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                    Customer (Renter)
                  </span>
                  {activeThread.customer?.is_verified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                    {activeThread.customer?.avatar_url ? (
                      <img src={activeThread.customer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      activeThread.customer?.name?.charAt(0) || "C"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{activeThread.customer?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{activeThread.customer?.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Phone: {activeThread.customer?.phone}</span>
                  <Link href={`/admin/users?search=${encodeURIComponent(activeThread.customer?.email)}`} className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                    Profile <ExternalLink size={10} />
                  </Link>
                </div>
              </div>

              {/* Owner Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Host (Owner)
                  </span>
                  {activeThread.owner?.is_verified && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                    {activeThread.owner?.avatar_url ? (
                      <img src={activeThread.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      activeThread.owner?.name?.charAt(0) || "O"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{activeThread.owner?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{activeThread.owner?.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Phone: {activeThread.owner?.phone}</span>
                  <Link href={`/admin/users?search=${encodeURIComponent(activeThread.owner?.email)}`} className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                    Profile <ExternalLink size={10} />
                  </Link>
                </div>
              </div>

              {/* Related Booking Details */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Booking Details</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                    {activeThread.booking?.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Period:</span>
                    <span className="font-semibold text-slate-800">{activeThread.booking?.start_date} → {activeThread.booking?.end_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-bold text-emerald-600">৳ {Number(activeThread.booking?.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit:</span>
                    <span>৳ {Number(activeThread.booking?.security_deposit).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/admin/bookings?search=${encodeURIComponent(activeThread.booking_code)}`}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
                  >
                    <span>Inspect Booking Record</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Related Item Listing */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Rented Listing</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {activeThread.product?.image_url ? (
                      <img src={activeThread.product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Car size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate text-xs">{activeThread.product?.title}</p>
                    <p className="text-[10px] text-slate-500">
                      ৳ {Number(activeThread.product?.price_per_day).toLocaleString()} / day • {activeThread.product?.category}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/products/${activeThread.product?.slug || activeThread.product?.id}`}
                  target="_blank"
                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
                >
                  <span>View Public Listing</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

              {/* Staff Internal Notes */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Lock size={12} className="text-amber-400" />
                    <span>Staff Notes ({activeThread.internal_notes?.length || 0})</span>
                  </div>
                </div>

                {activeThread.internal_notes?.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No internal notes attached yet.</p>
                ) : (
                  <div className="space-y-2 pt-1 max-h-36 overflow-y-auto custom-scrollbar">
                    {activeThread.internal_notes.map((n: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white/10 rounded-xl text-[10px] space-y-0.5">
                        <div className="flex justify-between text-slate-300 font-semibold">
                          <span>{n.author}</span>
                          <span className="font-mono text-[9px] text-slate-400">{n.created_at}</span>
                        </div>
                        <p className="text-slate-100">{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Select a conversation to inspect customer, owner, and booking context.
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: SEND FORMAL WARNING ────────────────────────────────────────── */}
      {warningModalOpen && activeThread && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-slate-900 text-base">Issue Formal Warning</h3>
              </div>
              <button
                onClick={() => setWarningModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                This warning will be officially broadcasted into the chat between{" "}
                <span className="font-bold text-slate-900">{activeThread.customer?.name}</span> and{" "}
                <span className="font-bold text-slate-900">{activeThread.owner?.name}</span>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Violation Category</label>
                <select
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Off-platform transaction attempt (Terms of Service violation)">
                    Off-platform transaction attempt (Terms of Service violation)
                  </option>
                  <option value="Inappropriate language / harassment">
                    Inappropriate language / harassment
                  </option>
                  <option value="Payment avoidance / suspicious direct payment request">
                    Payment avoidance / suspicious direct payment request
                  </option>
                  <option value="Late vehicle return dispute without prior notice">
                    Late vehicle return dispute without prior notice
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setWarningModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdminAction("flag_reported", warningReason)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Broadcast Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ESCALATE TO DISPUTE ────────────────────────────────────────── */}
      {disputeModalOpen && activeThread && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Flag size={20} />
                <h3 className="font-bold text-slate-900 text-base">Escalate to Dispute</h3>
              </div>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Escalating will mark Booking <span className="font-mono font-bold text-slate-900">{activeThread.booking_code}</span> as{" "}
                <span className="text-rose-600 font-bold">DISPUTED</span> and open an official case in the RentHub Dispute Center.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dispute Reason / Claim</label>
                <textarea
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                  placeholder="Describe the dispute cause..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdminAction("escalate_dispute", disputeReason)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
