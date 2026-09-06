import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  title: string;
  category?: string;
  price?: number;
  price_per_day?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  location?: string;
  city?: string;
}

interface WishlistState {
  items: WishlistItem[];
  wishlistIds: string[];
  toggleWishlist: (item: Partial<WishlistItem> & { id: string }) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],
      toggleWishlist: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.id === item.id);
        if (exists) {
          const updated = items.filter((i) => i.id !== item.id);
          set({ items: updated, wishlistIds: updated.map((i) => i.id) });
        } else {
          const fullItem: WishlistItem = {
            id: item.id,
            title: item.title || "Rental Item",
            category: item.category || "General",
            price: item.price || item.price_per_day || 2000,
            price_per_day: item.price_per_day || item.price || 2000,
            rating: item.rating || 4.8,
            review_count: item.review_count || 12,
            image_url: item.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80",
            location: item.location || item.city || "Dhaka",
          };
          const updated = [fullItem, ...items];
          set({ items: updated, wishlistIds: updated.map((i) => i.id) });
        }
      },
      isWishlisted: (id) => get().items.some((i) => i.id === id),
      clearWishlist: () => set({ items: [], wishlistIds: [] }),
    }),
    {
      name: "renthub-wishlist-storage",
    }
  )
);
