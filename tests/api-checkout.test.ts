import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createJsonRequest, createTextRequest } from "./test-utils/next-api";
import { setMockHeaders } from "./test-utils/next-headers";

const { stripeMock } = vi.hoisted(() => ({
  stripeMock: {
    prices: {
      retrieve: vi.fn(),
    },
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
  stripe: stripeMock,
}));

const loadRoute = async () => await import("@/app/api/checkout/route");
const ORIGINAL_SITE_URL = process.env.SITE_URL;
const ORIGINAL_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const ORIGINAL_VERCEL_PROJECT_PRODUCTION_URL =
  process.env.VERCEL_PROJECT_PRODUCTION_URL;
const ORIGINAL_VERCEL_URL = process.env.VERCEL_URL;
const ORIGINAL_CHECKOUT_RATE_LIMIT_MAX = process.env.RATE_LIMIT_CHECKOUT_MAX;
const ORIGINAL_CHECKOUT_RATE_LIMIT_WINDOW =
  process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS;
const ORIGINAL_CHECKOUT_BODY_LIMIT = process.env.CHECKOUT_MAX_BODY_BYTES;
const ORIGINAL_STRIPE_API_BUDGET_MAX = process.env.STRIPE_API_BUDGET_MAX;
const ORIGINAL_STRIPE_API_BUDGET_WINDOW =
  process.env.STRIPE_API_BUDGET_WINDOW_MS;
const ORIGINAL_VERCEL_FLAG = process.env.VERCEL;

const validPrice = {
  id: "price_1",
  active: true,
  type: "one_time",
  product: {
    id: "prod_1",
    active: true,
    default_price: "price_1",
  },
};

describe("POST /api/checkout", () => {
  beforeEach(async () => {
    const { clearRateLimitStore } = await import("@/lib/rate-limit");
    clearRateLimitStore();

    process.env.SITE_URL = "https://shop.example.com";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    delete process.env.RATE_LIMIT_CHECKOUT_MAX;
    delete process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS;
    delete process.env.CHECKOUT_MAX_BODY_BYTES;
    delete process.env.STRIPE_API_BUDGET_MAX;
    delete process.env.STRIPE_API_BUDGET_WINDOW_MS;
    delete process.env.VERCEL;
    stripeMock.prices.retrieve.mockReset();
    stripeMock.promotionCodes.list.mockReset();
    stripeMock.checkout.sessions.create.mockReset();
    setMockHeaders();
  });

  afterAll(() => {
    if (ORIGINAL_SITE_URL === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = ORIGINAL_SITE_URL;
    }

    if (ORIGINAL_PUBLIC_SITE_URL === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_PUBLIC_SITE_URL;
    }

    if (ORIGINAL_VERCEL_PROJECT_PRODUCTION_URL === undefined) {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    } else {
      process.env.VERCEL_PROJECT_PRODUCTION_URL =
        ORIGINAL_VERCEL_PROJECT_PRODUCTION_URL;
    }

    if (ORIGINAL_VERCEL_URL === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = ORIGINAL_VERCEL_URL;
    }

    if (ORIGINAL_CHECKOUT_RATE_LIMIT_MAX === undefined) {
      delete process.env.RATE_LIMIT_CHECKOUT_MAX;
    } else {
      process.env.RATE_LIMIT_CHECKOUT_MAX = ORIGINAL_CHECKOUT_RATE_LIMIT_MAX;
    }

    if (ORIGINAL_CHECKOUT_RATE_LIMIT_WINDOW === undefined) {
      delete process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS;
    } else {
      process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS =
        ORIGINAL_CHECKOUT_RATE_LIMIT_WINDOW;
    }

    if (ORIGINAL_CHECKOUT_BODY_LIMIT === undefined) {
      delete process.env.CHECKOUT_MAX_BODY_BYTES;
    } else {
      process.env.CHECKOUT_MAX_BODY_BYTES = ORIGINAL_CHECKOUT_BODY_LIMIT;
    }

    if (ORIGINAL_STRIPE_API_BUDGET_MAX === undefined) {
      delete process.env.STRIPE_API_BUDGET_MAX;
    } else {
      process.env.STRIPE_API_BUDGET_MAX = ORIGINAL_STRIPE_API_BUDGET_MAX;
    }

    if (ORIGINAL_STRIPE_API_BUDGET_WINDOW === undefined) {
      delete process.env.STRIPE_API_BUDGET_WINDOW_MS;
    } else {
      process.env.STRIPE_API_BUDGET_WINDOW_MS =
        ORIGINAL_STRIPE_API_BUDGET_WINDOW;
    }

    if (ORIGINAL_VERCEL_FLAG === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = ORIGINAL_VERCEL_FLAG;
    }
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
    expect(stripeMock.prices.retrieve).not.toHaveBeenCalled();
  });

  it("returns 413 before parsing an oversized payload", async () => {
    process.env.CHECKOUT_MAX_BODY_BYTES = "32";

    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/checkout",
      JSON.stringify({ items: [], padding: "x".repeat(64) }),
      { headers: { "content-type": "application/json" } },
    );

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      code: "payload_too_large",
    });
    expect(stripeMock.prices.retrieve).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns 400 when item is unavailable", async () => {
    stripeMock.prices.retrieve.mockResolvedValue({
      ...validPrice,
      active: false,
    });

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
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.promotionCodes.list.mockResolvedValue({ data: [] });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
      promotionCode: "SUMMER25",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "promo_invalid",
    });
  });

  it("returns 500 when promo lookup fails", async () => {
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.promotionCodes.list.mockRejectedValue(
      new Error("lookup failed"),
    );

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
      promotionCode: "SUMMER25",
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "promo_apply_failed",
    });
  });

  it("creates a Stripe session with discounts", async () => {
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.promotionCodes.list.mockResolvedValue({
      data: [{ id: "promo_1" }],
    });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_123",
    });
    setMockHeaders({ origin: "https://example.com" });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 2 }],
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
          "https://shop.example.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://shop.example.com/cancel?session_id={CHECKOUT_SESSION_ID}",
        metadata: expect.objectContaining({
          promotion_code: "SUMMER25",
        }),
        allow_promotion_codes: false,
      }),
    );
  });

  it("ignores spoofed origin/referer headers when building redirect urls", async () => {
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_456",
    });
    setMockHeaders({
      origin: "https://evil.example",
      referer: "https://evil.example/phishing",
    });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          "https://shop.example.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://shop.example.com/cancel?session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("uses Vercel production URL fallback when SITE_URL is missing", async () => {
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "shop-live.vercel.app";
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_vercel_fallback",
    });
    setMockHeaders({
      origin: "https://evil.example",
      referer: "https://evil.example/phishing",
    });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          "https://shop-live.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://shop-live.vercel.app/cancel?session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("returns 500 when Stripe session creation fails", async () => {
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.checkout.sessions.create.mockRejectedValue(
      new Error("Stripe down"),
    );

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "checkout_failed",
    });
  });

  it("returns 429 when checkout rate limit is exceeded", async () => {
    process.env.RATE_LIMIT_CHECKOUT_MAX = "1";
    process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS = "60000";
    process.env.VERCEL = "1";

    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_limit",
    });
    setMockHeaders({
      "x-vercel-forwarded-for": "203.0.113.7",
      "user-agent": "first-agent",
    });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: [{ priceId: validPrice.id, quantity: 1 }],
    });

    const firstResponse = await POST(request);
    expect(firstResponse.status).toBe(200);

    setMockHeaders({
      "x-vercel-forwarded-for": "203.0.113.7",
      "user-agent": "rotated-agent",
    });
    const secondResponse = await POST(request);
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get("Retry-After")).toBe("60");
    await expect(secondResponse.json()).resolves.toMatchObject({
      code: "rate_limited",
    });

    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledTimes(1);
  });

  it("reserves a global per-instance budget before contacting Stripe", async () => {
    process.env.STRIPE_API_BUDGET_MAX = "2";
    process.env.STRIPE_API_BUDGET_WINDOW_MS = "60000";
    stripeMock.prices.retrieve.mockResolvedValue(validPrice);
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_budget",
    });

    const { POST } = await loadRoute();
    const createRequest = () =>
      createJsonRequest("http://localhost:3000/api/checkout", {
        items: [{ priceId: validPrice.id, quantity: 1 }],
      });

    const firstResponse = await POST(createRequest());
    expect(firstResponse.status).toBe(200);

    const secondResponse = await POST(createRequest());
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get("Retry-After")).toBe("60");
    await expect(secondResponse.json()).resolves.toMatchObject({
      code: "rate_limited",
    });
    expect(stripeMock.prices.retrieve).toHaveBeenCalledTimes(1);
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledTimes(1);
  });

  it("rejects carts with more than ten distinct items before contacting Stripe", async () => {
    stripeMock.prices.retrieve.mockImplementation(async (priceId: string) => ({
      ...validPrice,
      id: priceId,
      product: {
        id: `prod_${priceId}`,
        active: true,
      },
    }));
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: "cs_test_large_cart",
    });

    const { POST } = await loadRoute();
    const request = createJsonRequest("http://localhost:3000/api/checkout", {
      items: Array.from({ length: 11 }, (_, index) => ({
        priceId: `price_${index + 1}`,
        quantity: 1,
      })),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(stripeMock.prices.retrieve).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("rejects an active non-default price", async () => {
    stripeMock.prices.retrieve.mockResolvedValue({
      ...validPrice,
      id: "price_legacy",
    });

    const { POST } = await loadRoute();
    const response = await POST(
      createJsonRequest("http://localhost:3000/api/checkout", {
        items: [{ priceId: "price_legacy", quantity: 1 }],
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "item_unavailable",
    });
  });
});
