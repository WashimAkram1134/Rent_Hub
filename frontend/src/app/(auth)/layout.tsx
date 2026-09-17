import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#07070F] text-slate-100 selection:bg-blue-500 selection:text-white">

      {/* ── Left Panel — Photo Showcase (Desktop only) ───────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[44%] relative overflow-hidden flex-col">

        {/* Full-bleed background photo */}
        <Image
          src="/login-bg.jpg"
          alt="RentHub — rent anything"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark gradient overlay — heavy at top & bottom, lighter in middle */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,7,20,0.82) 0%, rgba(7,7,20,0.30) 40%, rgba(7,7,20,0.40) 60%, rgba(7,7,20,0.90) 100%)",
          }}
        />

        {/* ── Content (all above overlay) ── */}
        <div className="relative z-20 flex flex-col h-full p-10 xl:p-12">

          {/* TOP: Logo + back button */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
              >
                {/* Home icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Rent<span className="text-blue-400">Hub</span>
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-200 bg-black/30 hover:bg-black/50 border border-white/10 transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              Back to Home
            </Link>
          </div>

          {/* MIDDLE: Headline + description + categories */}
          <div className="mt-auto mb-auto py-16">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-semibold mb-5 backdrop-blur-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-300">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              Peer-to-Peer Rental Marketplace
            </div>

            {/* Big headline */}
            <h2 className="font-black text-4xl xl:text-5xl text-white leading-[1.1] tracking-tight mb-5">
              Rent anything.<br />
              <span className="text-blue-400">Monetize</span> everything.
            </h2>

            {/* Sub-description */}
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-8">
              From vehicles to electronics, apartments to cameras — RentHub connects people, items and opportunities.
            </p>

            {/* Category icon row */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                {
                  label: "Vehicles",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="8" width="22" height="10" rx="2" />
                      <path d="M5 8l3-5h8l3 5" />
                      <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                    </svg>
                  ),
                },
                {
                  label: "Cameras",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  ),
                },
                {
                  label: "Electronics",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  ),
                },
                {
                  label: "Apartments",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                },
                {
                  label: "More",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="5" cy="12" r="1" fill="currentColor" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                      <circle cx="19" cy="12" r="1" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm hover:bg-white/15 transition-all cursor-default min-w-[58px]"
                >
                  <span className="text-white/90">{icon}</span>
                  <span className="text-[10px] text-white/70 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM: Cursive tagline */}
          <div className="mt-auto">
            <p
              className="text-white/70 text-xl leading-tight"
              style={{ fontFamily: "var(--font-dancing), 'Brush Script MT', cursive" }}
            >
              Your next<br />
              <span className="text-white">rental is here →</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen relative p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-15 blur-[120px]"
            style={{ background: "radial-gradient(circle, #3B82F6, #8B5CF6, transparent 70%)" }}
          />
          <div
            className="absolute bottom-10 left-10 w-[350px] h-[350px] rounded-full opacity-10 blur-[100px]"
            style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }}
          />
        </div>

        {/* Mobile Logo Header */}
        <div className="lg:hidden flex items-center justify-between w-full max-w-md mx-auto mb-6 z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="font-black text-xl text-white">
              Rent<span className="text-blue-400">Hub</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        {/* Auth Form Content */}
        <div className="w-full max-w-md mx-auto my-auto z-10 relative">
          {children}
        </div>

        {/* Bottom SSL note */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 pt-6 pb-2 z-10">
          <span>Protected by RentHub 256-Bit SSL Security &amp; Fraud Shield.</span>
        </div>
      </div>
    </div>
  );
}
