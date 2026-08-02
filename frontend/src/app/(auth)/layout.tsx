import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(220, 92%, 10%) 0%, hsl(225, 80%, 18%) 50%, hsl(240, 70%, 24%) 100%)",
        }}
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-float"
            style={{ background: "radial-gradient(circle, hsl(220,80%,60%), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl animate-float"
            style={{ animationDelay: "1.5s", background: "radial-gradient(circle, hsl(260,80%,60%), transparent 70%)" }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 60%))" }}
          >
            <span className="text-white font-black text-base">R</span>
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Rent<span className="text-blue-400">Hub</span>
          </span>
        </Link>

        {/* Middle content */}
        <div className="relative z-10">
          <h2 className="font-display font-black text-4xl xl:text-5xl text-white leading-tight mb-6">
            Rent anything.<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(200,90%,70%), hsl(250,80%,80%))" }}
            >
              Earn from everything.
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-xs">
            Join thousands of Bangladeshis already renting and earning on the most trusted rental marketplace.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: "10K+", label: "Active Listings" },
              { value: "5K+", label: "Happy Users" },
              { value: "4.9★", label: "Average Rating" },
              { value: "100%", label: "Secure Payments" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="font-display font-black text-2xl text-white">{stat.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} RentHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 60%))" }}
            >
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="font-display font-bold text-xl">
              Rent<span className="text-primary">Hub</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
