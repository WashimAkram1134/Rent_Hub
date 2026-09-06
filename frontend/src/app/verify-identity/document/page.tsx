"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/features/identity-verification/components/StepIndicator";
import { identityVerificationApi } from "@/features/identity-verification/api/identityVerificationApi";
import { useAuthStore } from "@/features/auth/authStore";
import { AlreadyVerifiedCard } from "@/features/identity-verification/components/AlreadyVerifiedCard";

const TIPS = [
  "Upload a clear, full-card image",
  "Make sure the entire card is visible",
  "Avoid glare, shadows, and reflections",
  "The photo on the card must be clearly visible",
  "Use a flat surface with good lighting",
];

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

function DocumentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const returnUrl = searchParams.get("returnUrl") || (typeof window !== "undefined" ? sessionStorage.getItem("renthub_verify_return_url") : null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified === true) {
    return <AlreadyVerifiedCard returnUrl={returnUrl} />;
  }

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleRemove = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await identityVerificationApi.uploadDocument(file);
      if (result.face_detected) {
        const queryParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : "";
        router.push(`/verify-identity/selfie${queryParam}`);
      } else {
        setError(result.error || "Could not detect a face. Please try a clearer image.");
      }
    } catch {
      setError("Upload failed. Please check your connection and try again.");
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
      <StepIndicator currentStep="document" />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Identity Document</h1>
          <p className="mt-1.5 text-slate-500 text-sm">
            Upload a clear photo of your NID card. Both front side must be fully visible.
          </p>
        </div>

        {/* Upload zone */}
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.label
              key="dropzone"
              htmlFor="doc-file-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to {MAX_MB}MB</p>
              </div>
              <input
                id="doc-file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </motion.label>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="ID document preview" className="w-full max-h-64 object-contain" />
              <button
                id="btn-remove-doc"
                onClick={handleRemove}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white border border-slate-200 rounded-full p-1.5 shadow-sm transition-all"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
              <div className="p-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 truncate">{file?.name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">Tips for a good photo:</p>
          <ul className="space-y-1">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-xs text-amber-700">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </motion.p>
        )}

        <button
          id="btn-upload-document"
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            file && !loading
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Analyzing document…
            </span>
          ) : (
            "Upload & Continue"
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function DocumentPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" /></div>}>
      <DocumentContent />
    </Suspense>
  );
}
