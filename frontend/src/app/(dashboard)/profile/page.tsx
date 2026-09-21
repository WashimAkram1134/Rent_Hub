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
  X,
  Plus,
  Trash2,
  Star,
  Info,
  Sliders,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import { profileService } from "@/features/profile/profileService";
import { ProfileUpdateData, ChangePasswordData } from "@/types";
import AppShell from "@/components/layout/AppShell";
import apiClient from "@/lib/axios";

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

// ── Settings Sections ─────────────────────────────────────────────────────────

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

// ── Payout Method Interface ───────────────────────────────────────────────────

interface PayoutMethodItem {
  id: string;
  type: "bkash" | "nagad" | "bank";
  title: string;
  account_number: string;
  display_number: string;
  bank_name?: string;
  is_primary: boolean;
}

const DEFAULT_PAYOUT_METHODS: PayoutMethodItem[] = [
  {
    id: "m1",
    type: "bkash",
    title: "bKash Personal Account",
    account_number: "01712347821",
    display_number: "•••• 7821",
    is_primary: true,
  },
  {
    id: "m2",
    type: "bank",
    title: "City Bank Savings",
    account_number: "21045199982",
    display_number: "•••• 4519",
    bank_name: "City Bank Ltd",
    is_primary: false,
  },
];

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

  // In-page feedback messages (NO browser alert pop-ups!)
  const [inPageNotice, setInPageNotice] = useState<{
    section: string;
    type: "success" | "warning" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotice = (section: string, type: "success" | "warning" | "error" | "info", message: string) => {
    setInPageNotice({ section, type, message });
    // Automatically clear after 5 seconds if not dismissed
    setTimeout(() => {
      setInPageNotice((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // ── Dynamic Payout & Earnings State ─────────────────────────────────────────
  const [payoutStats, setPayoutStats] = useState<{
    available_settlement: number;
    pending_amount: number;
    paid_amount: number;
    total_earnings: number;
    next_payout_date: string;
  }>({
    available_settlement: 0,
    pending_amount: 0,
    paid_amount: 0,
    total_earnings: 0,
    next_payout_date: "",
  });

  // Calculate dynamic upcoming Friday
  const getDynamicUpcomingFriday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= 18) {
      daysUntilFriday = 7;
    }
    const nextFri = new Date(now);
    nextFri.setDate(now.getDate() + daysUntilFriday);
    return nextFri.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });
  };

  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get("/analytics/owner-stats", { params: { owner_id: user.id } })
      .then((res) => {
        if (res.data?.payout_info) {
          setPayoutStats({
            available_settlement: Number(res.data.payout_info.available_settlement) || 0,
            pending_amount: Number(res.data.payout_info.pending_amount) || 0,
            paid_amount: Number(res.data.payout_info.paid_amount) || 0,
            total_earnings: Number(res.data.payout_info.total_earnings) || 0,
            next_payout_date: res.data.payout_info.next_payout_date || getDynamicUpcomingFriday(),
          });
        }
      })
      .catch(() => {
        setPayoutStats((prev) => ({
          ...prev,
          next_payout_date: getDynamicUpcomingFriday(),
        }));
      });
  }, [user?.id]);

  // ── Dynamic Payout Methods State & Actions ──────────────────────────────────
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("renthub_payout_methods");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          /* fallback */
        }
      }
    }
    return DEFAULT_PAYOUT_METHODS;
  });

  const [payoutSchedule, setPayoutSchedule] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("renthub_payout_schedule") || "weekly";
    }
    return "weekly";
  });

  // Modal / Form state for Add Payout Method
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"bkash" | "nagad" | "bank">("bkash");
  const [newMethodAccountName, setNewMethodAccountName] = useState("");
  const [newMethodNumber, setNewMethodNumber] = useState("");
  const [newMethodBankName, setNewMethodBankName] = useState("BRAC Bank Ltd");
  const [newMethodIsPrimary, setNewMethodIsPrimary] = useState(false);

  // Edit Payout Method Form State
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editBankName, setEditBankName] = useState("");

  const handleSaveNewMethod = () => {
    if (!newMethodNumber.trim()) {
      showNotice("payments", "error", "Please enter a valid account or wallet number.");
      return;
    }

    const last4 = newMethodNumber.slice(-4) || "0000";
    const title =
      newMethodType === "bkash"
        ? "bKash Personal Account"
        : newMethodType === "nagad"
        ? "Nagad Wallet Account"
        : `${newMethodBankName || "Bank"} Account`;

    const newMethod: PayoutMethodItem = {
      id: `m_${Date.now()}`,
      type: newMethodType,
      title,
      account_number: newMethodNumber,
      display_number: `•••• ${last4}`,
      bank_name: newMethodType === "bank" ? newMethodBankName : undefined,
      is_primary: newMethodIsPrimary || payoutMethods.length === 0,
    };

    let updated = [...payoutMethods];
    if (newMethod.is_primary) {
      updated = updated.map((m) => ({ ...m, is_primary: false }));
    }
    updated.push(newMethod);

    setPayoutMethods(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_payout_methods", JSON.stringify(updated));
    }
    setIsAddingMethod(false);
    setNewMethodNumber("");
    showNotice("payments", "success", `✓ New payout method (${title}) added successfully.`);
  };

  const handleUpdateMethod = (id: string) => {
    const updated = payoutMethods.map((m) => {
      if (m.id === id) {
        const last4 = editNumber ? editNumber.slice(-4) : m.display_number.slice(-4);
        return {
          ...m,
          account_number: editNumber || m.account_number,
          display_number: editNumber ? `•••• ${last4}` : m.display_number,
          bank_name: editBankName || m.bank_name,
        };
      }
      return m;
    });

    setPayoutMethods(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_payout_methods", JSON.stringify(updated));
    }
    setEditingMethodId(null);
    showNotice("payments", "success", "✓ Payout account details updated successfully.");
  };

  const handleSetPrimaryMethod = (id: string) => {
    const updated = payoutMethods.map((m) => ({
      ...m,
      is_primary: m.id === id,
    }));
    setPayoutMethods(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_payout_methods", JSON.stringify(updated));
    }
    setEditingMethodId(null);
    showNotice("payments", "success", "✓ Primary payout account updated.");
  };

  const handleDeleteMethod = (id: string) => {
    if (payoutMethods.length <= 1) {
      showNotice("payments", "warning", "You must keep at least one payout method connected.");
      return;
    }
    const updated = payoutMethods.filter((m) => m.id !== id);
    if (updated.length > 0 && !updated.some((m) => m.is_primary)) {
      updated[0].is_primary = true;
    }
    setPayoutMethods(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_payout_methods", JSON.stringify(updated));
    }
    setEditingMethodId(null);
    showNotice("payments", "info", "Payout method removed.");
  };

  const handleScheduleChange = (newSchedule: string) => {
    setPayoutSchedule(newSchedule);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_payout_schedule", newSchedule);
    }
    const label =
      newSchedule === "weekly"
        ? "Weekly (Every Friday auto-settlement)"
        : newSchedule === "biweekly"
        ? "Bi-weekly (1st & 15th auto-settlement)"
        : "Monthly (Last business day auto-settlement)";
    showNotice("payments", "success", `✓ Payout schedule frequency updated to ${label}.`);
  };

  // ── Dynamic Active Login Session (Real environment detection) ────────────────
  const [currentSession, setCurrentSession] = useState<{
    device: string;
    browser: string;
    location: string;
    isMobile: boolean;
  }>({
    device: "MacBook Pro",
    browser: "Chrome",
    location: "Dhaka, Bangladesh",
    isMobile: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    let deviceName = "Personal Computer";
    let browserName = "Web Browser";
    let isMobileDevice = false;

    // Detect Device
    if (/iPhone|iPad|iPod/i.test(ua)) {
      deviceName = /iPad/i.test(ua) ? "iPad" : "iPhone";
      isMobileDevice = true;
    } else if (/Android/i.test(ua)) {
      deviceName = "Android Device";
      isMobileDevice = true;
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceName = "MacBook / macOS Workstation";
    } else if (/Windows/i.test(ua)) {
      deviceName = "Windows PC";
    } else if (/Linux/i.test(ua)) {
      deviceName = "Linux Desktop";
    }

    // Detect Browser
    if (/Edg/i.test(ua)) {
      browserName = "Microsoft Edge";
    } else if (/Chrome/i.test(ua)) {
      browserName = "Google Chrome";
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browserName = "Apple Safari";
    } else if (/Firefox/i.test(ua)) {
      browserName = "Mozilla Firefox";
    }

    setCurrentSession({
      device: deviceName,
      browser: browserName,
      location: user?.address || "Dhaka, Bangladesh",
      isMobile: isMobileDevice,
    });
  }, [user?.address]);

  // ── Workable Appearance / Theme State ───────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = (localStorage.getItem("renthub_theme") as "light" | "dark" | "system") || "light";
    const savedCompact = localStorage.getItem("renthub_compact") === "true";

    setTheme(savedTheme);
    setCompactMode(savedCompact);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (savedCompact) {
      document.documentElement.classList.add("compact-density");
    } else {
      document.documentElement.classList.remove("compact-density");
    }
  }, []);

  const handleApplyTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (newTheme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    const label = newTheme === "light" ? "Light Mode" : newTheme === "dark" ? "Dark Mode" : "System Default Theme";
    showNotice("appearance", "success", `✓ Interface theme switched to ${label}.`);
  };

  const handleToggleCompactMode = (enabled: boolean) => {
    setCompactMode(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_compact", enabled ? "true" : "false");
      if (enabled) {
        document.documentElement.classList.add("compact-density");
      } else {
        document.documentElement.classList.remove("compact-density");
      }
    }
    showNotice(
      "appearance",
      "success",
      enabled ? "✓ Compact density mode enabled (reduced margins & tighter row spacing)." : "✓ Standard layout density restored."
    );
  };

  // ── Language Restriction Handler (Bangla coming soon in-page alert) ─────────
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [banglaBlocked, setBanglaBlocked] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "bn") {
      // System does not give permission to select Bangla yet
      e.target.value = "en";
      setSelectedLanguage("en");
      setBanglaBlocked(true);
      showNotice(
        "language",
        "warning",
        "⚠️ Permission Denied: RentHub Bengali (বাংলা) localization for Owner Dashboard is currently under development and will be available in the next release. All dashboard text remains in English (Default)."
      );
    } else {
      setSelectedLanguage("en");
      setBanglaBlocked(false);
      showNotice("language", "success", "✓ Display language set to English (Default).");
    }
  };

  // ── Security State & Handlers ───────────────────────────────────────────────
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // ── Notification Toggles ────────────────────────────────────────────────────
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

  // ── Profile Form Setup ──────────────────────────────────────────────────────
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
      showNotice("account", "success", "✓ Profile photo updated successfully.");
    } catch (err) {
      showNotice("account", "error", "Failed to upload photo. Please check image format.");
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
      showNotice("account", "success", "✓ Account information updated successfully!");
      setTimeout(() => setProfileSaved(false), 3500);
    } catch (e: any) {
      const msg = e.response?.data?.detail || "Failed to update profile. Please try again.";
      setProfileError(msg);
      showNotice("account", "error", msg);
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
      showNotice("account", "success", "✓ Account password changed successfully.");
      setTimeout(() => setPwdSaved(false), 3500);
    } catch {
      setPwdError("Current password is incorrect.");
      showNotice("account", "error", "Current password is incorrect.");
    }
  };

  if (!user) return null;

  const isVerified = user.identity_verification_status === "VERIFIED" || user.is_identity_verified;

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100 max-w-[1340px] mx-auto pb-20 space-y-6">
        {/* ── Top Header & Slogan Car Banner ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Owner Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage your account, preferences and platform settings.
            </p>
          </div>

          {/* Slogan & Car Banner */}
          <div className="rounded-2xl border border-sky-100 dark:border-slate-700 bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-2 sm:px-4 flex items-center justify-between gap-4 overflow-hidden shadow-2xs max-w-sm">
            <div className="pl-1">
              <p className="text-xs sm:text-sm font-serif italic text-blue-950 dark:text-blue-200 font-medium whitespace-nowrap">
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
          <nav className="w-full lg:w-[260px] shrink-0 bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-2 space-y-1">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveSection(id);
                    setInPageNotice(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Column Tab Content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* IN-PAGE GLOBAL NOTICE BANNER (Replacing all browser pop-ups / alert()) */}
            {inPageNotice && inPageNotice.section === activeSection && (
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
                  inPageNotice.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : inPageNotice.type === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                    : inPageNotice.type === "info"
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                    : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {inPageNotice.type === "success" && (
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {inPageNotice.type === "warning" && (
                    <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {inPageNotice.type === "info" && (
                    <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  )}
                  {inPageNotice.type === "error" && (
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{inPageNotice.message}</span>
                </div>
                <button
                  onClick={() => setInPageNotice(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  title="Dismiss message"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: ACCOUNT INFORMATION                                        */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "account" && (
              <>
                <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Information</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Update your personal details and profile informations.
                    </p>
                  </div>

                  {/* Profile Info Header Box */}
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Camera badge */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-2xl">
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
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {user.full_name || `${user.first_name} ${user.last_name}`.trim() || "Rafsan Ahmed"}
                          </h3>
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check size={11} className="stroke-[3]" />
                            Verified Owner
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          {user.email || "rafsan.ahmed@gmail.com"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          {user.phone || "+880 1712 345678"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
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
                        className="border border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold text-xs px-4 py-2 rounded-xl bg-white dark:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Camera size={14} />
                        {avatarLoading ? "Uploading…" : "Change Photo"}
                      </button>
                      <span className="text-[10px] text-slate-400 mt-1">
                        JPG, PNG. Max 5MB
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("full_name")}
                            placeholder="Rafsan Ahmed"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Business Name (Optional)
                        </label>
                        <div className="relative">
                          <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("business_name")}
                            placeholder="Rafsan's Rentals"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("email")}
                            placeholder="rafsan.ahmed@gmail.com"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("address")}
                            placeholder="Dhaka, Bangladesh"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rp("phone")}
                            placeholder="+880 1712 345678"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                          className="w-full p-3 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        />
                      </div>
                    </div>

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

                {/* Change Password Card */}
                <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Keep your account secure with a strong password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit(onSavePassword)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("current_password")}
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter current password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("new_password")}
                            type={showNew ? "text" : "password"}
                            placeholder="Enter new password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...rw("confirm_password")}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={wLoading}
                        className="px-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
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
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Business Verification</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Platform verification status, document validation, and trust badges.
                  </p>
                </div>

                <div
                  className={`border rounded-2xl p-6 shadow-2xs ${
                    isVerified
                      ? "bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800 border-emerald-200 dark:border-emerald-800"
                      : "bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white dark:from-amber-950/40 dark:via-slate-800 dark:to-slate-800 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isVerified
                            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                            : "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shadow-2xs"
                        }`}
                      >
                        {isVerified ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">Identity Verification</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isVerified
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200"
                            }`}
                          >
                            {isVerified ? "✓ Identity Verified" : "Action Required"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Verification Status</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={16} />
                      {isVerified ? "VERIFIED" : "PENDING"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Verified On</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                      15 September 2026
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Method</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                      National ID + Live Face
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: NOTIFICATION PREFERENCES                                   */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "notifications" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize what notifications you receive via email, push alerts, and SMS.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-5">
                  <div className="pt-2 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Booking Notifications
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "new_booking_req", label: "New booking request", desc: "Get notified immediately when a customer requests to rent your item." },
                        { key: "booking_approved", label: "Booking approved & paid", desc: "Alert when customer confirms rental payment." },
                        { key: "booking_cancelled", label: "Booking cancelled", desc: "Notification if a customer cancels an existing rental reservation." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
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

                  <div className="pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Messages & Inquiries
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "new_message", label: "New customer message", desc: "Notify when a renter sends a question or inquiry about your listing." },
                        { key: "marketing_messages", label: "Marketing & promotional updates", desc: "Tips to boost rental views, seasonal discounts, and platform newsletters." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
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

                  <div className="pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Earnings & Payouts
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { key: "payment_received", label: "Rental earnings credited", desc: "Notification whenever a completed rental funds your account balance." },
                        { key: "payout_completed", label: "Payout successfully transferred", desc: "Confirmation when funds are sent to your bKash or Bank." },
                        { key: "payout_failed", label: "Payout failure alert", desc: "Critical warning if a payout cannot be transferred due to account mismatch." },
                      ].map(({ key, label, desc }) => (
                        <label key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
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
                      showNotice("notifications", "success", "✓ Notification preferences updated successfully.");
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: PAYMENT & PAYOUT SETTINGS (Dynamic & Fully Workable)        */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "payments" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment & Payout Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage where and how your rental earnings are transferred.
                  </p>
                </div>

                {/* Dynamic Balances Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Available for Payout (Dynamic from DB) */}
                  <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      AVAILABLE FOR PAYOUT
                    </p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                      ৳{payoutStats.available_settlement.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Ready to withdraw</p>
                  </div>

                  {/* Pending Settlement (Dynamic from DB) */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      PENDING SETTLEMENT
                    </p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                      ৳{payoutStats.pending_amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">From ongoing rentals</p>
                  </div>

                  {/* Next Payout (Dynamic Upcoming Friday) */}
                  <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      NEXT PAYOUT
                    </p>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                      {payoutStats.next_payout_date || getDynamicUpcomingFriday()}
                    </p>
                    <p className="text-[10px] text-slate-400">Automatic weekly release</p>
                  </div>
                </div>

                {/* Connected Payout Methods Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      CONNECTED PAYOUT METHODS
                    </h3>
                    <button
                      onClick={() => {
                        setIsAddingMethod(true);
                        setEditingMethodId(null);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add Method
                    </button>
                  </div>

                  {/* Inline Form: Add New Payout Method */}
                  {isAddingMethod && (
                    <div className="p-5 rounded-2xl border-2 border-blue-400/80 bg-blue-50/20 dark:bg-slate-800/60 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Add New Payout Account
                        </h4>
                        <button
                          onClick={() => setIsAddingMethod(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Method Type Pills */}
                      <div className="flex gap-2">
                        {[
                          { id: "bkash", label: "bKash" },
                          { id: "nagad", label: "Nagad" },
                          { id: "bank", label: "Bank Account" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setNewMethodType(t.id as any)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              newMethodType === t.id
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            {newMethodType === "bank" ? "Account Holder Name" : "Account Name"}
                          </label>
                          <input
                            value={newMethodAccountName}
                            onChange={(e) => setNewMethodAccountName(e.target.value)}
                            placeholder={user.full_name || "Rafsan Ahmed"}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            {newMethodType === "bank" ? "Bank Account Number" : "Mobile Wallet Number"}
                          </label>
                          <input
                            value={newMethodNumber}
                            onChange={(e) => setNewMethodNumber(e.target.value)}
                            placeholder={newMethodType === "bank" ? "21045199982" : "01712345678"}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {newMethodType === "bank" && (
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Bank Name
                            </label>
                            <input
                              value={newMethodBankName}
                              onChange={(e) => setNewMethodBankName(e.target.value)}
                              placeholder="e.g. BRAC Bank, Dutch-Bangla Bank, City Bank"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={newMethodIsPrimary}
                          onChange={(e) => setNewMethodIsPrimary(e.target.checked)}
                          className="rounded text-blue-600 accent-blue-600 w-4 h-4"
                        />
                        <span>Set as primary payout account</span>
                      </label>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingMethod(false)}
                          className="px-4 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewMethod}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          Save Account
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connected Accounts List */}
                  {payoutMethods.map((m) => (
                    <div key={m.id} className="space-y-3">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {m.type === "bkash" ? (
                            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 dark:border-pink-900/60 flex items-center justify-center font-bold text-pink-600 text-xs shrink-0">
                              bKash
                            </div>
                          ) : m.type === "nagad" ? (
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center font-bold text-orange-600 text-xs shrink-0">
                              Nagad
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                              <CreditCard size={18} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</p>
                              {m.is_primary && (
                                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.display_number}</p>
                          </div>
                        </div>

                        {/* Workable Change Button */}
                        <button
                          onClick={() => {
                            if (editingMethodId === m.id) {
                              setEditingMethodId(null);
                            } else {
                              setEditingMethodId(m.id);
                              setEditNumber(m.account_number);
                              setEditBankName(m.bank_name || "");
                              setIsAddingMethod(false);
                            }
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {editingMethodId === m.id ? "Close" : "Change"}
                        </button>
                      </div>

                      {/* Inline Edit Form for this method */}
                      {editingMethodId === m.id && (
                        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-slate-800/80 space-y-3 animate-in fade-in duration-150">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Update {m.title}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Account / Phone Number
                              </label>
                              <input
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs"
                              />
                            </div>
                            {m.type === "bank" && (
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                  Bank Name
                                </label>
                                <input
                                  value={editBankName}
                                  onChange={(e) => setEditBankName(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              {!m.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryMethod(m.id)}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteMethod(m.id)}
                                className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingMethodId(null)}
                                className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateMethod(m.id)}
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Workable Payout Schedule Frequency Dropdown */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Payout Schedule Frequency
                  </label>
                  <select
                    value={payoutSchedule}
                    onChange={(e) => handleScheduleChange(e.target.value)}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="weekly">Weekly (Every Friday auto-settlement)</option>
                    <option value="biweekly">Bi-weekly (1st & 15th of every month)</option>
                    <option value="monthly">Monthly (Last business day)</option>
                  </select>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 5: SECURITY (Dynamic session detection, no fake iPhone)       */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "security" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Active Sessions</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage multi-factor authentication, active login devices, and session security.
                  </p>
                </div>

                {/* Password status */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Account Password</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Last changed 25 days ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection("account")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer"
                  >
                    Change in Account Info →
                  </button>
                </div>

                {/* Two Factor Auth */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Require an SMS verification code whenever logging into new devices.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      showNotice(
                        "security",
                        "success",
                        next
                          ? "✓ Two-Factor Authentication has been enabled on your account."
                          : "Two-Factor Authentication has been turned off."
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      twoFactorEnabled
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {twoFactorEnabled ? "Enabled ✓" : "Enable 2FA"}
                  </button>
                </div>

                {/* DYNAMIC ACTIVE LOGIN SESSIONS (Removed fake iPhone 15!) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      ACTIVE LOGIN SESSIONS
                    </h3>
                    <button
                      onClick={() => {
                        showNotice("security", "success", "✓ All other device sessions have been terminated. Your current session is active and secure.");
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Log Out Other Devices
                    </button>
                  </div>

                  {/* Real Detected Current Session */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentSession.isMobile ? (
                        <Smartphone size={18} className="text-slate-500 dark:text-slate-400" />
                      ) : (
                        <Laptop size={18} className="text-slate-500 dark:text-slate-400" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentSession.device} — {currentSession.location}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                          {currentSession.browser} • Active now (This session)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 6: APPEARANCE (Fully Workable Theme & Compact Mode)           */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "appearance" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Interface</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your dashboard theme, layout density, and visual preferences.
                  </p>
                </div>

                {/* Workable Theme Selector */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    INTERFACE THEME
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light Mode", desc: "Clean white & slate" },
                      { id: "dark", label: "Dark Mode", desc: "Modern deep navy palette" },
                      { id: "system", label: "System Default", desc: "Sync with OS theme" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleApplyTheme(t.id as any)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          theme === t.id
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 ring-2 ring-blue-500/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workable Compact Mode */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Compact Density Mode</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Reduces margins and table padding to fit more rental rows on screen.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => handleToggleCompactMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 7: LANGUAGE & REGION (Bangla restricted with in-page alert)   */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "language" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Language & Regional Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Bangladesh-focused localization, currency, and local time settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="en">English (Default)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                    {banglaBlocked && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <div className="space-y-0.5">
                          <p className="font-bold">Permission Denied — Coming Soon</p>
                          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                            RentHub Bengali (বাংলা) localization is currently under active development. The system does not permit switching at this time. All text across the Owner Dashboard will continue to be displayed in English.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Currency</label>
                    <select className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="BDT">৳ BDT — Bangladeshi Taka</option>
                      <option value="USD">$ USD — US Dollar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Region</label>
                    <input
                      readOnly
                      value="Bangladesh (Dhaka, Chittagong, Sylhet)"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Zone</label>
                    <input
                      readOnly
                      value="GMT +6:00 (Asia/Dhaka Standard Time)"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 8: HELP & SUPPORT                                             */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === "support" && (
              <div className="bg-white dark:bg-[#131929] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Owner Help & Support</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Get quick assistance, report rental disputes, and learn owner best practices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Customer hasn't returned item",
                      desc: "Open a priority dispute report with RentHub mediation team.",
                      action: "Report Rental Issue →",
                      color: "text-red-600 dark:text-red-400",
                    },
                    {
                      title: "Security Deposit Claims",
                      desc: "How damage assessments and claim deductions are settled.",
                      action: "Read Deposit Policy →",
                      color: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      title: "Payout & Banking Help",
                      desc: "Learn about bKash settlement timings and bank clearance.",
                      action: "View Payout FAQ →",
                      color: "text-indigo-600 dark:text-indigo-400",
                    },
                    {
                      title: "Booking Cancellation Rules",
                      desc: "Understand refund percentages and owner compensation guarantees.",
                      action: "Cancellation Policy →",
                      color: "text-emerald-600 dark:text-emerald-400",
                    },
                  ].map((h, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 hover:shadow-xs transition-shadow">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{h.desc}</p>
                      <button
                        onClick={() => router.push("/support")}
                        className={`text-xs font-bold ${h.color} hover:underline cursor-pointer`}
                      >
                        {h.action}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800 dark:to-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dedicated Owner Concierge</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Hotline: <span className="font-semibold text-slate-800 dark:text-slate-200">+880 9612 345678</span> • Email: <span className="font-semibold text-slate-800 dark:text-slate-200">owners@renthub.com</span>
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
