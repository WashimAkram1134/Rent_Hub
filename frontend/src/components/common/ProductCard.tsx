import { Heart, Star, MapPin } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

export interface ProductCardProps {
  id: string;
  title: string;
  image_url: string;
  badge?: string;
  avg_rating: number;
  review_count: number;
  price_per_day: number;
  location: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export function ProductCard({
  id,
  title,
  image_url,
  badge,
  avg_rating,
  review_count,
  price_per_day,
  location,
  isWishlisted: explicitIsWishlisted,
  onToggleWishlist: explicitOnToggleWishlist
}: ProductCardProps) {
  const { toggleWishlist, isWishlisted: checkIsWishlisted } = useWishlistStore();

  const isFav = explicitIsWishlisted !== undefined ? explicitIsWishlisted : checkIsWishlisted(id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (explicitOnToggleWishlist) {
      explicitOnToggleWishlist(id);
    } else {
      toggleWishlist({
        id,
        title,
        image_url,
        price_per_day,
        rating: avg_rating,
        review_count,
        location,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="relative h-36 overflow-hidden">
        <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {badge && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">⭐ {badge}</span>
        )}
        <button
          onClick={handleHeartClick}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all active:scale-90"
        >
          <Heart
            size={13}
            className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-400"}
          />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-slate-900 truncate">{title}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-700">{avg_rating}</span>
          <span className="text-[10px] text-slate-400">({review_count})</span>
        </div>
        <p className="text-[11px] font-extrabold text-blue-700 mt-1.5">৳ {price_per_day.toLocaleString()} <span className="font-normal text-slate-400">/ day</span></p>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin size={9} className="text-slate-400 shrink-0" />
          <span className="text-[9px] text-slate-400 truncate">{location}</span>
        </div>
      </div>
    </div>
  );
}
