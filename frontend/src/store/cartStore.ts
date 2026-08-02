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
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateDates: (id: string, start_date: string, end_date: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const DEFAULT_CART: CartItem[] = [
  {
    id: "cart-1",
    title: "Toyota Axio 2020 (Sedan)",
    category: "Vehicle",
    price_per_day: 2500,
    security_deposit: 5000,
    image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=500&q=80",
    owner_id: "owner-1",
    owner_name: "Rashed Hasan",
    start_date: "2025-05-25",
    end_date: "2025-05-28",
    delivery_option: "Pickup",
  },
  {
    id: "cart-2",
    title: "Sony FX3 Cinema Camera Kit",
    category: "Camera",
    price_per_day: 3500,
    security_deposit: 3000,
    image_url: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=500&q=80",
    owner_id: "owner-2",
    owner_name: "Sabbir Hossain",
    start_date: "2025-05-25",
    end_date: "2025-05-28",
    delivery_option: "Delivery",
  },
];

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_CART,
      addItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.id === item.id);
        if (!exists) {
          const newItem: CartItem = {
            ...item,
            start_date: item.start_date || "2025-05-25",
            end_date: item.end_date || "2025-05-28",
            delivery_option: item.delivery_option || "Pickup",
            owner_name: item.owner_name || "Rashed Hasan",
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
