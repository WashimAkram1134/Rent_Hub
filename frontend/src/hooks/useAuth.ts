"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/authStore";

/**
 * Reusable hook to handle basic auth interactions in components.
 */
export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, error, login, register, logout, clearError } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
