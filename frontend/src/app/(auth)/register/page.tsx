"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Store,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/authStore";

type Step = 1 | 2;

const ROLE_OPTIONS = [
  {
    value: "customer" as const,
    label: "Renter Account",
    description: "Browse & rent cars, cameras, drones, laptops & luxury outfits.",
    icon: User,
    examples: ["Vehicles", "Cameras", "Electronics"],
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    value: "owner" as const,
    label: "Owner / Partner",
    description: "List your assets, receive verified bookings & earn daily payouts.",
    icon: Store,
    examples: ["Earn up to ৳1.2L/mo", "Escrow Protection"],
    color: "from-violet-500 to-indigo-600",
    glow: "rgba(139,92,246,0.15)",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: storeRegister, isLoading, error, clearError } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<"customer" | "owner">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "customer" },
  });

  const handleRoleSelect = (role: "customer" | "owner") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await storeRegister({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        role: data.role,
      });
      setSuccess(true);
    } catch {
      // Error in store
    }
  };

  if (success) {
    return (
      <div className="w-full">
        <div className="relative rounded-3xl p-8 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-3">
            Account Created! 🎉
          </h2>
          <p className="text-slate-300 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Welcome to RentHub! Your account is ready. Sign in to start exploring verified rentals and listing your items.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white text-sm shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all"
            style={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            }}
          >
            Go to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative rounded-3xl p-7 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Join RentHub Today
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Create an account
          </h1>
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2 px-2 py-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                    : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 text-slate-400"
                }`}
              >
                {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === s ? "text-white" : "text-slate-400"
                }`}
              >
                {s === 1 ? "1. Select Role" : "2. Account Details"}
              </span>
            </div>
          ))}
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 mb-6 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-3.5">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Select your primary purpose:
            </p>

            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.value;
              return (
                <button
                  key={option.value}
                  id={`role-${option.value}`}
                  type="button"
                  onClick={() => handleRoleSelect(option.value)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? "border-blue-500/60 bg-blue-500/[0.08] shadow-[0_0_25px_rgba(59,130,246,0.15)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{option.label}</span>
                        {isSelected && (
                          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mb-2 leading-relaxed">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {option.examples.map((ex) => (
                          <span
                            key={ex}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.06]"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              id="register-next"
              type="button"
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm mt-4 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-[1.01] transition-all"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
              }}
            >
              Continue to Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Form Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Role
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold capitalize">
                {selectedRole === "customer" ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                {selectedRole} Account
              </div>
            </div>

            <input type="hidden" {...register("role")} value={selectedRole} />

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  {...register("first_name")}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.first_name ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("last_name")}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.last_name ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.email ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="+880 17XX XXXXXX"
                  {...register("phone")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.phone ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.password ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-slate-950/60 text-white placeholder-slate-500 outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    errors.confirm_password ? "border-rose-500" : "border-white/[0.1]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Creating your account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
