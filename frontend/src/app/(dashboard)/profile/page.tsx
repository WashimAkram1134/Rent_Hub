"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { profileService } from "@/features/profile/profileService";
import { ProfileUpdateData, ChangePasswordData } from "@/types";

// ── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, "Required").max(100),
  last_name: z.string().min(1, "Required").max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
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

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register: rp,
    handleSubmit: handleProfile,
    formState: { errors: pe, isSubmitting: pLoading },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (user) resetProfile({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone ?? "" });
  }, [user, resetProfile]);

  const {
    register: rw,
    handleSubmit: handlePassword,
    formState: { errors: we, isSubmitting: wLoading },
    reset: resetPassword,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // ── Avatar upload ─────────────────────────────────────────────────────────

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const { avatar_url } = await profileService.uploadAvatar(file);
      if (user) setUser({ ...user, avatar_url });
    } catch {
      /* ignored */
    } finally {
      setAvatarLoading(false);
    }
  };

  // ── Profile submit ────────────────────────────────────────────────────────

  const onProfileSubmit = async (values: ProfileForm) => {
    setProfileError("");
    setProfileSaved(false);
    try {
      const updated = await profileService.updateProfile(values as ProfileUpdateData);
      setUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e: any) {
      setProfileError(e.response?.data?.detail || "Failed to update profile. Please try again.");
    }
  };

  // ── Password submit ───────────────────────────────────────────────────────

  const onPasswordSubmit = async (values: PasswordForm) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and password</p>
      </div>

      {/* ── Avatar card ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-lg mb-5">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                `${user.first_name[0]}${user.last_name[0]}`
              )}
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                <Loader2 size={24} className="text-violet-600 animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <Camera size={16} />
              {avatarLoading ? "Uploading…" : "Change Photo"}
            </button>
            <p className="text-slate-500 text-xs mt-2">JPEG, PNG, WebP — max 5 MB</p>
          </div>
        </div>
      </div>

      {/* ── Profile info card ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-lg mb-5">Personal Information</h2>
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First name */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...rp("first_name")}
                  placeholder="First name"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
                />
              </div>
              {pe.first_name && <p className="text-red-500 text-xs mt-1">{pe.first_name.message}</p>}
            </div>

            {/* Last name */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Last Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...rp("last_name")}
                  placeholder="Last name"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
                />
              </div>
              {pe.last_name && <p className="text-red-500 text-xs mt-1">{pe.last_name.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...rp("email")}
                placeholder="Email address"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
              />
            </div>
            {pe.email && <p className="text-red-500 text-xs mt-1">{pe.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...rp("phone")}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
              />
            </div>
          </div>

          {profileError && <p className="text-red-500 text-sm">{profileError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {pLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Saving…</>
              ) : profileSaved ? (
                <><Check size={16} /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change password card ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-lg mb-5">Change Password</h2>
        <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...rw("current_password")}
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {we.current_password && <p className="text-red-500 text-xs mt-1">{we.current_password.message}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...rw("new_password")}
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {we.new_password && <p className="text-red-500 text-xs mt-1">{we.new_password.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...rw("confirm_password")}
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
              />
            </div>
            {we.confirm_password && <p className="text-red-500 text-xs mt-1">{we.confirm_password.message}</p>}
          </div>

          {pwdError && <p className="text-red-500 text-sm">{pwdError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={wLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {wLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Updating…</>
              ) : pwdSaved ? (
                <><Check size={16} /> Updated!</>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
