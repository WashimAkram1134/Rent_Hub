"use client";

import { useAuthStore } from "@/features/auth/authStore";
import { OwnerDashboard } from "@/features/dashboard/OwnerDashboard";
import { CustomerDashboard } from "@/features/dashboard/CustomerDashboard";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user, activeRole } = useAuthStore();
  
  if (!user) return null;

  // 1. Admin users should always see the Admin Dashboard
  if (user.primary_role === "admin" || user.role_names?.includes("admin")) {
    return <AdminDashboard />;
  }

  // 2. Active Role toggle determines the view for multi-role users (Owner vs Customer)
  if (activeRole === "owner") {
    return <OwnerDashboard />;
  }

  if (activeRole === "customer") {
    return <CustomerDashboard />;
  }

  // 3. Fallback defaults
  if (user.primary_role === "owner" || user.is_owner || user.role_names?.includes("owner")) {
    return <OwnerDashboard />;
  }

  return <CustomerDashboard />;
}
