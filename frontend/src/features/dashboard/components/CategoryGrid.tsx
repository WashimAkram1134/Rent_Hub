import { CategoryIcon, type CategoryIconProps } from "@/components/common/CategoryIcon";

export function CategoryGrid({ categories }: { categories: CategoryIconProps[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="h-4 w-36 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="w-10 h-3 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Browse by Categories</h2>
      <div className="grid grid-cols-8 gap-2">
        {categories.map((cat, i) => (
          <CategoryIcon key={i} {...cat} />
        ))}
      </div>
    </div>
  );
}
