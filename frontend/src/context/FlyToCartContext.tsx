"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useCartStore, CartItem } from "@/store/cartStore";

interface FlyItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startWidth: number;
  startHeight: number;
}

interface FlyToCartContextType {
  triggerFlyToCart: (options: {
    image: string;
    startElement?: HTMLElement | null;
    startRect?: DOMRect | { x: number; y: number; width: number; height: number };
    item?: CartItem;
  }) => void;
  flyItems: FlyItem[];
  isCartBouncing: boolean;
}

const FlyToCartContext = createContext<FlyToCartContextType>({
  triggerFlyToCart: () => {},
  flyItems: [],
  isCartBouncing: false,
});

export const useFlyToCart = () => useContext(FlyToCartContext);

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const triggerFlyToCart = useCallback(
    ({
      image,
      startElement,
      startRect: explicitRect,
      item,
    }: {
      image: string;
      startElement?: HTMLElement | null;
      startRect?: DOMRect | { x: number; y: number; width: number; height: number };
      item?: CartItem;
    }) => {
      // Calculate start coordinate
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      let startWidth = 80;
      let startHeight = 80;

      if (startElement) {
        const rect = startElement.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        startWidth = Math.min(rect.width, 100);
        startHeight = Math.min(rect.height, 100);
      } else if (explicitRect) {
        startX = explicitRect.x + explicitRect.width / 2;
        startY = explicitRect.y + explicitRect.height / 2;
        startWidth = Math.min(explicitRect.width, 100);
        startHeight = Math.min(explicitRect.height, 100);
      }

      // Calculate target coordinate (Floating pill or header cart icon or bottom-right default)
      const targetPill = document.getElementById("floating-cart-pill");
      const headerCart = document.getElementById("header-cart-icon");

      let targetX = window.innerWidth - 120;
      let targetY = window.innerHeight - 60;

      if (targetPill) {
        const targetRect = targetPill.getBoundingClientRect();
        targetX = targetRect.left + targetRect.width / 2;
        targetY = targetRect.top + targetRect.height / 2;
      } else if (headerCart) {
        const targetRect = headerCart.getBoundingClientRect();
        targetX = targetRect.left + targetRect.width / 2;
        targetY = targetRect.top + targetRect.height / 2;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newFlyItem: FlyItem = {
        id,
        image: image || "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=300&q=80",
        startX,
        startY,
        targetX,
        targetY,
        startWidth,
        startHeight,
      };

      setFlyItems((prev) => [...prev, newFlyItem]);

      // Add item to cart store
      if (item) {
        addItem(item);
      }

      // Trigger landing bounce at 600ms
      setTimeout(() => {
        setIsCartBouncing(true);
        setTimeout(() => setIsCartBouncing(false), 500);
      }, 550);

      // Remove item from state after animation completes
      setTimeout(() => {
        setFlyItems((prev) => prev.filter((it) => it.id !== id));
      }, 750);
    },
    [addItem]
  );

  return (
    <FlyToCartContext.Provider value={{ triggerFlyToCart, flyItems, isCartBouncing }}>
      {children}
    </FlyToCartContext.Provider>
  );
}
