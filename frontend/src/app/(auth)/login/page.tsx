"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/authStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/dashboard";
  const reason = searchParams.get("reason");

  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

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

      if (isAdmin && returnUrl.startsWith("/admin")) {
        router.push(returnUrl);
      } else if (isPublicActionFlow) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard");
      }
    } catch {
      // Error is set in the store
    }
  };

  const handleFastFill = (email: string, pass: string, label: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setActiveDemo(label);
    clearError();
    setTimeout(() => setActiveDemo(null), 2500);
  };

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

        {/* Session Expired Alert */}
        {reason === "session_expired" && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Your session expired. Please log in again to continue safely.</span>
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
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

        {/* Demo Fast-Fill Section */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Logins
            </span>
            {activeDemo && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                <CheckCircle2 className="w-3 h-3" /> Filled {activeDemo}!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFastFill("jahid1234@gmail.com", "Password123!", "Owner")}
              className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                💼 Demo Owner
              </div>
              <div className="text-[10px] text-slate-400 truncate">jahid1234@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleFastFill("washimakram013099@gmail.com", "Password123!", "Admin")}
              className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                ⚡ Demo Admin
              </div>
              <div className="text-[10px] text-slate-400 truncate">washimakram...</div>
            </button>
          </div>
        </div>

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
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="login-google"
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 font-medium text-xs transition-all hover:scale-[1.01]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            id="login-facebook"
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 font-medium text-xs transition-all hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
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
