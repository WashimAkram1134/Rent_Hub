"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { identityVerificationApi } from "@/features/identity-verification/api/identityVerificationApi";
import { useAuthStore } from "@/features/auth/authStore";
import { AlreadyVerifiedCard } from "@/features/identity-verification/components/AlreadyVerifiedCard";

function VerifyIdentityGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const returnUrl = searchParams.get("returnUrl") || (typeof window !== "undefined" ? sessionStorage.getItem("renthub_verify_return_url") : null);

  const [isVerified, setIsVerified] = useState<boolean>(
    user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (returnUrl && typeof window !== "undefined") {
      sessionStorage.setItem("renthub_verify_return_url", returnUrl);
    }
    const queryParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : "";

    // If local state already indicates verified, do not query or navigate to consent
    if (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true) {
      setIsVerified(true);
      setLoading(false);
      return;
    }

    identityVerificationApi
      .start()
      .then((data) => {
        const status = data.status;
        if (status === "VERIFIED") {
          if (user) {
            setUser({ ...user, identity_verification_status: "VERIFIED", is_identity_verified: true });
          }
          setIsVerified(true);
          setLoading(false);
        } else if (data.consent_given) {
          router.replace(`/verify-identity/document${queryParam}`);
        } else {
          router.replace(`/verify-identity/consent${queryParam}`);
        }
      })
      .catch(() => {
        router.replace(`/verify-identity/consent${queryParam}`);
      });
  }, [router, returnUrl, user, setUser]);

  if (isVerified) {
    return <AlreadyVerifiedCard returnUrl={returnUrl} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-slate-500 text-sm">Checking your verification status…</p>
    </div>
  );
}

export default function VerifyIdentityGatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" /></div>}>
      <VerifyIdentityGateContent />
    </Suspense>
  );
}
