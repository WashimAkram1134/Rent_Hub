"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Lock, ShieldAlert, X } from "lucide-react";
import apiClient from "@/lib/axios";

export default function PlatformMaintenanceBanner() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkMaintenance = () => {
      apiClient
        .get("/cms/maintenance-status")
        .then((res) => {
          if (!isMounted) return;
          if (res.data?.maintenance_mode) {
            setMaintenanceMode(true);
            setMaintenanceNotice(
              res.data.maintenance_notice ||
                "Platform is undergoing scheduled database maintenance. We will be back online shortly."
            );
          } else {
            setMaintenanceMode(false);
          }
        })
        .catch(() => {});
    };

    checkMaintenance();

    // Check periodically every 60s
    const interval = setInterval(checkMaintenance, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!maintenanceMode || dismissed) return null;

  return (
    <aside
      aria-label="Platform Maintenance Notice"
      className="relative z-[9999] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md border-b border-amber-500/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-md bg-amber-950/30 text-amber-200 shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
            <span className="font-extrabold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white shadow-xs">
              Maintenance Active
            </span>
            <span className="font-medium text-amber-50 truncate sm:overflow-visible sm:whitespace-normal">
              {maintenanceNotice}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200/90 pl-1 border-l border-white/20">
              <Lock className="w-3 h-3" />
              <span>Customer & Owner logins paused &bull; Only Admins can log in</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
