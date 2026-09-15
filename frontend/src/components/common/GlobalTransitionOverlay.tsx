"use client";

import { useTransitionStore } from "@/store/transitionStore";
import LoginLoadingScreen from "@/components/auth/LoginLoadingScreen";

/**
 * GlobalTransitionOverlay
 *
 * Rendered in the ROOT layout so it survives Next.js client-side route
 * changes. When `transitionStore.isLoading` is true the full-screen
 * animation is shown; the dashboard (or any target page) calls
 * `hideLoader()` once its data is ready.
 *
 * The `onComplete` prop of LoginLoadingScreen is used as a safety valve:
 * if the dashboard never calls hideLoader within 6 seconds, the overlay
 * self-dismisses so the user is never stuck.
 */
export default function GlobalTransitionOverlay() {
  const { isLoading, hideLoader } = useTransitionStore();

  if (!isLoading) return null;

  return (
    <LoginLoadingScreen
      onComplete={hideLoader}
      // Safety timeout: auto-dismiss after 6s in case the destination page
      // never calls hideLoader (e.g. error during data fetch)
      delay={6000}
    />
  );
}
