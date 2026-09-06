"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/schemas";
import AuthService from "@/features/auth/authService";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative rounded-3xl p-7 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to sign in
        </Link>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display font-black text-2xl text-white mb-2">
              Recovery Link Sent
            </h2>
            <p className="text-slate-300 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              If an account is associated with that email, instructions to reset your password are on their way.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm bg-blue-600 hover:bg-blue-500 transition-all shadow-lg"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Password Recovery
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-slate-400 text-sm">
                Enter your account email to receive a secure recovery reset link.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 mb-6 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                      errors.email ? "border-rose-500/60 focus:ring-rose-500/30" : "border-white/[0.1] hover:border-white/[0.18]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <button
                id="forgot-submit"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(37,99,235,0.3)] mt-4"
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Sending instructions...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
