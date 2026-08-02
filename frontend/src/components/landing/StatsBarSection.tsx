export function StatsBarSection() {
  const stats = [
    { value: "10K+", label: "Active Listings" },
    { value: "5K+", label: "Happy Renters" },
    { value: "2K+", label: "Verified Owners" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <section className="py-10 bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-3xl lg:text-4xl text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
