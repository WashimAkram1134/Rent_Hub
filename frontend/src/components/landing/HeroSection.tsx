import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(220, 92%, 10%) 0%, hsl(225, 80%, 18%) 45%, hsl(240, 70%, 24%) 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: "radial-gradient(circle, hsl(220, 80%, 60%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-float"
          style={{ animationDelay: "1.5s", background: "radial-gradient(circle, hsl(260, 80%, 60%), transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(200, 80%, 70%), transparent 70%)" }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 text-sm font-medium">Bangladesh&apos;s #1 Rental Marketplace</span>
        </div>

        {/* Heading */}
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fade-in">
          Rent Anything,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(200, 90%, 70%), hsl(250, 80%, 80%))" }}
          >
            Anytime
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Connect with local owners. Rent cameras, laptops, bikes, furniture, and more.
          Or earn money renting out what you already own.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                id="hero-search"
                type="text"
                placeholder="What do you want to rent?"
                className="w-full outline-none text-gray-900 placeholder-gray-400 bg-transparent text-sm sm:text-base"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-200">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Dhaka</span>
            </div>
            <Link
              href="/search"
              id="hero-search-btn"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Popular tags */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {["Camera", "Laptop", "Bike", "Projector", "Tent", "Guitar"].map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${tag.toLowerCase()}`}
              className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in">
          <Link
            id="hero-browse-btn"
            href="/search"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
          >
            Browse Listings
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            id="hero-list-btn"
            href="/register?role=owner"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          >
            Start Earning
          </Link>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 fill-background">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
