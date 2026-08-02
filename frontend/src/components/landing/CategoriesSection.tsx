import Link from "next/link";
import { Camera, Laptop, Bike, Package, Projector, BookOpen } from "lucide-react";

export function CategoriesSection() {
  const categories = [
    { name: "Cameras", icon: Camera, count: "240+", color: "from-violet-500 to-purple-600", bg: "from-violet-500/10 to-purple-600/10" },
    { name: "Electronics", icon: Laptop, count: "180+", color: "from-blue-500 to-cyan-600", bg: "from-blue-500/10 to-cyan-600/10" },
    { name: "Bikes & Sports", icon: Bike, count: "320+", color: "from-green-500 to-emerald-600", bg: "from-green-500/10 to-emerald-600/10" },
    { name: "Furniture", icon: Package, count: "150+", color: "from-orange-500 to-amber-600", bg: "from-orange-500/10 to-amber-600/10" },
    { name: "Projectors", icon: Projector, count: "90+", color: "from-red-500 to-rose-600", bg: "from-red-500/10 to-rose-600/10" },
    { name: "Books", icon: BookOpen, count: "500+", color: "from-pink-500 to-fuchsia-600", bg: "from-pink-500/10 to-fuchsia-600/10" },
  ];

  return (
    <section className="section-pad">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Browse by Category</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Find What You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From professional equipment to everyday items — rent it locally.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/search?category=${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                id={`category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-card hover:border-primary/30 card-hover cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="relative font-semibold text-sm text-foreground text-center leading-tight mb-1">
                  {cat.name}
                </span>
                <span className="relative text-xs text-muted-foreground">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
