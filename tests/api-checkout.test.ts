import { beforeEach, describe, expect, it, vi } from "vitest";

import { createJsonRequest, createTextRequest } from "./test-utils/next-api";
import { setMockHeaders } from "./test-utils/next-headers";

const { listProductsMock, stripeMock } = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
  stripeMock: {
    promotionCodes: {
      list: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
  stripe: stripeMock,
}));

const loadRoute = async () => await import("@/app/api/checkout/route");

const product = {
  id: "prod_1",
  name: "Fern",
  description: "",
  image: "https://example.com/fern.png",
  priceId: "price_1",
  currency: "USD",
  unitAmount: 1500,
};

describe("POST /api/checkout", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    stripeMock.promotionCodes.list.mockReset();
    stripeMock.checkout.sessions.create.mockReset();
    setMockHeaders();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/checkout",
      "invalid-json",
      {
        headers: { "content-type": "application/json" },
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "invalid_payload",
    });
    expect(listProductsMock).not.toHaveBeenCalled();
  });

  it("returns 400 when item is unavailable", async () => {
    listProductsMock.mockResolvedValue([product]);

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: "price_missing", quantity: 1 }],
      customerEmail: "buyer@example.com",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "item_unavailable",
    });
  });

  it("returns 400 when promo code is invalid", async () => {
    listProductsMock.mockResolvedValue([product]);
    stripeMock.promotionCodes.list.mockResolvedValue({ data: [] });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: product.priceId, quantity: 1 }],
      promotionCode: "SUMMER25",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "promo_invalid",
    });
  });

  it("returns 500 when promo lookup fails", async () => {
    listProductsMock.mockResolvedValue([product]);
    stripeMock.promotionCodes.list.mockRejectedValue(
      new Error("lookup failed"),
    );

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: product.priceId, quantity: 1 }],
      promotionCode: "SUMMER25",
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "promo_apply_failed",
    });
  });

  it("creates a Stripe session with discounts", async () => {
    listProductsMock.mockResolvedValue([product]);
    stripeMock.promotionCodes.list.mockResolvedValue({
      data: [{ id: "promo_1" }],
    });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_123",
    });
    setMockHeaders({ origin: "https://example.com" });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: product.priceId, quantity: 2 }],
      promotionCode: "SUMMER25",
      customerEmail: "buyer@example.com",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sessionId: "cs_test_123",
    });
    expect(stripeMock.promotionCodes.list).toHaveBeenCalledWith({
      code: "SUMMER25",
      active: true,
      limit: 1,
    });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        discounts: [{ promotion_code: "promo_1" }],
        customer_email: "buyer@example.com",
        success_url:
          "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://example.com/cancel?session_id={CHECKOUT_SESSION_ID}",
        metadata: expect.objectContaining({
          promotion_code: "SUMMER25",
        }),
      }),
    );
  });

  it("returns 500 when Stripe session creation fails", async () => {
    listProductsMock.mockResolvedValue([product]);
    stripeMock.checkout.sessions.create.mockRejectedValue(
      new Error("Stripe down"),
    );

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: product.priceId, quantity: 1 }],
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "checkout_failed",
    });
  });
});
