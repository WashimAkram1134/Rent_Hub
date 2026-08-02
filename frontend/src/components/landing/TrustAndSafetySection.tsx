import { Shield, Star, Users } from "lucide-react";

export function TrustAndSafetySection() {
  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Built for Trust</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Rent with complete<br />
              <span className="text-gradient-brand">peace of mind</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Every transaction is protected. We verify identities, secure payments, and
              have your back if anything goes wrong.
            </p>
            <div className="space-y-5">
              {[
                { icon: Shield, title: "Identity Verification", desc: "All users are verified before they can rent or list." },
                { icon: Star, title: "Review System", desc: "Transparent ratings ensure accountability on both sides." },
                { icon: Users, title: "Secure Payments", desc: "Security deposits and payments are handled safely." },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">{feature.title}</div>
                      <div className="text-muted-foreground text-sm">{feature.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust visual card */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
              style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 55%))" }}
            />
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "100%", label: "Secure Payments", icon: "🔒" },
                  { value: "24/7", label: "Support", icon: "💬" },
                  { value: "৳5M+", label: "Saved by Renters", icon: "💰" },
                  { value: "4.9/5", label: "Trust Score", icon: "⭐" },
                ].map((item) => (
                  <div key={item.label} className="p-5 rounded-2xl bg-muted/50 border border-border text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-display font-bold text-xl text-foreground">{item.value}</div>
                    <div className="text-muted-foreground text-xs mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
