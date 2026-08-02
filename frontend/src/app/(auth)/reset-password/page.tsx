"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/features/auth/schemas";
import AuthService from "@/features/auth/authService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing or invalid. Please check your link or request a new reset email.");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.resetPassword(token, data.new_password, data.confirm_password);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          "Password reset failed. The link may have expired."
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
          Password updated
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Your password has been changed successfully. You can now log in with your new password.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{
            background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Choose a new password that is secure and easy for you to remember.
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
      {token && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Password */}
          <div>
            <label
              htmlFor="reset-password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                {...register("new_password")}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                  errors.new_password ? "border-destructive focus:ring-destructive/30" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1.5 text-xs text-destructive">{errors.new_password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="reset-confirm-password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                {...register("confirm_password")}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                  errors.confirm_password ? "border-destructive focus:ring-destructive/30" : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1.5 text-xs text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="reset-submit"
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
                Updating password...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Reset Password
              </>
            )}
          </button>
        </form>
      )}

      {!token && (
        <Link
          href="/forgot-password"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-foreground border border-border hover:bg-muted/50 text-sm transition-all"
        >
          Request new reset link
        </Link>
      )}
    </div>
  );
}
