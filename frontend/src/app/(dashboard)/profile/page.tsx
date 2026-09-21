"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Lock,
  Palette,
  Globe,
  Headphones,
  Mail,
  Phone,
  Store,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import { profileService } from "@/features/profile/profileService";
import { ProfileUpdateData, ChangePasswordData } from "@/types";
import AppShell from "@/components/layout/AppShell";

// ── Validation Schemas ─────────────────────────────────────────────────────────

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  business_name: z.string().max(150).optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  address: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  bio: z.string().max(200, "Bio must be at most 200 characters").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Required"),
    new_password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ── Settings Sections (Exact match to screenshot & requirements) ───────────────

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account Information", icon: User },
  { id: "verification", label: "Business Verification", icon: ShieldCheck },
  { id: "notifications", label: "Notification Preferences", icon: Bell },
  { id: "payments", label: "Payment & Payouts", icon: CreditCard },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "support", label: "Help & Support", icon: Headphones },
] as const;

type SectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export default function OwnerSettingsPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<SectionId>("account");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Appearance & regional states
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [compactMode, setCompactMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");

  // Notification toggles
  const [notifs, setNotifs] = useState({
    new_booking_req: true,
    booking_approved: true,
    booking_cancelled: true,
    new_message: true,
    marketing_messages: false,
    payment_received: true,
    payout_completed: true,
    payout_failed: true,
    platform_updates: true,
  });

  const {
    register: rp,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    formState: { errors: pe, isSubmitting: pLoading },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || (user ? `${user.first_name} ${user.last_name}`.trim() : "Rafsan Ahmed"),
      business_name: user?.business_name || "Rafsan's Rentals",
      email: user?.email || "rafsan.ahmed@gmail.com",
      address: user?.address || "Dhaka, Bangladesh",
      phone: user?.phone || "+880 1712 345678",
      bio: user?.bio || "Hi! I'm Rafsan, a passionate owner offering well-maintained vehicles, electronics and more. Feel free to contact me for any booking.",
    },
  });

  const bioValue = watchProfile("bio") || "";

  useEffect(() => {
    if (user) {
      resetProfile({
        full_name: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
        business_name: user.business_name || "Rafsan's Rentals",
        email: user.email,
        address: user.address || "Dhaka, Bangladesh",
        phone: user.phone || "+880 1712 345678",
        bio: user.bio || "Hi! I'm Rafsan, a passionate owner offering well-maintained vehicles, electronics and more. Feel free to contact me for any booking.",
      });
    }
  }, [user, resetProfile]);

  const {
    register: rw,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: we, isSubmitting: wLoading },
    reset: resetPassword,
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  // Avatar upload
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const { avatar_url } = await profileService.uploadAvatar(file);
      if (user) setUser({ ...user, avatar_url });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Profile Save
  const onSaveProfile = async (values: ProfileFormData) => {
    setProfileError("");
    setProfileSaved(false);
    try {
      const names = values.full_name.trim().split(" ");
      const first_name = names[0] || "";
      const last_name = names.slice(1).join(" ") || "";

      const updated = await profileService.updateProfile({
        first_name,
        last_name,
        email: values.email,
        phone: values.phone,
        business_name: values.business_name,
        address: values.address,
        bio: values.bio,
      } as ProfileUpdateData);

      setUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e: any) {
      setProfileError(e.response?.data?.detail || "Failed to update profile. Please try again.");
    }
  };

  // Password Submit
  const onSavePassword = async (values: PasswordFormData) => {
    setPwdError("");
    setPwdSaved(false);
    try {
      await profileService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      } as ChangePasswordData);
      setPwdSaved(true);
      resetPassword();
      setTimeout(() => setPwdSaved(false), 3000);
    } catch {
      setPwdError("Current password is incorrect.");
    }
  };

  if (!user) return null;

  const isVerified = user.identity_verification_status === "VERIFIED" || user.is_identity_verified;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 font-sans text-slate-800 max-w-[1340px] mx-auto pb-20 space-y-6">
        {/* ── Top Header & Slogan Car Banner (Exact match to screenshot) ──────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Owner Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Manage your account, preferences and platform settings.
            </p>
          </div>

          {/* Slogan & Car Banner */}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/50 p-2 sm:px-4 flex items-center justify-between gap-4 overflow-hidden shadow-2xs max-w-sm">
            <div className="pl-1">
              <p className="text-xs sm:text-sm font-serif italic text-blue-950 font-medium whitespace-nowrap">
                &ldquo;Better settings,<br className="hidden sm:inline" /> smoother bookings.&rdquo;
              </p>
            </div>
            <div className="w-28 sm:w-36 h-14 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-2xs">
              <img
                src="/images/owner-settings-car.jpg"
                alt="Better settings, smoother bookings"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* ── Settings Layout: Left Sub-navigation + Right Tab Content ────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left Sub-Navigation Menu ──────────────────────────────────────── */}
          <nav className="w-full lg:w-[260px] shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-2 space-y-1">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-slate-400"}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Column Tab Content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: ACCOUNT INFORMATION (Exact screenshot match)               */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "account" && (
              <>
                {/* Main Account Information Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Account Information</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your personal details and profile informations.
                    </p>
                  </div>

                  {/* Profile Info Header Box */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Camera badge */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-2xl">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            `${user.first_name?.[0] || "R"}${user.last_name?.[0] || "A"}`
                          )}
                        </div>
                        {/* Little circular camera badge */}
                        <button
                          onClick={() => avatarFileRef.current?.click()}
                          disabled={avatarLoading}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                          title="Upload new avatar"
                        >
                          {avatarLoading ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Camera size={12} />
                          )}
                        </button>
                      </div>

                      {/* User details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {user.full_name || `${user.first_name} ${user.last_name}`.trim() || "Rafsan Ahmed"}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" />
                            Verified Owner
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          {user.email || "rafsan.ahmed@gmail.com"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          {user.phone || "+880 1712 345678"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          {user.address || "Dhaka, Bangladesh"}
                        </p>
                      </div>
                    </div>

                    {/* Change Photo Button */}
                    <div className="shrink-0 flex flex-col items-center sm:items-end">
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarChange}
                      />
                      <button
                        onClick={() => avatarFileRef.current?.click()}
                        disabled={avatarLoading}
                        className="border border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold text-xs px-4 py-2 rounded-xl bg-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {avatarLoading ? "Uploading…" : "Change Photo"}
                      </button>
                      <span className="text-[10px] text-slate-400 mt-1">
                        JPG, PNG. Max 5MB
                      </span>
                    </div>
                  </div>

                  {/* Feedback alerts */}
                  {profileSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      Account information updated successfully!
                    </div>
                  )}
                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {/* Form Inputs Grid (2 columns matching screenshot) */}
                  <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("full_name")}
                            placeholder="Rafsan Ahmed"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                        {pe.full_name && (
                          <p className="text-[11px] text-red-500 mt-1">{pe.full_name.message}</p>
                        )}
                      </div>

                      {/* Business Name (Optional) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Business Name (Optional)
                        </label>
                        <div className="relative">
                          <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("business_name")}
                            placeholder="Rafsan's Rentals"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("email")}
                            placeholder="rafsan.ahmed@gmail.com"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                        {pe.email && (
                          <p className="text-[11px] text-red-500 mt-1">{pe.email.message}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("address")}
                            placeholder="Dhaka, Bangladesh"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("phone")}
                            placeholder="+880 1712 345678"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Bio
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {bioValue.length}/200
                          </span>
                        </div>
                        <textarea
                          {...rp("bio")}
                          rows={3}
                          placeholder="Hi! I'm Rafsan, a passionate owner offering well-maintained vehicles, electronics and more. Feel free to contact me for any booking."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={pLoading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {pLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} className="stroke-[3]" />
                        )}
                        <span>{pLoading ? "Saving…" : "Save Changes"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Card (Matching screenshot) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Keep your account secure with a strong password.
                    </p>
                  </div>

                  {pwdSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      Password updated successfully!
                    </div>
                  )}
                  {pwdError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      {pwdError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit(onSavePassword)} className="space-y-4">
                    {/* 3 Columns Password Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("current_password")}
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter current password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {we.current_password && (
                          <p className="text-[11px] text-red-500 mt-1">{we.current_password.message}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("new_password")}
                            type={showNew ? "text" : "password"}
                            placeholder="Enter new password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {we.new_password && (
                          <p className="text-[11px] text-red-500 mt-1">{we.new_password.message}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("confirm_password")}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {we.confirm_password && (
                          <p className="text-[11px] text-red-500 mt-1">{we.confirm_password.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={wLoading}
                        className="px-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        {wLoading ? "Updating…" : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: BUSINESS VERIFICATION                                      */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "verification" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Business Verification</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform verification status, document validation, and trust badges.
                  </p>
                </div>

                <div
                  className={`border rounded-2xl p-6 shadow-2xs ${
                    isVerified
                      ? "bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-emerald-200"
                      : "bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white border-amber-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-700 shadow-2xs"
                            : "bg-amber-100 text-amber-700 shadow-2xs"
                        }`}
                      >
                        {isVerified ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-slate-900 text-base">Identity Verification</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isVerified ? "✓ Identity Verified" : "Action Required"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                          {isVerified
                            ? "Your account identity is verified using National ID (NID) and live biometric face verification. All your listings proudly feature the Verified Owner badge."
                            : "Complete your one-time verification to unlock high-value rentals and build credibility with prospective renters."}
                        </p>
                      </div>
                    </div>

                    {!isVerified && (
                      <Link
                        href="/verify-identity"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
                      >
                        <span>Start Verification</span>
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Verification Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Verification Status</p>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 size={16} />
                      {isVerified ? "VERIFIED" : "PENDING"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Verified On</p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={16} className="text-blue-600" />
                      15 September 2026
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Method</p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      National ID + Live Face
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Owner Trust & Safety Guarantee</p>
                  RentHub identity verification provides protection against fraudulent bookings, secures your damage deposit eligibility, and activates automated payouts.
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: NOTIFICATION PREFERENCES                                   */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "notifications" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize what notifications you receive via email, push alerts, and SMS.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 space-y-5">
                  {/* Booking Alerts */}
                  <div className="pt-2 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Booking Notifications
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "new_booking_req", label: "New booking request", desc: "Get notified immediately when a customer requests to rent your item." },
                        { key: "booking_approved", label: "Booking approved & paid", desc: "Alert when customer confirms rental payment." },
                        { key: "booking_cancelled", label: "Booking cancelled", desc: "Notification if a customer cancels an existing rental reservation." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifs[key as keyof typeof notifs]}
                            onChange={(e) => setNotifs({ ...notifs, [key]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer accent-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Customer Messages */}
                  <div className="pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Messages & Inquiries
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "new_message", label: "New customer message", desc: "Notify when a renter sends a question or inquiry about your listing." },
                        { key: "marketing_messages", label: "Marketing & promotional updates", desc: "Tips to boost rental views, seasonal discounts, and platform newsletters." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifs[key as keyof typeof notifs]}
                            onChange={(e) => setNotifs({ ...notifs, [key]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer accent-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Earnings & Payouts
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "payment_received", label: "Rental earnings credited", desc: "Notification whenever a completed rental funds your account balance." },
                        { key: "payout_completed", label: "Payout successfully transferred", desc: "Confirmation when funds are sent to your bKash or Bank." },
                        { key: "payout_failed", label: "Payout failure alert", desc: "Critical warning if a payout cannot be transferred due to account mismatch." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifs[key as keyof typeof notifs]}
                            onChange={(e) => setNotifs({ ...notifs, [key]: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer accent-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      alert("Notification preferences saved!");
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: PAYMENT & PAYOUT SETTINGS                                  */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "payments" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Payment & Payout Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage where and how your rental earnings are transferred.
                  </p>
                </div>

                {/* Balances Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Available for Payout</p>
                    <p className="text-xl font-black text-blue-600">৳24,500</p>
                    <p className="text-[10px] text-slate-400">Ready to withdraw</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Pending Settlement</p>
                    <p className="text-xl font-black text-slate-800">৳8,000</p>
                    <p className="text-[10px] text-slate-400">From ongoing rentals</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Next Payout</p>
                    <p className="text-base font-bold text-emerald-700">Friday, 25 Sep</p>
                    <p className="text-[10px] text-slate-400">Automatic weekly release</p>
                  </div>
                </div>

                {/* Connected Payout Methods */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Connected Payout Methods
                    </h3>
                    <button
                      onClick={() => alert("Add payout method modal")}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      + Add Method
                    </button>
                  </div>

                  {/* bKash */}
                  <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center font-bold text-pink-600 text-xs">
                        bKash
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">bKash Personal Account</p>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-200">
                            Primary
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">•••• 7821</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer">
                      Change
                    </button>
                  </div>

                  {/* Bank Account */}
                  <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">City Bank Savings</p>
                        <p className="text-[11px] text-slate-500">•••• 4519</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer">
                      Change
                    </button>
                  </div>
                </div>

                {/* Payout Schedule Preference */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Payout Schedule Frequency
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => setPayoutSchedule(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="weekly">Weekly (Every Friday auto-settlement)</option>
                    <option value="biweekly">Bi-weekly (1st & 15th of every month)</option>
                    <option value="monthly">Monthly (Last business day)</option>
                  </select>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 5: SECURITY                                                   */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "security" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Security & Active Sessions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage multi-factor authentication, active login devices, and session security.
                  </p>
                </div>

                {/* Password status */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Account Password</p>
                      <p className="text-[11px] text-slate-500">Last changed 25 days ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection("account")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Change in Account Info →
                  </button>
                </div>

                {/* Two Factor Auth */}
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-500">
                        Require an SMS verification code whenever logging into new devices.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      twoFactorEnabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {twoFactorEnabled ? "Enabled ✓" : "Enable 2FA"}
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Active Login Sessions
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Laptop size={18} className="text-slate-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">MacBook Pro — Dhaka, Bangladesh</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Chrome • Active now (This session)</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-slate-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">iPhone 15 Pro — Dhaka, Bangladesh</p>
                          <p className="text-[10px] text-slate-400">Mobile Browser • 2 hours ago</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert("Logged out session")}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 6: APPEARANCE                                                 */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "appearance" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Appearance & Interface</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your dashboard theme, layout density, and visual preferences.
                  </p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Interface Theme
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light Mode", desc: "Clean white & slate" },
                      { id: "dark", label: "Dark Mode", desc: "Modern deep navy palette" },
                      { id: "system", label: "System Default", desc: "Sync with OS theme" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          theme === t.id
                            ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{t.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Compact Density Mode</p>
                    <p className="text-[11px] text-slate-500">
                      Reduces margins and table padding to fit more rental rows on screen.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 7: LANGUAGE & REGION                                          */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "language" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Language & Regional Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bangladesh-focused localization, currency, and local time settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Display Language</label>
                    <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="en">English (Default)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Primary Currency</label>
                    <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="BDT">৳ BDT — Bangladeshi Taka</option>
                      <option value="USD">$ USD — US Dollar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Primary Region</label>
                    <input
                      readOnly
                      value="Bangladesh (Dhaka, Chittagong, Sylhet)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Time Zone</label>
                    <input
                      readOnly
                      value="GMT +6:00 (Asia/Dhaka Standard Time)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 8: HELP & SUPPORT                                             */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "support" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Owner Help & Support</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Get quick assistance, report rental disputes, and learn owner best practices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Customer hasn't returned item",
                      desc: "Open a priority dispute report with RentHub mediation team.",
                      action: "Report Rental Issue →",
                      color: "text-red-600 bg-red-50 border-red-100",
                    },
                    {
                      title: "Security Deposit Claims",
                      desc: "How damage assessments and claim deductions are settled.",
                      action: "Read Deposit Policy →",
                      color: "text-blue-600 bg-blue-50 border-blue-100",
                    },
                    {
                      title: "Payout & Banking Help",
                      desc: "Learn about bKash settlement timings and bank clearance.",
                      action: "View Payout FAQ →",
                      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
                    },
                    {
                      title: "Booking Cancellation Rules",
                      desc: "Understand refund percentages and owner compensation guarantees.",
                      action: "Cancellation Policy →",
                      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    },
                  ].map((h, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2 hover:shadow-xs transition-shadow">
                      <h4 className="text-xs font-bold text-slate-900">{h.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{h.desc}</p>
                      <button
                        onClick={() => router.push("/support")}
                        className={`text-xs font-bold ${h.color.split(" ")[0]} hover:underline cursor-pointer`}
                      >
                        {h.action}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Direct Contact Hotline */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dedicated Owner Concierge</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hotline: <span className="font-semibold text-slate-800">+880 9612 345678</span> • Email: <span className="font-semibold text-slate-800">owners@renthub.com</span>
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/support")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
