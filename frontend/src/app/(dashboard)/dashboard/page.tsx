"use client";

import { useAuthStore } from "@/features/auth/authStore";
import { OwnerDashboard } from "@/features/dashboard/OwnerDashboard";
import { CustomerDashboard } from "@/features/dashboard/CustomerDashboard";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  if (!user) return null;

  if (user.primary_role === "customer") {
    return <CustomerDashboard />;
  }

  if (user.primary_role === "admin") {
    return <AdminDashboard />;
  }

  // Fallback to Owner Dashboard for "lister", "admin", or undefined
  return <OwnerDashboard />;
}
