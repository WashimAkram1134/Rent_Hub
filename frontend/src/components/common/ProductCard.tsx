"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Star, MapPin, Tag, Plus, Check } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useFlyToCart } from "@/context/FlyToCartContext";
import { useAuthStore } from "@/features/auth/authStore";

export interface ProductCardProps {
  id: string;
  slug?: string;
  title: string;
  image_url: string;
  badge?: string;
  category?: string;
  avg_rating: number;
  review_count: number;
  price_per_day: number;
  discount_percentage?: number;
  offer_title?: string;
  location: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export function ProductCard({
  id,
  slug,
  title,
  image_url,
  badge,
  category,
  avg_rating,
  review_count,
  price_per_day,
  discount_percentage = 0,
  offer_title,
  location,
  isWishlisted: explicitIsWishlisted,
  onToggleWishlist: explicitOnToggleWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  const imgRef = useRef<HTMLImageElement>(null);
  const { toggleWishlist, isWishlisted: checkIsWishlisted } = useWishlistStore();
  const { isInCart } = useCartStore();
  const { triggerFlyToCart } = useFlyToCart();
  const [justAdded, setJustAdded] = useState(false);

  const isFav = explicitIsWishlisted !== undefined ? explicitIsWishlisted : checkIsWishlisted(id);
  const targetUrl = `/products/${slug || id}`;
  const alreadyInCart = isInCart(id) || justAdded;

  const hasOffer = discount_percentage > 0;
  const discountedPrice = hasOffer
    ? Math.round(price_per_day * (1 - discount_percentage / 100))
    : price_per_day;

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
        price_per_day: discountedPrice,
        rating: avg_rating,
        review_count,
        location,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Require authentication to add items to cart
    if (!isAuthenticated || !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // Trigger fly animation
    triggerFlyToCart({

      image: image_url,
      startElement: imgRef.current || (e.currentTarget as HTMLElement),
      item: {
        id,
        title,
        slug: slug || id,
        category: category || "General",
        price_per_day: discountedPrice,
        image_url,
        owner_id: "owner-id",
        owner_name: "Verified Owner",
      },
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  return (
    <Link
      href={targetUrl}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100 shrink-0">
        <img
          ref={imgRef}
          src={image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge / Feature Badge */}
        {hasOffer ? (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-0.5">
            <Tag size={9} /> -{discount_percentage}% OFF
          </span>
        ) : badge ? (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
            ⭐ {badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleHeartClick}
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all active:scale-90"
        >
          <Heart
            size={13}
            className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-400"}
          />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          {category && (
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-rose-500 block mb-0.5">
              {category}
            </span>
          )}
          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {title}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-700">{avg_rating}</span>
            <span className="text-[10px] text-slate-400">({review_count})</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-1.5">
          {/* Price & Offer */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <p className="text-xs font-black text-slate-900 leading-tight">
                ৳ {discountedPrice.toLocaleString()}
              </p>
              {hasOffer && (
                <span className="text-[9px] text-slate-400 line-through">
                  ৳ {price_per_day.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium text-slate-400">/ day</span>
          </div>

          {/* Add to Cart button matching reference design */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all duration-300 active:scale-90 shrink-0 shadow-sm ${
              alreadyInCart
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25"
                : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80"
            }`}
          >
            {alreadyInCart ? (
              <>
                <Check size={12} className="stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={12} className="stroke-[2.5]" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
