"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import { Loader2, X, ArrowRight, UserCheck, KeyRound, ExternalLink, ShieldCheck } from "lucide-react";

interface GoogleAuthButtonProps {
  role?: "customer" | "owner";
  className?: string;
  label?: string;
  onSuccess?: () => void;
}

interface SavedGoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

export function GoogleAuthButton({
  role = "customer",
  className = "",
  label = "Google",
  onSuccess,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { loginWithGoogle, isLoading } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [customRole, setCustomRole] = useState<"customer" | "owner">(role);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>([]);
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [clientIdInputValue, setClientIdInputValue] = useState("");

  const googleHiddenBtnRef = useRef<HTMLDivElement>(null);

  // Sync role prop
  useEffect(() => {
    setCustomRole(role);
  }, [role]);

  // Load saved Google accounts and Client ID on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check env first, then localStorage
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const localClientId = localStorage.getItem("renthub_google_client_id") || "";
    const activeClientId = envClientId || localClientId;
    setGoogleClientId(activeClientId);
    setClientIdInputValue(activeClientId);

    // Load saved accounts from localStorage
    try {
      const stored = localStorage.getItem("renthub_saved_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Initialize Google Identity Services if client ID exists
  useEffect(() => {
    if (!googleClientId || typeof window === "undefined") return;

    const checkGsi = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && googleHiddenBtnRef.current) {
        try {
          g.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setSubmitting(true);
                try {
                  await loginWithGoogle({
                    credential: response.credential,
                    role: customRole,
                  });
                  setModalOpen(false);
                  handleRedirect();
                } catch (err: any) {
                  setAuthError(err?.message || "Google authentication failed.");
                } finally {
                  setSubmitting(false);
                }
              }
            },
          });

          // Render native Google button
          googleHiddenBtnRef.current.innerHTML = "";
          g.accounts.id.renderButton(googleHiddenBtnRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "pill",
            text: "signin_with",
            width: "100%",
          });
        } catch (err) {
          console.warn("Error initializing Google Identity Services:", err);
        }
      }
    };

    // Retry until script is loaded
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        checkGsi();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId, customRole]);

  // Handle post-login navigation
  const handleRedirect = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    const currentUser = useAuthStore.getState().user;
    const isAdmin = currentUser?.primary_role === "admin";

    const isPublicActionFlow =
      returnUrl &&
      returnUrl !== "/dashboard" &&
      returnUrl !== "/" &&
      (returnUrl.startsWith("/products/") ||
        returnUrl.startsWith("/cart") ||
        returnUrl.startsWith("/categories") ||
        returnUrl.startsWith("/offers") ||
        returnUrl.startsWith("/verify-identity"));

    if (isAdmin && returnUrl?.startsWith("/admin")) {
      router.push(returnUrl);
    } else if (isPublicActionFlow) {
      router.push(returnUrl);
    } else {
      router.push("/dashboard");
    }
  };

  const handlePerformAuth = async (profile: {
    email: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    role: "customer" | "owner";
  }) => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await loginWithGoogle({
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      });

      // Save this account into localStorage so it is remembered on this device!
      if (typeof window !== "undefined") {
        const newAccount: SavedGoogleAccount = {
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          email: profile.email,
          avatar: profile.avatar_url,
        };
        const updated = [
          newAccount,
          ...savedAccounts.filter((a) => a.email.toLowerCase() !== profile.email.toLowerCase()),
        ].slice(0, 3);
        localStorage.setItem("renthub_saved_google_accounts", JSON.stringify(updated));
        setSavedAccounts(updated);
      }

      setModalOpen(false);
      handleRedirect();
    } catch (err: any) {
      setAuthError(err?.message || "Google authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    // If native Google Identity OAuth2 is available, trigger native account chooser popup directly!
    const g = typeof window !== "undefined" ? (window as any).google : null;

    if (googleClientId && g?.accounts?.oauth2) {
      try {
        setSubmitting(true);
        setAuthError(null);
        const tokenClient = g.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          prompt: "select_account",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setSubmitting(false);
              if (tokenResponse.error !== "popup_closed_by_user") {
                setAuthError(tokenResponse.error_description || "Google authorization was not completed.");
                setModalOpen(true);
              }
              return;
            }
            if (tokenResponse.access_token) {
              try {
                // Fetch verified profile directly from Google
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();

                if (!googleProfile.email) {
                  throw new Error("Could not retrieve email from Google profile.");
                }

                await loginWithGoogle({
                  email: googleProfile.email,
                  first_name: googleProfile.given_name || googleProfile.name?.split(" ")[0] || "User",
                  last_name: googleProfile.family_name || googleProfile.name?.split(" ").slice(1).join(" ") || "",
                  avatar_url: googleProfile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleProfile.email)}`,
                  google_id: googleProfile.sub,
                  role: customRole,
                });

                // Save to device memory
                const newAccount: SavedGoogleAccount = {
                  name: googleProfile.name || googleProfile.email.split("@")[0],
                  email: googleProfile.email,
                  avatar: googleProfile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleProfile.email)}`,
                };
                const updated = [
                  newAccount,
                  ...savedAccounts.filter((a) => a.email.toLowerCase() !== googleProfile.email.toLowerCase()),
                ].slice(0, 3);
                localStorage.setItem("renthub_saved_google_accounts", JSON.stringify(updated));
                setSavedAccounts(updated);

                handleRedirect();
              } catch (err: any) {
                setAuthError(err?.message || "Failed to complete sign in with Google.");
                setModalOpen(true);
              } finally {
                setSubmitting(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.warn("OAuth2 tokenClient error, falling back to One Tap or modal:", err);
      }
    }

    // Fallback if oauth2 client isn't ready
    if (googleClientId && g?.accounts?.id) {
      try {
        g.accounts.id.prompt();
      } catch {}
    }

    // Open modal to sign in with their Gmail
    setModalOpen(true);
  };

  const handleSaveClientId = () => {
    const trimmed = clientIdInputValue.trim();
    if (!trimmed) return;
    setGoogleClientId(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub_google_client_id", trimmed);
    }
    setShowClientIdInput(false);
  };

  return (
    <>
      <button
        type="button"
        id="login-google"
        onClick={handleButtonClick}
        disabled={isLoading || submitting}
        className={
          className ||
          "flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 font-medium text-xs transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
        }
      >
        {submitting || isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        ) : (
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
        )}
        <span>{label}</span>
      </button>

      {/* Google Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0F111A] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Sign in with Google</h3>
                <p className="text-xs text-slate-400">Choose your Google account for RentHub</p>
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="mb-4 p-1 rounded-xl bg-slate-950 border border-white/10 flex text-xs">
              <button
                type="button"
                onClick={() => setCustomRole("customer")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  customRole === "customer"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Renter (Customer)
              </button>
              <button
                type="button"
                onClick={() => setCustomRole("owner")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  customRole === "owner"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Asset Owner (Lister)
              </button>
            </div>

            {/* Native Google Button if Client ID is configured */}
            {googleClientId ? (
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Official Google Sign-In
                </div>
                <div ref={googleHiddenBtnRef} className="w-full flex justify-center py-1 min-h-[44px]" />
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Opens Google&apos;s dialog with accounts logged into this device.
                </p>
              </div>
            ) : null}

            {/* Saved / Previously Used Accounts on this device */}
            {savedAccounts.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Your Device Account</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Remembered</span>
                </div>
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={submitting}
                    onClick={() => {
                      const parts = acc.name.split(" ");
                      handlePerformAuth({
                        email: acc.email,
                        first_name: parts[0] || "User",
                        last_name: parts.slice(1).join(" ") || "Google",
                        avatar_url: acc.avatar,
                        role: customRole,
                      });
                    }}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-blue-500/40 transition-all flex items-center justify-between group text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-400">{acc.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0F111A] px-2 text-slate-500">
                  {savedAccounts.length > 0 ? "Or use another Gmail" : "Sign in with your Gmail"}
                </span>
              </div>
            </div>

            {/* Custom Google Email Input */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Enter your Gmail address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Your Full Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Washim Akram"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="button"
                disabled={!customEmail.trim() || submitting}
                onClick={() => {
                  const cleanedEmail = customEmail.trim();
                  const nameParts = (customName.trim() || cleanedEmail.split("@")[0]).split(" ");
                  handlePerformAuth({
                    email: cleanedEmail,
                    first_name: nameParts[0] || "User",
                    last_name: nameParts.slice(1).join(" ") || "",
                    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      customName.trim() || cleanedEmail
                    )}`,
                    role: customRole,
                  });
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Continue with this Google Account
                  </>
                )}
              </button>
            </div>

            {/* Google Client ID Configuration Help */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              {!showClientIdInput ? (
                <button
                  type="button"
                  onClick={() => setShowClientIdInput(true)}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {googleClientId ? "Google Client ID connected" : "Want native Google One Tap popup? Connect Google Client ID"}
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Google OAuth Client ID</span>
                    <button
                      type="button"
                      onClick={() => setShowClientIdInput(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste your Google Cloud OAuth Client ID to show your browser&apos;s native Google account picker:
                  </p>
                  <input
                    type="text"
                    placeholder="xxxxxxxx.apps.googleusercontent.com"
                    value={clientIdInputValue}
                    onChange={(e) => setClientIdInputValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-white text-[11px] outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleSaveClientId}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Save & Activate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
