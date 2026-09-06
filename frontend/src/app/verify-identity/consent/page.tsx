"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { StepIndicator } from "@/features/identity-verification/components/StepIndicator";
import { identityVerificationApi } from "@/features/identity-verification/api/identityVerificationApi";
import { useAuthStore } from "@/features/auth/authStore";
import { AlreadyVerifiedCard } from "@/features/identity-verification/components/AlreadyVerifiedCard";

const CONSENT_ITEMS = [
  {
    icon: Shield,
    title: "Identity Document Review",
    body: "RentHub will process the submitted identity document image to detect and extract a face photo for comparison.",
  },
  {
    icon: Eye,
    title: "Live Selfie Comparison",
    body: "Your live selfie will be compared against the face on your submitted identity document to confirm they match.",
  },
  {
    icon: Lock,
    title: "Not Government Verification",
    body: "This is NOT an official government or NID verification. This only confirms your selfie matches your submitted document.",
  },
  {
    icon: AlertCircle,
    title: "Data Protection",
    body: "Submitted images are used solely for verification and deleted after the process completes. Your data is handled per RentHub's Privacy Policy.",
  },
];

function ConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const returnUrl = searchParams.get("returnUrl") || (typeof window !== "undefined" ? sessionStorage.getItem("renthub_verify_return_url") : null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true) {
    return <AlreadyVerifiedCard returnUrl={returnUrl} />;
  }

  const handleContinue = async () => {
    if (!agreed) return;
    setLoading(true);
    setError(null);
    try {
      await identityVerificationApi.recordConsent();
      const queryParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : "";
      router.push(`/verify-identity/document${queryParam}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* Step indicator */}
      <StepIndicator currentStep="consent" />

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
          <p className="mt-1.5 text-slate-500 text-sm leading-relaxed">
            This is a one-time process. Once verified, you can book items on RentHub without repeating this step.
          </p>
        </div>

        {/* Consent items */}
        <div className="flex flex-col gap-4">
          {CONSENT_ITEMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              id="consent-checkbox"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                agreed
                  ? "bg-indigo-600 border-indigo-600"
                  : "border-slate-300 bg-white group-hover:border-indigo-400"
              }`}
            >
              {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <span className="text-sm text-slate-600 leading-relaxed">
            I have read and understood the above information. I consent to RentHub processing my identity document and selfie for verification purposes.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          id="btn-consent-continue"
          onClick={handleContinue}
          disabled={!agreed || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            agreed && !loading
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Processing…
            </span>
          ) : (
            "Continue to Document Upload"
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" /></div>}>
      <ConsentContent />
    </Suspense>
  );
}
