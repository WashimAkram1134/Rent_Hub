/**
 * RentHub — Global Page Transition Store
 *
 * Controls the full-screen animated loading overlay that persists across
 * route changes. Used for the login → dashboard transition:
 *
 * 1. Login success  → set showLoader(true) + navigate immediately
 * 2. Dashboard mounts → fetches data
 * 3. Data ready     → set showLoader(false) → overlay fades out
 *
 * The overlay lives in the root layout so it is NEVER destroyed during
 * Next.js client-side navigation (no flash of login page between routes).
 */

"use client";

import { create } from "zustand";

interface TransitionState {
  isLoading: boolean;
  /** Show the full-screen loading overlay */
  showLoader: () => void;
  /** Hide the full-screen loading overlay */
  hideLoader: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isLoading: false,
  showLoader: () => set({ isLoading: true }),
  hideLoader: () => set({ isLoading: false }),
}));
