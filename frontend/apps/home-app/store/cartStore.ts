import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  syncWithCartApp: () => void;
}

//Çarpraz iletişim için
export const CART_UPDATE_EVENT = 'cart-updated';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        let newItems;
        if (existingItem) {
          newItems = currentItems.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          );
        } else {
          newItems = [
            ...currentItems,
            {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              imageUrl: item.imageUrl,
            },
          ];
        }

        set({ items: newItems });

        // localStorage event - cross-app communication
        localStorage.setItem('cart-updated', JSON.stringify({ items: newItems, timestamp: Date.now() }));

        // Custom event
        window.dispatchEvent(
          new CustomEvent(CART_UPDATE_EVENT, { detail: { items: newItems } })
        );
      },

      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        set({ items: newItems });
        window.dispatchEvent(
          new CustomEvent(CART_UPDATE_EVENT, { detail: { items: newItems } })
        );
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const newItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        );
        set({ items: newItems });
        window.dispatchEvent(
          new CustomEvent(CART_UPDATE_EVENT, { detail: { items: newItems } })
        );
      },

      clearCart: () => {
        set({ items: [] });
        window.dispatchEvent(
          new CustomEvent(CART_UPDATE_EVENT, { detail: { items: [] } })
        );
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      syncWithCartApp: () => {
        // Sync when cart app loads
        window.dispatchEvent(
          new CustomEvent(CART_UPDATE_EVENT, { detail: { items: get().items } })
        );
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);