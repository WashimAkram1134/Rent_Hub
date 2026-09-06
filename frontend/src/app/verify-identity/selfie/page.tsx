"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, AlertCircle, RotateCcw, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/features/identity-verification/components/StepIndicator";
import { identityVerificationApi } from "@/features/identity-verification/api/identityVerificationApi";
import { useCamera } from "@/features/identity-verification/hooks/useCamera";
import { useFaceLandmarks } from "@/features/identity-verification/hooks/useFaceLandmarks";
import type { ChallengeTypeValue } from "@/features/identity-verification/types";
import { useAuthStore } from "@/features/auth/authStore";
import { AlreadyVerifiedCard } from "@/features/identity-verification/components/AlreadyVerifiedCard";

type PageState = "loading" | "challenge" | "captured" | "submitting" | "error";

function SelfieContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const returnUrl = searchParams.get("returnUrl") || (typeof window !== "undefined" ? sessionStorage.getItem("renthub_verify_return_url") : null);
  
  const { videoRef, isReady, error: camError, permissionDenied, startCamera, stopCamera, captureFrameAsync } = useCamera();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [challenge, setChallenge] = useState<{ challenge_type: ChallengeTypeValue; instruction: string } | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const challengeCompletedRef = useRef(false);

  const { result: landmarkResult, startDetection, stopDetection } = useFaceLandmarks(
    videoRef,
    challenge?.challenge_type as ChallengeTypeValue | null
  );

  if (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true) {
    return <AlreadyVerifiedCard returnUrl={returnUrl} />;
  }

  // ── 1. Init: Fetch challenge & start camera ──────────────────────────
  useEffect(() => {
    if (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true) {
      return;
    }

    identityVerificationApi
      .getChallenge()
      .then((c) => {
        setChallenge(c as { challenge_type: ChallengeTypeValue; instruction: string });
      })
      .catch(() => {
        // Fallback challenge if endpoint is unavailable
        setChallenge({ challenge_type: "BLINK", instruction: "Please look at camera and blink or click Capture Photo" });
      });

    startCamera();
  }, [user, startCamera]);

  // ── 2. Transition to challenge when camera is ready ──────────────────
  useEffect(() => {
    if (isReady && pageState === "loading") {
      setPageState("challenge");
    }
  }, [isReady, pageState]);

  // ── 3. Start landmark detection when in challenge state ──────────────
  useEffect(() => {
    if (pageState === "challenge" && challenge && isReady) {
      challengeCompletedRef.current = false;
      startDetection();
    } else {
      stopDetection();
    }
  }, [pageState, challenge, isReady, startDetection, stopDetection]);

  // ── 4. Manual or automatic capture function ───────────────────────────
  const performCapture = useCallback(async () => {
    if (pageState === "captured" || pageState === "submitting") return;
    
    // Trigger shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const blob = await captureFrameAsync();
    if (blob) {
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      stopCamera();
      stopDetection();
      setPageState("captured");
    }
  }, [pageState, captureFrameAsync, stopCamera, stopDetection]);

  // ── 5. Auto-capture when landmark challenge passes ────────────────────
  useEffect(() => {
    if (pageState !== "challenge" || challengeCompletedRef.current) return;
    if (landmarkResult.challengePassed || landmarkResult.completed) {
      challengeCompletedRef.current = true;
      performCapture();
    }
  }, [landmarkResult.challengePassed, landmarkResult.completed, pageState, performCapture]);

  // ── 6. Retake photo ───────────────────────────────────────────────────
  const handleRetake = async () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedBlob(null);
    setCapturedUrl(null);
    setSubmitError(null);
    challengeCompletedRef.current = false;
    await startCamera();
    setPageState("challenge");
  };

  // ── 7. Submit selfie for matching & verification ──────────────────────
  const handleSubmit = async () => {
    if (!capturedBlob) return;
    setPageState("submitting");
    setSubmitError(null);

    const challengeType = challenge?.challenge_type || "BLINK";

    try {
      // Step 1: Upload selfie frame
      const selfieResult = await identityVerificationApi.uploadSelfie(
        capturedBlob,
        challengeType,
        true
      );

      if (!selfieResult.liveness_passed) {
        setSubmitError(selfieResult.error || "Liveness check failed. Please ensure your face is well-lit and clearly visible.");
        setPageState("captured");
        return;
      }

      // Step 2: Complete face match & update user status
      const completeResult = await identityVerificationApi.complete();
      
      // Update global auth store state immediately so user is permanently verified
      if (user) {
        setUser({ ...user, identity_verification_status: "VERIFIED", is_identity_verified: true });
      }
      try {
        await useAuthStore.getState().refreshUser();
      } catch {}

      const queryParam = returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : "";
      router.push(`/verify-identity/result?status=${completeResult.status.toLowerCase()}${queryParam}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || "Verification submission failed. Please retake the photo.";
      setSubmitError(msg);
      setPageState("captured");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      <StepIndicator currentStep="selfie" />

      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Live Face Verification</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              Step 3 of 4
            </span>
          </div>
          <p className="mt-1.5 text-slate-500 text-sm">
            Align your face in the oval. Follow the instruction or click <strong className="text-slate-700">Take Photo</strong> to capture.
          </p>
        </div>

        {/* ── Camera Viewport ─────────────────────────────────────────── */}
        <div className="relative w-full aspect-[4/3] max-h-[440px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
          
          {/* Shutter flash animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover mirror ${pageState === "captured" ? "hidden" : ""}`}
          />

          {/* Captured preview */}
          {capturedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedUrl} alt="Captured selfie preview" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Oval face guide with glow */}
          {(pageState === "challenge" || pageState === "loading") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-52 h-72 sm:w-60 sm:h-80 rounded-[50%] border-4 transition-all duration-300 ${
                  landmarkResult.faceDetected
                    ? landmarkResult.completed
                      ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]"
                      : "border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    : "border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                }`}
              />
            </div>
          )}

          {/* Loading spinner */}
          {pageState === "loading" && !isReady && (
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-10 h-10 rounded-full border-3 border-white/20 border-t-indigo-500 animate-spin" />
              <p className="text-white/80 text-sm font-medium">Starting camera…</p>
            </div>
          )}

          {/* Camera permission error */}
          {(camError || permissionDenied) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center z-20">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-white text-base font-semibold">Camera Access Required</p>
              <p className="text-slate-400 text-xs max-w-sm">{camError}</p>
              <button
                onClick={() => startCamera()}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Challenge instruction overlay banner */}
          {pageState === "challenge" && challenge && (
            <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <p className="text-white text-xs sm:text-sm font-bold">
                    {challenge.instruction}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-xs mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    animate={{ width: `${Math.max(10, landmarkResult.progress * 100).toFixed(0)}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Captured Success badge */}
          {pageState === "captured" && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Selfie Captured</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification check not completed</p>
              <p className="text-xs text-rose-600 mt-0.5">{submitError}</p>
            </div>
          </motion.div>
        )}

        {/* ── Control Actions ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          
          {/* Active camera state: Take photo button */}
          {(pageState === "challenge" || pageState === "loading") && (
            <button
              id="btn-take-selfie"
              onClick={performCapture}
              disabled={!isReady}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                isReady
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/25 hover:shadow-lg active:scale-[0.98]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo / Capture Live Selfie</span>
            </button>
          )}

          {/* Captured state: Retake or Submit */}
          {pageState === "captured" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-retake-selfie"
                onClick={handleRetake}
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>

              <button
                id="btn-submit-selfie"
                onClick={handleSubmit}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit & Complete Verification →</span>
              </button>
            </div>
          )}

          {/* Submitting state */}
          {pageState === "submitting" && (
            <div className="py-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-center gap-3 text-indigo-700">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
              <p className="text-sm font-semibold">Comparing live selfie with your NID document…</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </motion.div>
  );
}

export default function SelfiePage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" /></div>}>
      <SelfieContent />
    </Suspense>
  );
}
