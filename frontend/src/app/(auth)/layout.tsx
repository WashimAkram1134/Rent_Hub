import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Star, Zap, CheckCircle2, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#07070F] text-slate-100 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* ── Left Panel — Luxury Showcase (Desktop) ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[44%] flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.08]"
        style={{
          background: "radial-gradient(circle at top left, #0D1127 0%, #080A16 50%, #05060D 100%)",
        }}
      >
        {/* Animated Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full opacity-30 blur-[100px] animate-pulse"
            style={{ background: "radial-gradient(circle, #3B82F6, #6366F1, transparent 70%)" }}
          />
          <div
            className="absolute bottom-10 right-0 w-[420px] h-[420px] rounded-full opacity-20 blur-[110px]"
            style={{ background: "radial-gradient(circle, #8B5CF6, #EC4899, transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full opacity-15 blur-[90px]"
            style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }}
          />
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Top: Logo & Back to Home */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-transform duration-300 group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <span className="text-white font-black text-lg tracking-tight">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-white group-hover:text-blue-200 transition-colors">
                Rent<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400/80 -mt-1">
                Premier Marketplace
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.2] transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            Back to Home
          </Link>
        </div>

        {/* Middle: Feature Highlights & Live Activity Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Bangladesh&apos;s #1 Verified Rental Platform
          </div>

          <h2 className="font-display font-black text-4xl xl:text-5xl text-white leading-[1.15] mb-5 tracking-tight">
            Rent anything.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Monetize everything.
            </span>
          </h2>

          <p className="text-slate-300 text-base leading-relaxed max-w-md mb-8">
            Access high-end cameras, luxury vehicles, drones, tech gear and designer apparel safely with escrow payment protection.
          </p>

          {/* Floating Glassmorphic Live Rental Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-2xl relative overflow-hidden mb-8 group hover:border-white/[0.2] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Booking Verified</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                4.95 (1.4k+ reviews)
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Range Rover Velar 360° View</div>
                <div className="text-xs text-slate-400">Rented in Gulshan-2, Dhaka • ৳12,000/day</div>
              </div>
            </div>
          </div>

          {/* Key Value Badges */}
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { icon: ShieldCheck, title: "100% NID Verified", desc: "Trusted members only", color: "text-emerald-400" },
              { icon: Zap, title: "Escrow Protection", desc: "Safe money release", color: "text-blue-400" },
              { icon: CheckCircle2, title: "10,000+ Items", desc: "Instant availability", color: "text-violet-400" },
              { icon: Star, title: "4.9★ Community", desc: "Rated by 50k+ renters", color: "text-amber-400" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex items-start gap-3"
                >
                  <Icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                  <div>
                    <div className="font-semibold text-xs text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-6">
          <span>© {new Date().getFullYear()} RentHub Bangladesh.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/support" className="hover:text-slate-200 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Dynamic Form Center ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen relative p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Background ambient lighting for right side */}
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

        {/* Mobile Header with Logo */}
        <div className="lg:hidden flex items-center justify-between w-full max-w-md mx-auto mb-6 z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="font-display font-bold text-xl text-white">
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

        {/* Center Auth Card Content */}
        <div className="w-full max-w-md mx-auto my-auto z-10 relative">
          {children}
        </div>

        {/* Mobile / Subtle Bottom Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 pt-6 pb-2 z-10">
          <span>Protected by RentHub 256-Bit SSL Security & Fraud Shield.</span>
        </div>
      </div>
    </div>
  );
}
