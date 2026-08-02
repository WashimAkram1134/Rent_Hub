import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABannerSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, hsl(220, 92%, 13%) 0%, hsl(240, 70%, 22%) 100%)" }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -right-40 -top-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: "radial-gradient(circle, hsl(200, 80%, 70%), transparent 70%)" }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
          Ready to start renting?
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Join thousands of Bangladeshis already renting and earning on RentHub.
          It&apos;s free to sign up.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            id="cta-rent-now"
            href="/register"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-white text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            id="cta-learn-more"
            href="/about"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
