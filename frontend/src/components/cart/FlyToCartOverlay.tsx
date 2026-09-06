"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/context/FlyToCartContext";

export function FlyToCartOverlay() {
  const { flyItems } = useFlyToCart();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {flyItems.map((item) => {
          const deltaX = item.targetX - item.startX;
          const arcY = Math.min(item.startY, item.targetY) - 100;
          const midX = item.startX + deltaX * 0.45;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX - 32,
                y: item.startY - 32,
                scale: 1,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: [item.startX - 32, midX, item.targetX - 16],
                y: [item.startY - 32, arcY, item.targetY - 16],
                scale: [1, 1.2, 0.6, 0.2],
                rotate: [0, -14, 8, 0],
                opacity: [1, 1, 0.95, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1], // Custom smooth cubic-bezier swoop
                times: [0, 0.4, 0.85, 1],
              }}
              className="absolute top-0 left-0 w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-600/40 border-2 border-white bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
            >
              <img
                src={item.image}
                alt="Added item"
                className="w-full h-full object-cover rounded-xl"
              />
              {/* Soft glow particle */}
              <div className="absolute inset-0 bg-indigo-500/15 rounded-xl animate-pulse" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
