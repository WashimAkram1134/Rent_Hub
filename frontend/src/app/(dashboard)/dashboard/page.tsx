"use client";

import { useAuthStore } from "@/features/auth/authStore";
import { OwnerDashboard } from "@/features/dashboard/OwnerDashboard";
import { CustomerDashboard } from "@/features/dashboard/CustomerDashboard";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user, activeRole } = useAuthStore();
  
  if (!user) return null;

  // Admin users can toggle between Admin, Owner, and Customer views
  if (user.primary_role === "admin" && !activeRole) {
    return <AdminDashboard />;
  }

  // Active Role toggle determines the view for multi-role users
  if (activeRole === "owner") {
    return <OwnerDashboard />;
  }

  if (activeRole === "customer") {
    return <CustomerDashboard />;
  }

  // Fallback defaults
  if (user.primary_role === "owner" || user.is_owner || user.role_names?.includes("owner")) {
    return <OwnerDashboard />;
  }

  if (user.primary_role === "admin") {
    return <AdminDashboard />;
  }

  return <CustomerDashboard />;
}
