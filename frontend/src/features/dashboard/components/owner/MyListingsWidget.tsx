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
      <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {listings.map((item) => (
          <div key={item.id} className="min-w-[140px] group cursor-pointer">
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-slate-100 border border-slate-200">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
              )}
            </div>
            <h4 className="text-[11px] font-bold text-slate-900 truncate">{item.title}</h4>
            {item.status === "PENDING" ? (
              <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-bold text-amber-600 bg-amber-50 mt-1 inline-block">
                Pending Review
              </span>
            ) : item.status === "REJECTED" ? (
              <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-bold text-red-600 bg-red-50 mt-1 inline-block">
                Rejected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-bold text-emerald-600 bg-emerald-50 mt-1 inline-block">
                Live
              </span>
            )}
          </div>
        ))}
        <Link href="/products/new" className="min-w-[140px] aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer mb-[22px]">
          <Plus size={24} className="mb-2" />
          <span className="text-xs font-bold">Add New Listing</span>
        </Link>
      </div>
    </div>
  );
}
