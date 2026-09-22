"use client";

import { useEffect } from "react";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Footer from "@/components/common/Footer";

interface AppShellProps {
  children: React.ReactNode;
  /** pass false to hide header (e.g. the main dashboard already embeds one) */
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarFilter?: React.ReactNode;
  defaultSidebarMode?: "filter" | "nav";
}

/**
 * AppShell — the ONE place that defines how sidebar + topbar + footer are positioned.
 * Import this in every authenticated page that needs the shared chrome.
 */
export default function AppShell({
  children,
  showHeader = true,
  showFooter = true,
  sidebarFilter,
  defaultSidebarMode = "filter",
}: AppShellProps) {
  useEffect(() => {
    const syncTheme = () => {
      try {
        const theme = localStorage.getItem("renthub_theme") || "light";
        const isDark =
          theme === "dark" ||
          (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        if (localStorage.getItem("renthub_compact") === "true") {
          document.documentElement.classList.add("compact-density");
        } else {
          document.documentElement.classList.remove("compact-density");
        }
      } catch (e) {}
    };

    syncTheme();
    window.addEventListener("themeChanged", syncTheme);
    window.addEventListener("storage", syncTheme);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", syncTheme);

    return () => {
      window.removeEventListener("themeChanged", syncTheme);
      window.removeEventListener("storage", syncTheme);
      mql.removeEventListener("change", syncTheme);
    };
  }, []);

  return (
    <div
      className="flex h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Global Sidebar (Menu or Filters) ─────────────────────────── */}
      <DashboardSidebar filterContent={sidebarFilter} defaultMode={defaultSidebarMode} />

      {/* ── Right Column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Global TopBar ──────────────────────────────────────── */}
        {showHeader && <DashboardHeader />}

        {/* ── Scrollable page body ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0b0f19] flex flex-col justify-between">
          <div className="flex-1">{children}</div>
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
