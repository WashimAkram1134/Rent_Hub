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

const DEFAULT_WISHLIST: WishlistItem[] = [
  {
    id: "wish-1",
    title: "Canon EOS R6 Camera",
    category: "Cameras",
    price: 2000,
    price_per_day: 2000,
    rating: 4.9,
    review_count: 32,
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
    location: "Banani, Dhaka",
  },
  {
    id: "wish-2",
    title: "MacBook Pro M3 16\"",
    category: "Electronics",
    price: 2000,
    price_per_day: 2000,
    rating: 4.8,
    review_count: 28,
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
    location: "Mirpur, Dhaka",
  },
  {
    id: "wish-3",
    title: "Sony FX3 Cinema Line",
    category: "Cameras",
    price: 3500,
    price_per_day: 3500,
    rating: 5.0,
    review_count: 14,
    image_url: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=500&q=80",
    location: "Gulshan, Dhaka",
  },
  {
    id: "wish-4",
    title: "Ergonomic Office Chair",
    category: "Furniture",
    price: 800,
    price_per_day: 800,
    rating: 4.7,
    review_count: 19,
    image_url: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=500&q=80",
    location: "Dhanmondi, Dhaka",
  },
];

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_WISHLIST,
      wishlistIds: DEFAULT_WISHLIST.map((i) => i.id),
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
