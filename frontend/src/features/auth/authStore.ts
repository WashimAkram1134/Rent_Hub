/**
 * RentHub — Zustand Auth Store
 *
 * Global auth state: current user, access token, loading/error states.
 *
 * Features:
 * - Persisted to localStorage (access token only)
 * - Actions: login, logout, register, setUser, hydrate
 * - No sensitive data (password, refresh token) stored in-memory
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AuthService from "./authService";
import type { LoginCredentials, RegisterData, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activeRole: "customer" | "owner";
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  setActiveRole: (role: "customer" | "owner") => void;
  toggleActiveRole: () => void;
  clearError: () => void;
  hydrate: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ─── State ────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeRole: "customer",

      // ─── Actions ──────────────────────────────────────────────────────────

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await AuthService.login(credentials);
          localStorage.setItem("access_token", token.access_token);
          
          const isOwnerUser = user.is_owner || user.primary_role === "owner" || user.role_names?.includes("owner");
          const defaultRole = isOwnerUser ? "owner" : "customer";

          set({
            user,
            accessToken: token.access_token,
            isAuthenticated: true,
            isLoading: false,
            activeRole: defaultRole,
          });
        } catch (err: any) {
          const message = err?.response?.data?.error?.message ?? "Login failed. Please try again.";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.register(data);
          set({ isLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.error?.message ?? "Registration failed.";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
        } catch {
          // Always clear state even if API call fails
        } finally {
          if (typeof window !== "undefined") {
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch (e) {
              console.error("Failed to clear browser storage on logout", e);
            }
          }
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            activeRole: "customer",
          });
        }
      },

      refreshUser: async () => {
        try {
          const user = await AuthService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          // Token expired — clear state
          localStorage.removeItem("access_token");
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user }),

      setActiveRole: (role) => set({ activeRole: role }),

      toggleActiveRole: () => {
        const current = get().activeRole;
        const next = current === "owner" ? "customer" : "owner";
        set({ activeRole: next });
      },

      clearError: () => set({ error: null }),

      /**
       * Called on app initialization to rehydrate auth state from stored token.
       */
      hydrate: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        set({ accessToken: token, isLoading: true });
        try {
          const user = await AuthService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem("access_token");
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "renthub-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        // Persist non-sensitive state and active role preference
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
    }
  )
);
