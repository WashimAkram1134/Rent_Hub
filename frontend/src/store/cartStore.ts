import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  category?: string;
  price_per_day: number;
  security_deposit?: number;
  image_url: string;
  owner_id?: string;
  owner_name?: string;
  start_date?: string;
  end_date?: string;
  delivery_option?: string;
  slug?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateDates: (id: string, start_date: string, end_date: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.id === item.id);
        if (!exists) {
          const newItem: CartItem = {
            ...item,
            start_date: item.start_date || new Date().toISOString().split("T")[0],
            end_date: item.end_date || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
            delivery_option: item.delivery_option || "Pickup",
            owner_name: item.owner_name || "Host",
          };
          set({ items: [newItem, ...items] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateDates: (id, start_date, end_date) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, start_date, end_date } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      isInCart: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "renthub-cart-storage",
    }
  )
);
