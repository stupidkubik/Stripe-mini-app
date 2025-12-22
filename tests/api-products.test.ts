import { beforeEach, describe, expect, it, vi } from "vitest";

import { setMockHeaders } from "./test-utils/next-headers";

const { listProductsMock } = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
}));

const loadRoute = async () => await import("@/app/api/products/route");

describe("GET /api/products", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    setMockHeaders();
  });

  it("returns products list", async () => {
    listProductsMock.mockResolvedValue([
      {
        id: "prod_1",
        name: "Fern",
        description: "",
        image: "https://example.com/fern.png",
        priceId: "price_1",
        currency: "USD",
        unitAmount: 1500,
      },
    ]);

    const { GET } = await loadRoute();
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      products: [
        {
          id: "prod_1",
          name: "Fern",
          description: "",
          image: "https://example.com/fern.png",
          priceId: "price_1",
          currency: "USD",
          unitAmount: 1500,
        },
      ],
    });
  });

  it("returns 500 when Stripe fetch fails", async () => {
    listProductsMock.mockRejectedValue(new Error("Stripe down"));

    const { GET } = await loadRoute();
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to fetch products from Stripe",
    });
  });
});
