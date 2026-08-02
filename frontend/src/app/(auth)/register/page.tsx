"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle,
  Camera, Laptop, Bike, Package, ChevronLeft, ChevronRight, User, Store,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/authStore";

type Step = 1 | 2;

const ROLE_OPTIONS = [
  {
    value: "customer" as const,
    label: "Rent Items",
    description: "Browse and rent items from local owners",
    icon: User,
    examples: ["Camera", "Laptop", "Projector"],
    color: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/40",
  },
  {
    value: "owner" as const,
    label: "List & Earn",
    description: "List your items and earn while they're idle",
    icon: Store,
    examples: ["Camera gear", "Electronics", "Furniture"],
    color: "from-violet-500 to-purple-600",
    bg: "from-violet-500/10 to-purple-600/10",
    border: "border-violet-500/40",
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

  // ── Success State ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">Check your inbox!</h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s
                  ? "text-white shadow-brand"
                  : step > s
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
              style={step === s ? { background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" } : {}}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Choose role" : "Your details"}
            </span>
            {s < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-5">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step 1 — Role Selection ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">How will you use RentHub?</p>

          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.value;
            return (
              <button
                key={option.value}
                id={`role-${option.value}`}
                type="button"
                onClick={() => handleRoleSelect(option.value)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${
                  isSelected ? `${option.border} bg-gradient-to-br ${option.bg}` : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shrink-0 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{option.label}</span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{option.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {option.examples.map((ex) => (
                        <span key={ex} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white mt-2 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 — Details Form ──────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Back */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {/* Role badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 w-fit mb-2">
            {selectedRole === "customer" ? <User className="w-4 h-4 text-primary" /> : <Store className="w-4 h-4 text-primary" />}
            <span className="text-primary text-sm font-medium capitalize">{selectedRole} account</span>
          </div>
          <input type="hidden" {...register("role")} value={selectedRole} />

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="register-first-name"
              label="First name"
              placeholder="John"
              error={errors.first_name?.message}
              {...register("first_name")}
            />
            <FormField
              id="register-last-name"
              label="Last name"
              placeholder="Doe"
              error={errors.last_name?.message}
              {...register("last_name")}
            />
          </div>

          {/* Email */}
          <FormField
            id="register-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />

          {/* Phone */}
          <FormField
            id="register-phone"
            label="Phone (optional)"
            type="tel"
            placeholder="+880 17XX XXXXXX"
            error={errors.phone?.message}
            {...register("phone")}
          />

          {/* Password */}
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                {...register("password")}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.password ? "border-destructive" : "border-border"}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-foreground mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="register-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...register("confirm_password")}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.confirm_password ? "border-destructive" : "border-border"}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_password && <p className="mt-1.5 text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
import { forwardRef } from "react";

const FormField = forwardRef<HTMLInputElement, {
  id: string;
  label: string;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  [key: string]: any;
}>(({ id, label, error, type = "text", placeholder, autoComplete, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <input
      ref={ref}
      id={id}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      {...props}
      className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder-muted-foreground outline-none text-sm transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${error ? "border-destructive" : "border-border"}`}
    />
    {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
  </div>
));
FormField.displayName = "FormField";
