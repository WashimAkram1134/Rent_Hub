"use client";

import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

interface AppShellProps {
  children: React.ReactNode;
  /** pass false to hide header (e.g. the main dashboard already embeds one) */
  showHeader?: boolean;
}

/**
 * AppShell — the ONE place that defines how sidebar + topbar are positioned.
 * Import this in every authenticated page that needs the shared chrome.
 *
 *  ┌──────────────────────────────────────────────┐
 *  │  Sidebar (220px, white, fixed height)        │
 *  │  ┌────────────────────────────────────────┐  │
 *  │  │  TopBar (76px, white, sticky)          │  │
 *  │  ├────────────────────────────────────────┤  │
 *  │  │  {children} — scrollable page body     │  │
 *  │  └────────────────────────────────────────┘  │
 *  └──────────────────────────────────────────────┘
 */
export default function AppShell({
  children,
  showHeader = true,
  sidebarFilter,
  defaultSidebarMode = "filter",
}: AppShellProps) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Global Sidebar (Menu or Filters) ─────────────────────────── */}
      <DashboardSidebar filterContent={sidebarFilter} defaultMode={defaultSidebarMode} />

      {/* ── Right Column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Global TopBar ──────────────────────────────────────── */}
        {showHeader && <DashboardHeader />}

        {/* ── Scrollable page body ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>

      </div>
    </div>
  );
}
