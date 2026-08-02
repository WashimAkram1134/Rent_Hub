"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import AuthService from "@/features/auth/authService";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setErrorMsg("Email verification token is missing.");
        return;
      }

      try {
        await AuthService.verifyEmail(token);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.error?.message ??
            "The verification link is invalid or has expired."
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="text-center py-8">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Verifying your email...
          </h2>
          <p className="text-muted-foreground text-sm">
            Please wait a moment while we confirm your email verification.
          </p>
        </div>
      )}

      {status === "success" && (
        <div>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Email Verified! 🎉
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Your email has been verified successfully. You can now log in to access all the features on RentHub.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))",
            }}
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Verification failed
          </h2>
          <p className="text-sm text-destructive mb-6 max-w-sm mx-auto">
            {errorMsg}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground border border-border hover:bg-muted/50 text-sm transition-all"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-center py-10 text-muted-foreground text-sm">Verifying...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
