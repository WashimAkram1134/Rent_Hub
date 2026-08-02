import Link from "next/link";

export interface Deal {
  id?: string;
  title: string;
  subtitle: string;
  discount: string;
  image_url: string;
  bg: string;
  border: string;
  badgeBg: string;
  textColor: string;
  subColor: string;
  btnBg: string;
}

export function DealsWidget({ deals }: { deals: Deal[] }) {
  if (!deals || deals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-slate-900">Deals of the Week</h3>
        <Link href="/offers" className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">View all</Link>
      </div>
      <div className="space-y-2.5">
        {deals.map((deal, i) => (
          <div key={i} className={`relative ${deal.bg} border ${deal.border} rounded-xl p-3 overflow-hidden flex gap-3 items-center`}>
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full mb-1.5 ${deal.badgeBg}`}>
                {deal.discount}
              </span>
              <p className={`text-xs font-bold ${deal.textColor} leading-tight`}>{deal.title}</p>
              <p className={`text-[10px] ${deal.subColor} mt-0.5`}>{deal.subtitle}</p>
              <Link href="/offers" className={`inline-block mt-2 text-white text-[9px] font-bold px-3 py-1 rounded-lg ${deal.btnBg} hover:opacity-90 transition-opacity`}>
                Grab Now
              </Link>
            </div>
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
