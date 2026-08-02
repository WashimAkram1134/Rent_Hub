import Link from "next/link";
import { Grid3X3 } from "lucide-react";

export interface CategoryIconProps {
  name: string;
  slug: string;
  icon_url?: string;
}

export function CategoryIcon({ name, slug, icon_url }: CategoryIconProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200">
        {icon_url ? (
          <img src={icon_url} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Grid3X3 size={22} className="text-slate-400" />
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-600 text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}
