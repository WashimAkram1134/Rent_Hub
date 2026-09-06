"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StepIndicator } from "@/features/identity-verification/components/StepIndicator";
import { useAuthStore } from "@/features/auth/authStore";

const STATES = {
  verified: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bg: "from-emerald-50 to-white",
    border: "border-emerald-100",
    title: "Identity Verified Permanently",
    subtitle: "Your identity has been verified successfully with your NID & live face. You will never need to verify your identity again for any booking or listing on RentHub.",
    badge: "RentHub Verified",
    badgeClass: "bg-emerald-100 text-emerald-700",
    action: { label: "Return to Booking", href: "/", id: "btn-verified-continue", primary: true },
  },
  manual_review: {
    icon: Clock,
    iconClass: "text-amber-500",
    bg: "from-amber-50 to-white",
    border: "border-amber-100",
    title: "Under Review",
    subtitle:
      "Your verification requires additional review by our team. This usually takes 1–2 business days. We'll notify you once it's complete.",
    badge: "Pending Review",
    badgeClass: "bg-amber-100 text-amber-700",
    action: { label: "Go to Dashboard", href: "/dashboard", id: "btn-review-dashboard", primary: false },
  },
  failed: {
    icon: XCircle,
    iconClass: "text-slate-400",
    bg: "from-slate-50 to-white",
    border: "border-slate-100",
    title: "Verification Unsuccessful",
    subtitle:
      "We were unable to match your selfie with the identity document. Please try again with a clearer photo in good lighting.",
    badge: null,
    badgeClass: "",
    action: { label: "Try Again", href: "/verify-identity", id: "btn-try-again", primary: true },
  },
} as const;

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const rawStatus = params.get("status") ?? "failed";
  const returnUrl = params.get("returnUrl") || (typeof window !== "undefined" ? sessionStorage.getItem("renthub_verify_return_url") : null);
  const state = STATES[rawStatus as keyof typeof STATES] ?? STATES.failed;
  const Icon = state.icon;
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Refresh auth store user data to ensure verified status is synced immediately
    if (rawStatus === "verified" && user) {
      setUser({ ...user, identity_verification_status: "VERIFIED", is_identity_verified: true });
    }
    useAuthStore.getState().refreshUser().catch(() => {});
  }, [rawStatus, user, setUser]);

  const handleAction = () => {
    if (rawStatus === "verified") {
      const destination = returnUrl || "/dashboard";
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("renthub_verify_return_url");
      }
      router.push(destination);
    } else if (rawStatus === "failed") {
      const queryParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : "";
      router.push(`/verify-identity${queryParam}`);
    } else {
      router.push(state.action.href);
    }
  };

  const actionLabel = rawStatus === "verified"
    ? (returnUrl ? "Return to Booking" : "Continue to Marketplace")
    : state.action.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      <StepIndicator currentStep="result" />

      <div className={`bg-gradient-to-b ${state.bg} rounded-2xl border ${state.border} shadow-sm p-8 sm:p-10 flex flex-col items-center gap-6 text-center`}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center"
        >
          <Icon className={`w-10 h-10 ${state.iconClass}`} />
        </motion.div>

        {/* Badge */}
        {state.badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${state.badgeClass}`}>
            {state.badge}
          </span>
        )}

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{state.title}</h1>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            {state.subtitle}
          </p>
        </div>

        {/* Disclaimer for verified */}
        {rawStatus === "verified" && (
          <p className="text-xs text-slate-400 max-w-sm">
            This verification confirms your selfie matches the photo on your submitted identity document.
            This is not an official government or NID verification.
          </p>
        )}

        {/* Action */}
        <button
          id={state.action.id}
          onClick={handleAction}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            state.action.primary
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
              : "bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          {rawStatus === "failed" ? <RefreshCw className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          {actionLabel}
        </button>
      </div>
    </motion.div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" /></div>}>
      <ResultContent />
    </Suspense>
  );
}
