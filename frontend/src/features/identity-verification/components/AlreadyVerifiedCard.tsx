"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/features/auth/authStore";

interface AlreadyVerifiedCardProps {
  returnUrl?: string | null;
}

export function AlreadyVerifiedCard({ returnUrl }: AlreadyVerifiedCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(2);

  const destination = returnUrl || "/dashboard";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace(destination);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, destination]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-10 flex flex-col items-center text-center max-w-lg mx-auto"
    >
      {/* Icon with glow badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-white border-2 border-white">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* Badge */}
      <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-3 inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
      </span>

      {/* Title & description */}
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        You Are Already Verified!
      </h2>
      <p className="mt-2.5 text-slate-600 text-sm leading-relaxed">
        Your identity has been confirmed with your <span className="font-semibold text-slate-800">NID document</span> and <span className="font-semibold text-slate-800">live face recognition</span>. You do not need to identify again.
      </p>

      {/* User info box */}
      {user && (
        <div className="mt-6 w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user.first_name?.[0] || "U"}{user.last_name?.[0] || ""}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{user.full_name || `${user.first_name} ${user.last_name}`}</p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
            Permanent Status
          </span>
        </div>
      )}

      {/* Action button */}
      <div className="mt-8 w-full space-y-3">
        <button
          id="btn-return-verified"
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("renthub_verify_return_url");
            }
            router.push(destination);
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{returnUrl ? "Return to Booking" : "Go to Dashboard"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-slate-400">
          Redirecting automatically in {countdown}s…
        </p>
      </div>
    </motion.div>
  );
}
