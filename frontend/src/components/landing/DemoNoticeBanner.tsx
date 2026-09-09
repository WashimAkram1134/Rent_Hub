"use client";

import { useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

export function DemoNoticeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="relative z-50 w-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-500/40 backdrop-blur-md px-3 sm:px-6 py-2.5 text-amber-200 text-xs sm:text-sm font-medium transition-all"
    >
      <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pulsing indicator flag badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            Demo Mode
          </span>

          <span className="flex items-center gap-1.5 text-amber-100/90 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 hidden sm:inline" />
            <span>
              All listings, metrics, activity, and prices on this landing page are simulated for demonstration purposes.
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline-block text-[11px] text-amber-300/70 border border-amber-500/30 px-2 py-0.5 rounded bg-black/20">
            Showcase Preview
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-300/80 hover:text-amber-100 transition-colors"
            title="Dismiss notice"
            aria-label="Dismiss demo notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoCornerBadge() {
  return (
    <aside
      aria-label="Demo Mode Indicator"
      className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d0d16]/95 border border-amber-500/40 shadow-xl shadow-black/60 backdrop-blur-md text-xs text-amber-200"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span className="font-semibold text-amber-300">Demo Environment</span>
      <span className="text-white/40">•</span>
      <span className="text-white/70 text-[11px]">Mock Data</span>
    </aside>
  );
}
