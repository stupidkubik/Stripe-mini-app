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

type PersistedCartState = {
  items?: unknown;
};

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;
const CART_PERSIST_VERSION = 1;
const FALLBACK_CART_IMAGE = "/globe.svg";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCurrency(value: unknown) {
  const normalized = normalizeString(value).toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "USD";
}

function normalizeUnitAmount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return rounded >= 0 ? rounded : null;
}

function clampQuantity(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MIN_QUANTITY;
  }

  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.round(value)));
}

function sanitizePersistedItems(rawItems: unknown): CartItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const deduped = new Map<string, CartItem>();

  for (const rawItem of rawItems) {
    if (!isRecord(rawItem)) {
      continue;
    }

    const productId = normalizeString(rawItem.productId);
    const priceId = normalizeString(rawItem.priceId);

    if (!productId || !priceId) {
      continue;
    }

    const unitAmount = normalizeUnitAmount(rawItem.unitAmount);
    if (unitAmount === null) {
      continue;
    }

    const safeItem: CartItem = {
      productId,
      priceId,
      name: normalizeString(rawItem.name) || "Product",
      image: normalizeString(rawItem.image) || FALLBACK_CART_IMAGE,
      unitAmount,
      currency: normalizeCurrency(rawItem.currency),
      quantity: clampQuantity(rawItem.quantity),
    };

    const existing = deduped.get(productId);
    if (!existing) {
      deduped.set(productId, safeItem);
      continue;
    }

    deduped.set(productId, {
      ...safeItem,
      quantity: Math.min(MAX_QUANTITY, existing.quantity + safeItem.quantity),
    });
  }

  return Array.from(deduped.values());
}

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
          const quantityToAdd = clampQuantity(qty);
          const i = state.items.findIndex(
            (x) => x.productId === item.productId,
          );
          if (i >= 0) {
            const items = [...state.items];
            const nextQuantity = Math.min(
              items[i].quantity + quantityToAdd,
              MAX_QUANTITY,
            );
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
            { ...item, quantity: quantityToAdd },
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
          const nextQuantity = clampQuantity(qty);
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
      version: CART_PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        const safePersisted = isRecord(persistedState)
          ? (persistedState as PersistedCartState)
          : {};
        const items = sanitizePersistedItems(safePersisted.items);

        if (version < CART_PERSIST_VERSION) {
          return { items };
        }

        return { ...safePersisted, items };
      },
      merge: (persistedState, currentState) => {
        const safePersisted = isRecord(persistedState)
          ? (persistedState as PersistedCartState)
          : {};
        const items = sanitizePersistedItems(safePersisted.items);

        return {
          ...currentState,
          items,
          ...deriveTotals(items),
        };
      },
    },
  ),
);
