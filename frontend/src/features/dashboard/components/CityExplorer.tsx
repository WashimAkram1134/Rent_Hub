import Link from "next/link";

export interface City {
  id: string;
  name: string;
  image_url: string;
  listing_count: number;
}

export function CityExplorer({ cities }: { cities: City[] }) {
  if (!cities || cities.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Explore Bangladesh</h2>
        <Link href="/cities" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {cities.map((city, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden h-[90px] group cursor-pointer">
            <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-bold leading-tight">{city.name}</p>
              <p className="text-white/70 text-[9px]">{city.listing_count}+ Listings</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
