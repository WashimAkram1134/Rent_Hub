import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Event Photographer",
      avatar: "SC",
      rating: 5,
      text: "Rented a Sony A7IV for my client shoot. The process was seamless and the camera was in perfect condition. Saved me $800 on purchasing!",
      avatarColor: "from-violet-500 to-purple-600",
    },
    {
      name: "Marcus Reid",
      role: "Product Owner",
      avatar: "MR",
      rating: 5,
      text: "My DSLR now earns ৳8,000/month when I'm not using it. RentHub's protection and payment system makes renting out completely worry-free.",
      avatarColor: "from-blue-500 to-cyan-600",
    },
    {
      name: "Aisha Rahman",
      role: "Graduate Student",
      avatar: "AR",
      rating: 5,
      text: "Borrowed a projector for my thesis presentation for just ৳500. The owner was super responsive. This platform is a game changer.",
      avatarColor: "from-emerald-500 to-green-600",
    },
  ];

  return (
    <section className="section-pad bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Community Love</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group p-8 rounded-3xl border border-border bg-card hover:border-primary/30 card-hover"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 text-sm">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
