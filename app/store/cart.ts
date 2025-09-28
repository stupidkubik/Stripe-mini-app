'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  priceId: string;
  name: string;
  image: string;
  unitAmount: number; // minor units
  currency: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number; // minor units
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) =>
        set((state) => {
          const i = state.items.findIndex((x) => x.productId === item.productId);
          if (i >= 0) {
            const items = [...state.items];
            items[i] = {
              ...items[i],
              quantity: Math.min(items[i].quantity + qty, 10),
            };
            return { items };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(qty, 10) }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((x) => x.productId !== productId) })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.productId === productId ? { ...x, quantity: Math.max(1, Math.min(qty, 10)) } : x,
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, i) => a + i.quantity, 0),
      total: () => get().items.reduce((a, i) => a + i.unitAmount * i.quantity, 0),
    }),
    { name: 'cart', storage: createJSONStorage(() => localStorage) },
  ),
);
