"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  countValue: number;
  totalValue: number; // minor units
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number; // minor units
};

const deriveTotals = (items: CartItem[]) => {
  let countValue = 0;
  let totalValue = 0;

  for (const item of items) {
    countValue += item.quantity;
    totalValue += item.unitAmount * item.quantity;
  }

  return { countValue, totalValue };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      countValue: 0,
      totalValue: 0,
      addItem: (item, qty = 1) =>
        set((state) => {
          const i = state.items.findIndex(
            (x) => x.productId === item.productId,
          );
          if (i >= 0) {
            const items = [...state.items];
            const nextQuantity = Math.min(items[i].quantity + qty, 10);
            if (nextQuantity === items[i].quantity) {
              return state;
            }
            items[i] = {
              ...items[i],
              quantity: nextQuantity,
            };
            return { items, ...deriveTotals(items) };
          }
          const items = [
            ...state.items,
            { ...item, quantity: Math.min(qty, 10) },
          ];
          return { items, ...deriveTotals(items) };
        }),
      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((x) => x.productId !== productId);
          if (items.length === state.items.length) {
            return state;
          }
          return { items, ...deriveTotals(items) };
        }),
      updateQty: (productId, qty) =>
        set((state) => {
          const nextQuantity = Math.max(1, Math.min(qty, 10));
          let changed = false;
          const items = state.items.map((x) => {
            if (x.productId !== productId) {
              return x;
            }
            if (x.quantity === nextQuantity) {
              return x;
            }
            changed = true;
            return { ...x, quantity: nextQuantity };
          });
          if (!changed) {
            return state;
          }
          return { items, ...deriveTotals(items) };
        }),
      clear: () =>
        set((state) => {
          if (state.items.length === 0) {
            return state;
          }
          return { items: [], countValue: 0, totalValue: 0 };
        }),
      count: () => get().countValue,
      total: () => get().totalValue,
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const safePersisted =
          persistedState && typeof persistedState === "object"
            ? (persistedState as Partial<CartState>)
            : {};
        const items = safePersisted.items ?? currentState.items;

        return {
          ...currentState,
          ...safePersisted,
          ...deriveTotals(items ?? []),
        };
      },
    },
  ),
);
