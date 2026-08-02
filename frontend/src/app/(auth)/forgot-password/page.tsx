"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
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

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">
          Check your email
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          If an account exists for that email, we have sent instructions to reset your password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">
          Forgot password?
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm ${
                errors.email ? "border-destructive focus:ring-destructive/30" : "border-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="forgot-submit"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 text-sm"
          style={{
            background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending link...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Send Reset Link
            </>
          )}
        </button>
      </form>
    </div>
  );
}
