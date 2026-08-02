"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/authStore";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login?reason=unauthenticated");
      } else if (allowedRoles && user && !allowedRoles.includes(user.primary_role)) {
        router.replace("/dashboard?reason=unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  // Double check condition so we don't flash content before redirecting
  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.primary_role)) return null;

  return <>{children}</>;
}
