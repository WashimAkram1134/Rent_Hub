import { Plus } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  image_url: string;
  category_id?: string;
  is_active?: boolean;
  status?: string;
}

interface MyListingsProps {
  listings: Product[];
}

export function MyListingsWidget({ listings }: MyListingsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-sm font-bold text-slate-900 mb-6">My Listings</h2>
      <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {listings.map((item) => (
          <Link
            href={`/listings/${(item as any).slug || item.id}`}
            key={item.id}
            className="w-44 shrink-0 group cursor-pointer block"
          >
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-2.5 relative bg-slate-100 border border-slate-200 group-hover:border-indigo-300 transition-colors">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors" title={item.title}>
              {item.title}
            </h4>
            {item.status === "PENDING" ? (
              <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-bold text-amber-600 bg-amber-50 mt-1 inline-block border border-amber-200/60">
                Pending Review
              </span>
            ) : item.status === "REJECTED" ? (
              <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-bold text-red-600 bg-red-50 mt-1 inline-block border border-red-200/60">
                Rejected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-bold text-emerald-600 bg-emerald-50 mt-1 inline-block border border-emerald-200/60">
                Live
              </span>
            )}
          </Link>
        ))}
        <Link
          href="/products/new"
          className="w-44 shrink-0 aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30"
        >
          <Plus size={22} className="mb-1.5" />
          <span className="text-xs font-bold">Add New Listing</span>
        </Link>
      </div>
    </div>
  );
}
