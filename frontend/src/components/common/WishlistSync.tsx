"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Global Wishlist Sync component.
 * Ensures the user's saved wishlist in the database is automatically
 * fetched into the client Zustand store on initial load and whenever
 * the user logs in.
 */
export function WishlistSync() {
  const { isAuthenticated, user } = useAuthStore();
  const { syncFromServer } = useWishlistStore();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (syncedUserIdRef.current !== user.id) {
        syncedUserIdRef.current = user.id;
        syncFromServer();
      }
    } else {
      syncedUserIdRef.current = null;
    }
  }, [isAuthenticated, user?.id, syncFromServer]);

  return null;
}
