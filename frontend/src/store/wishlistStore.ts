import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/axios";

export interface WishlistItem {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  price?: number;
  price_per_day?: number;
  rating?: number;
  avg_rating?: number;
  review_count?: number;
  image_url?: string;
  location?: string;
  city?: string;
}

interface WishlistState {
  items: WishlistItem[];
  wishlistIds: string[];
  toggleWishlist: (item: Partial<WishlistItem> & { id: string }) => Promise<void>;
  isWishlisted: (idOrSlug: string) => boolean;
  clearWishlist: () => void;
  /** Pull saved items from server for a logged-in user */
  syncFromServer: () => Promise<void>;
  /** Clear local state on logout — does NOT hit the server */
  clearLocal: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],

      toggleWishlist: async (item) => {
        const { items } = get();
        const itemSlug = item.slug || (item as any).slug;

        const exists = items.some(
          (i) =>
            i.id === item.id ||
            (itemSlug && i.slug === itemSlug) ||
            (itemSlug && i.id === itemSlug) ||
            (i.slug && i.slug === item.id)
        );

        if (exists) {
          const updated = items.filter(
            (i) =>
              i.id !== item.id &&
              (!itemSlug || i.slug !== itemSlug) &&
              (!itemSlug || i.id !== itemSlug) &&
              (!i.slug || i.slug !== item.id)
          );
          set({ items: updated, wishlistIds: updated.map((i) => i.id) });
        } else {
          const fullItem: WishlistItem = {
            id: item.id,
            title: item.title || "Rental Item",
            slug: itemSlug || item.id,
            category: item.category || "General",
            price: item.price || item.price_per_day || 2000,
            price_per_day: item.price_per_day || item.price || 2000,
            rating: item.rating || item.avg_rating || 0,
            avg_rating: item.avg_rating || item.rating || 0,
            review_count: item.review_count || 0,
            image_url:
              item.image_url ||
              "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80",
            location: item.location || item.city || "Dhaka",
            city: item.city || item.location || "Dhaka",
          };
          const updated = [fullItem, ...items];
          set({ items: updated, wishlistIds: updated.map((i) => i.id) });
        }

        // Fire-and-forget DB sync (best-effort, silently fail if not logged in)
        try {
          await apiClient.post(`/products/${item.id}/wishlist`);
        } catch {
          // unauthenticated or network error — local store remains optimistic source of truth
        }
      },

      isWishlisted: (idOrSlug) => {
        if (!idOrSlug) return false;
        return get().items.some(
          (i) => i.id === idOrSlug || (i.slug && i.slug === idOrSlug)
        );
      },

      clearWishlist: async () => {
        set({ items: [], wishlistIds: [] });
        try {
          await apiClient.delete("/products/wishlist/me/clear");
        } catch {
          // silently ignore
        }
      },

      syncFromServer: async () => {
        try {
          const res = await apiClient.get("/products/wishlist/me");
          const serverItems: WishlistItem[] = (res.data || []).map(
            (p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              category: p.category,
              price_per_day: p.price_per_day,
              price: p.price_per_day,
              rating: p.avg_rating,
              avg_rating: p.avg_rating,
              review_count: p.review_count,
              image_url: p.image_url,
              location: p.city,
              city: p.city,
            })
          );
          set({
            items: serverItems,
            wishlistIds: serverItems.map((i) => i.id),
          });
        } catch {
          // user not logged in or network error — keep local state
        }
      },

      clearLocal: () => set({ items: [], wishlistIds: [] }),
    }),
    {
      name: "renthub-wishlist-storage",
    }
  )
);
