"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransitionStore } from "@/store/transitionStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Wrench,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/authStore";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import apiClient from "@/lib/axios";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/dashboard";
  const reason = searchParams.get("reason");

  const { login, isLoading, error, clearError } = useAuthStore();
  const { showLoader } = useTransitionStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Platform Maintenance Mode State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("");
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/cms/maintenance-status")
      .then((res) => {
        if (res.data?.maintenance_mode) {
          setMaintenanceMode(true);
          setMaintenanceNotice(
            res.data.maintenance_notice ||
              "Platform is undergoing scheduled database maintenance. We will be back online shortly."
          );
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setMaintenanceError(null);
    try {
      await login(data);
      const currentUser = useAuthStore.getState().user;
      const isAdmin = currentUser?.primary_role === "admin";

      // Only follow returnUrl if it's an explicit public action (e.g. cart checkout or public product booking)
      const isPublicActionFlow =
        returnUrl &&
        returnUrl !== "/dashboard" &&
        returnUrl !== "/" &&
        (returnUrl.startsWith("/products/") ||
         returnUrl.startsWith("/cart") ||
         returnUrl.startsWith("/categories") ||
         returnUrl.startsWith("/verify-identity"));

      // Determine redirect destination
      let destination = "/dashboard";
      if (isAdmin && returnUrl?.startsWith("/admin")) {
        destination = returnUrl;
      } else if (isAdmin) {
        destination = "/dashboard";
      } else if (isPublicActionFlow && returnUrl) {
        destination = returnUrl;
      }

      // Show global overlay (lives in root layout, survives route change)
      // then navigate immediately — dashboard will hide the overlay when ready
      showLoader();
      router.push(destination);
    } catch (err: any) {
      const errCode = err?.response?.data?.error?.code;
      const errMsg = err?.response?.data?.error?.message;
      const isMaintenance =
        errCode === "MAINTENANCE_MODE" ||
        err?.response?.status === 503 ||
        (errMsg && errMsg.toLowerCase().includes("maintenance"));

      if (isMaintenance) {
        setMaintenanceMode(true);
        if (errMsg) setMaintenanceNotice(errMsg);
        setMaintenanceError(
          "Access Restricted: Platform is currently in Maintenance Mode. Only administrators can log in. Customer and Owner access will resume shortly."
        );
      }
    }
  };

  const handleGoogleLoaderShow = useCallback((destination: string) => {
    showLoader();
    router.push(destination);
  }, [showLoader, router]);

  return (
    <div className="w-full">
      {/* Glassmorphic Login Card */}
      <div className="relative rounded-3xl p-7 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Ambient Top Glow Border Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Header */}
        <div className="mb-7 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Secure Portal Access
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Welcome back 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your credentials to access your rentals, listings, and wallet.
          </p>
        </div>

        {/* Platform Maintenance Mode Announcement Banner */}
        {maintenanceMode && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-500/40 p-4 sm:p-5 mb-6 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                    <span>Platform Maintenance Active</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200">
                    Admins Only
                  </span>
                </div>

                <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                  {maintenanceNotice || "Platform is undergoing scheduled database maintenance. We will be back online shortly."}
                </p>

                <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-300/80 flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Notice: Customer & Owner access is paused during maintenance. Only system administrators may log in.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Rejection Error Banner */}
        {maintenanceError && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 mb-6 text-amber-200 text-sm animate-shake shadow-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-200">Customer & Owner Access Paused</div>
              <div className="text-xs text-amber-100/90 mt-0.5 leading-relaxed">{maintenanceError}</div>
            </div>
          </div>
        )}

        {/* Session Expired Alert */}
        {reason === "session_expired" && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Your session expired. Please log in again to continue safely.</span>
          </div>
        )}

        {/* Global Error Alert (hidden if maintenance error is displayed) */}
        {error && !maintenanceError && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 mb-6 text-rose-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-200">Authentication Failed</div>
              <div className="text-xs text-rose-300/90 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                  errors.email
                    ? "border-rose-500/60 focus:ring-rose-500/30"
                    : "border-white/[0.1] hover:border-white/[0.18]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                {...register("password")}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                  errors.password
                    ? "border-rose-500/60 focus:ring-rose-500/30"
                    : "border-white/[0.1] hover:border-white/[0.18]"
                }`}
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-slate-950/60 text-blue-600 focus:ring-blue-500/40 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-300">Keep me signed in</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit Encrypted</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-white text-sm transition-all duration-300 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
            }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to RentHub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900/90 px-3 text-slate-400">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div>
          <GoogleAuthButton
            role="customer"
            label="Continue with Google"
            onShowLoader={handleGoogleLoaderShow}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-medium text-xs transition-all hover:scale-[1.01] active:scale-98"
          />
        </div>

        {/* Footer Navigation Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-bold hover:underline"
            >
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
