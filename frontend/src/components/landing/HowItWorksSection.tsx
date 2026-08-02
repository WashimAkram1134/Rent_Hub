import { Search, Zap, CheckCircle } from "lucide-react";

export function HowItWorksSection() {
  const howItWorks = [
    {
      step: "01",
      title: "Find What You Need",
      description: "Search thousands of listings across categories. Filter by location, price, and availability.",
      icon: Search,
      color: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    {
      step: "02",
      title: "Book Instantly",
      description: "Choose your rental dates, select delivery or pickup, and send a booking request in seconds.",
      icon: Zap,
      color: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    {
      step: "03",
      title: "Enjoy & Return",
      description: "Receive your item, use it for the rental period, and return it when done. It's that simple.",
      icon: CheckCircle,
      color: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
  ];

  return (
    <section
      className="section-pad relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(220, 50%, 4%) 0%, hsl(225, 45%, 7%) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10 blur-3xl"
          style={{ background: "radial-gradient(ellipse, hsl(220, 80%, 60%), transparent 70%)" }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How RentHub Works
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Renting has never been easier. Get started in under 3 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-xl ${step.glow}`}>
                  <Icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className="absolute top-6 right-6 font-display font-black text-5xl text-white/5 select-none">
                  {step.step}
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
