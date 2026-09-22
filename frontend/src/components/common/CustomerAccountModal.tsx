"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Store,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customTitle?: string;
  customDescription?: string;
}

export default function CustomerAccountModal({
  isOpen,
  onClose,
  onSuccess,
  customTitle,
  customDescription,
}: CustomerAccountModalProps) {
  const router = useRouter();
  const { user, setUser, setActiveRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/users/me/request-customer");
      const updatedUser = res.data;
      if (updatedUser) {
        setUser(updatedUser);
      }
      setActiveRole("customer");
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/bookings");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Failed to activate customer account:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Could not activate customer account. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 overflow-hidden relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Top Icon Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mb-1">
              <Sparkles size={11} />
              Customer Mode
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {customTitle || "Customer Account Required"}
            </h3>
          </div>
        </div>

        {/* Current Account Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">{user?.email}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Store size={11} /> Owner Only
            </span>
          </div>
        </div>

        {/* Informative Explanation */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {customDescription || (
            <>
              You are currently registered as an <strong>Owner</strong>. To rent products from other owners, manage personal bookings, and view return schedules, you need an activated <strong>Customer ID</strong>.
            </>
          )}
        </p>

        {/* Benefits Checklist */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={12} />
            </div>
            <span>Browse and rent items from thousands of owners</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={12} />
            </div>
            <span>Track active rentals, pickup schedules & security deposits</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={12} />
            </div>
            <span>Instantly toggle between Owner and Customer Mode with 1 click</span>
          </div>
        </div>

        {/* In-Page Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* In-Page Success Banner */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span className="font-bold">Customer Account Activated! Redirecting to Customer Bookings...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleActivate}
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Activating Customer ID...</span>
              </>
            ) : (
              <>
                <span>Request & Activate Customer Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Stay in Owner Mode
          </button>
        </div>
      </div>
    </div>
  );
}
