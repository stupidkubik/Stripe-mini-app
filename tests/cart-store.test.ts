import { beforeEach, describe, expect, it } from "vitest";

import { useCart } from "@/app/store/cart";

const baseItem = {
  productId: "prod-1",
  priceId: "price-1",
  name: "Test Plant",
  image: "https://example.com/plant.png",
  unitAmount: 2500,
  currency: "USD",
};

const secondItem = {
  productId: "prod-2",
  priceId: "price-2",
  name: "Second Plant",
  image: "https://example.com/plant-2.png",
  unitAmount: 1000,
  currency: "USD",
};

function resetCart() {
  localStorage.clear();
  useCart.setState({ items: [], countValue: 0, totalValue: 0 });
}

async function rehydrateCart() {
  await (
    useCart as unknown as { persist: { rehydrate: () => Promise<void> } }
  ).persist.rehydrate();
}

describe("useCart store", () => {
  beforeEach(() => {
    resetCart();
  });

  it("adds items with a default quantity", () => {
    useCart.getState().addItem(baseItem);

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("clamps new item quantity to 10", () => {
    useCart.getState().addItem(baseItem, 12);

    expect(useCart.getState().items[0].quantity).toBe(10);
  });

  it("clamps new item quantity to at least 1", () => {
    useCart.getState().addItem(baseItem, 0);

    expect(useCart.getState().items[0].quantity).toBe(1);
  });

  it("increments existing items but never exceeds 10", () => {
    useCart.getState().addItem(baseItem, 6);
    useCart.getState().addItem(baseItem, 6);

    expect(useCart.getState().items[0].quantity).toBe(10);
  });

  it("clamps updated quantities between 1 and 10", () => {
    useCart.getState().addItem(baseItem, 3);

    useCart.getState().updateQty(baseItem.productId, 0);
    expect(useCart.getState().items[0].quantity).toBe(1);

    useCart.getState().updateQty(baseItem.productId, 99);
    expect(useCart.getState().items[0].quantity).toBe(10);
  });

  it("removes items by product id", () => {
    useCart.getState().addItem(baseItem, 1);
    useCart.getState().addItem(secondItem, 1);

    useCart.getState().removeItem(baseItem.productId);

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(secondItem.productId);
  });

  it("computes count and total from cart items", () => {
    useCart.getState().addItem(baseItem, 2);
    useCart.getState().addItem(secondItem, 3);

    const state = useCart.getState();
    expect(state.count()).toBe(5);
    expect(state.total()).toBe(2 * 2500 + 3 * 1000);
  });

  it("rehydrates and sanitizes corrupted persisted cart items", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        state: {
          items: [
            {
              productId: " prod-1 ",
              priceId: "price-1",
              name: " Plant ",
              image: "",
              unitAmount: 2500,
              currency: "usd",
              quantity: 99,
            },
            {
              productId: "prod-1",
              priceId: "price-1",
              name: "Plant v2",
              image: "https://example.com/plant-v2.png",
              unitAmount: 2500,
              currency: "usd",
              quantity: 2,
            },
            {
              productId: "",
              priceId: "price-bad",
              name: "Broken",
              image: "https://example.com/broken.png",
              unitAmount: 1000,
              currency: "USD",
              quantity: 1,
            },
            {
              productId: "prod-2",
              priceId: "price-2",
              name: "Negative",
              image: "https://example.com/negative.png",
              unitAmount: -100,
              currency: "USD",
              quantity: 1,
            },
            {
              productId: "prod-3",
              priceId: "price-3",
              name: "Third",
              image: "https://example.com/third.png",
              unitAmount: 3000,
              currency: "USDX",
              quantity: 0,
            },
          ],
        },
        version: 0,
      }),
    );

    await rehydrateCart();

    const state = useCart.getState();
    expect(state.items).toEqual([
      {
        productId: "prod-1",
        priceId: "price-1",
        name: "Plant v2",
        image: "https://example.com/plant-v2.png",
        unitAmount: 2500,
        currency: "USD",
        quantity: 10,
      },
      {
        productId: "prod-3",
        priceId: "price-3",
        name: "Third",
        image: "https://example.com/third.png",
        unitAmount: 3000,
        currency: "USD",
        quantity: 1,
      },
    ]);
    expect(state.count()).toBe(11);
    expect(state.total()).toBe(28000);
  });

  it("drops invalid persisted state shape", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        state: {
          items: "not-an-array",
        },
        version: 1,
      }),
    );

    await rehydrateCart();

    const state = useCart.getState();
    expect(state.items).toEqual([]);
    expect(state.count()).toBe(0);
    expect(state.total()).toBe(0);
  });
});
