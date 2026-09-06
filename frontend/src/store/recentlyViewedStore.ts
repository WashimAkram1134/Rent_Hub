import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface RecentlyViewedItem {
  id: string;
  title: string;
  name?: string;
  slug: string;
  image: string;
  image_url?: string;
  category?: string;
  category_name?: string;
  price_per_day?: number;
  discount_percentage?: number;
  viewed_at?: string | null;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  recordView: (product: any) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = "renthub_recently_viewed";

const getLocalItems = (): RecentlyViewedItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalItems = (items: RecentlyViewedItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch (e) {
    console.error("Failed to save recently viewed to localStorage", e);
  }
};

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    try {
      // 1. Try fetching from backend if user is authenticated
      const res = await apiClient.get("/users/me/recently-viewed?limit=8");
      if (Array.isArray(res.data) && res.data.length > 0) {
        set({ items: res.data, loading: false });
        saveLocalItems(res.data);
        return;
      }
    } catch {
      // Guest or offline: read from localStorage
    }

    const local = getLocalItems();
    set({ items: local, loading: false });
  },

  recordView: async (product: any) => {
    if (!product || !product.id) return;

    const img = product.image_url || product.image || (product.images && product.images[0]?.url) || "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=300&q=80";

    const newItem: RecentlyViewedItem = {
      id: String(product.id),
      title: product.title || product.name || "Item",
      name: product.name || product.title || "Item",
      slug: product.slug || String(product.id),
      image: img,
      image_url: img,
      category: product.category?.name || product.category || "General",
      category_name: product.category?.name || product.category || "General",
      price_per_day: Number(product.price_per_day) || 0,
      discount_percentage: product.discount_percentage || 0,
      viewed_at: new Date().toISOString(),
    };

    // Update local state immediately
    const existing = get().items;
    const filtered = existing.filter((item) => String(item.id) !== String(product.id) && item.slug !== product.slug);
    const updated = [newItem, ...filtered].slice(0, 30);
    set({ items: updated });
    saveLocalItems(updated);

    // Call backend endpoint to persist
    try {
      await apiClient.post(`/products/${product.id}/view`);
    } catch {
      // Silently continue for guests or network errors
    }
  },

  clearHistory: async () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    try {
      await apiClient.delete("/users/me/recently-viewed");
    } catch {
      // Silently continue
    }
  },
}));
