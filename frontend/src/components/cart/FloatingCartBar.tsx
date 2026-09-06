"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useFlyToCart } from "@/context/FlyToCartContext";

export function FloatingCartBar() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { isCartBouncing } = useFlyToCart();

  // Hide on /cart page itself or when empty
  if (pathname === "/cart" || items.length === 0) {
    return (
      // Invisible anchor element with ID so coordinates can still be calculated if needed
      <div id="floating-cart-pill" className="fixed bottom-6 right-6 pointer-events-none w-1 h-1 opacity-0" />
    );
  }

  const latestItem = items[0];
  const totalAmount = items.reduce((acc, item) => acc + (item.price_per_day || 0) * 3, 0);

  return (
    <AnimatePresence>
      <motion.div
        id="floating-cart-pill"
        initial={{ y: 80, opacity: 0, scale: 0.85 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: isCartBouncing ? [1, 1.22, 0.92, 1.06, 1] : 1,
        }}
        exit={{ y: 80, opacity: 0, scale: 0.85 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          scale: { duration: 0.45 },
        }}
        className="fixed bottom-6 right-6 z-50 select-none"
      >
        <Link
          href="/cart"
          className="group relative flex items-center gap-3.5 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 text-white pl-2.5 pr-4 py-2.5 rounded-full shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/25 backdrop-blur-md cursor-pointer overflow-hidden"
        >
          {/* Subtle shine line animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Product Thumbnail Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center">
            {latestItem?.image_url ? (
              <img
                src={latestItem.image_url}
                alt={latestItem.title || "Cart item"}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag size={18} className="text-white" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-black tracking-wide text-white leading-tight flex items-center gap-1.5">
              View cart
            </span>
            <span className="text-[10px] font-semibold text-rose-100/90 leading-tight mt-0.5">
              {items.length} {items.length === 1 ? "Item" : "Items"}
              {totalAmount > 0 && ` • ৳ ${totalAmount.toLocaleString()}`}
            </span>
          </div>

          {/* Arrow Icon Button */}
          <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center shrink-0 text-white transition-colors">
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
