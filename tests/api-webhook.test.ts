import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTextRequest } from "./test-utils/next-api";
import { setMockHeaders } from "./test-utils/next-headers";

process.env.STRIPE_WEBHOOK_SECRET = "webhook_secret_test_value";
const ORIGINAL_WEBHOOK_RATE_LIMIT_MAX = process.env.RATE_LIMIT_WEBHOOK_MAX;
const ORIGINAL_WEBHOOK_RATE_LIMIT_WINDOW =
  process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS;

class StripeSignatureVerificationError extends Error {}

const { stripeMock, recordPaymentEventMock } = vi.hoisted(() => ({
  stripeMock: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        list: vi.fn(),
      },
    },
  },
  recordPaymentEventMock: vi.fn(),
}));

vi.mock("stripe", () => {
  class StripeMock {
    static errors = { StripeSignatureVerificationError };
  }
  return { __esModule: true, default: StripeMock };
});

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

vi.mock("@/lib/payment-events", () => ({
  recordPaymentEvent: recordPaymentEventMock,
}));

const loadRoute = async () => await import("@/app/api/stripe/webhook/route");

describe("POST /api/stripe/webhook", () => {
  beforeEach(async () => {
    const { clearRateLimitStore } = await import("@/lib/rate-limit");
    clearRateLimitStore();

    delete process.env.RATE_LIMIT_WEBHOOK_MAX;
    delete process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS;
    stripeMock.webhooks.constructEvent.mockReset();
    stripeMock.checkout.sessions.list.mockReset();
    recordPaymentEventMock.mockReset();
    setMockHeaders();
  });

  afterAll(() => {
    if (ORIGINAL_WEBHOOK_RATE_LIMIT_MAX === undefined) {
      delete process.env.RATE_LIMIT_WEBHOOK_MAX;
    } else {
      process.env.RATE_LIMIT_WEBHOOK_MAX = ORIGINAL_WEBHOOK_RATE_LIMIT_MAX;
    }

    if (ORIGINAL_WEBHOOK_RATE_LIMIT_WINDOW === undefined) {
      delete process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS;
    } else {
      process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS =
        ORIGINAL_WEBHOOK_RATE_LIMIT_WINDOW;
    }
  });

  it("returns 400 when signature header is missing", async () => {
    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing Stripe-Signature header",
    });
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new StripeSignatureVerificationError("bad sig");
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid signature",
    });
  });

  it("returns 400 for unexpected verification errors", async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("boom");
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to process webhook",
    });
  });

  it("records checkout.session.completed events", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      created: 1700000000,
      data: {
        object: {
          id: "cs_123",
          payment_intent: "pi_123",
          amount_total: 5000,
          currency: "usd",
          customer_details: { email: "buyer@example.com" },
        },
      },
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(recordPaymentEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_1",
        type: "payment_succeeded",
        sessionId: "cs_123",
        paymentIntentId: "pi_123",
        amount: 5000,
        currency: "usd",
        customerEmail: "buyer@example.com",
      }),
    );
  });

  it("records payment_failed events and resolves session id", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_2",
      type: "payment_intent.payment_failed",
      created: 1700000100,
      data: {
        object: {
          id: "pi_456",
          amount: 2500,
          currency: "usd",
          metadata: {},
          last_payment_error: { message: "Card declined" },
        },
      },
    });
    stripeMock.checkout.sessions.list.mockResolvedValue({
      data: [{ id: "cs_456" }],
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(recordPaymentEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_2",
        type: "payment_failed",
        sessionId: "cs_456",
        paymentIntentId: "pi_456",
        errorMessage: "Card declined",
      }),
    );
  });

  it("uses checkout_session_id metadata without listing sessions", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_meta",
      type: "payment_intent.payment_failed",
      created: 1700000200,
      data: {
        object: {
          id: "pi_meta",
          amount: 1200,
          currency: "usd",
          metadata: { checkout_session_id: "cs_meta" },
          receipt_email: "buyer@example.com",
          last_payment_error: { message: "Failed" },
        },
      },
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest("http://localhost:3000/api/stripe/webhook", "payload");

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(stripeMock.checkout.sessions.list).not.toHaveBeenCalled();
    expect(recordPaymentEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "evt_meta",
        type: "payment_failed",
        sessionId: "cs_meta",
        customerEmail: "buyer@example.com",
      }),
    );
  });

  it("returns 200 for unhandled event types", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_other",
      type: "customer.created",
      created: 1700000300,
      data: { object: {} },
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest("http://localhost:3000/api/stripe/webhook", "payload");

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(recordPaymentEventMock).not.toHaveBeenCalled();
  });

  it("returns 500 when handler throws", async () => {
    recordPaymentEventMock.mockImplementation(() => {
      throw new Error("boom");
    });
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_boom",
      type: "checkout.session.completed",
      created: 1700000400,
      data: {
        object: {
          id: "cs_boom",
          payment_intent: "pi_boom",
          amount_total: 4200,
          currency: "usd",
          customer_details: { email: "buyer@example.com" },
        },
      },
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const request = createTextRequest("http://localhost:3000/api/stripe/webhook", "payload");

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook handler failure",
    });
  });

  it("returns 429 when webhook rate limit is exceeded", async () => {
    process.env.RATE_LIMIT_WEBHOOK_MAX = "1";
    process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS = "60000";

    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_limit",
      type: "customer.created",
      created: 1700000000,
      data: { object: {} },
    });
    setMockHeaders({
      "stripe-signature": "sig",
      "x-forwarded-for": "198.51.100.55",
      "user-agent": "stripe-test",
    });

    const { POST } = await loadRoute();
    const firstResponse = await POST(
      createTextRequest("http://localhost:3000/api/stripe/webhook", "payload"),
    );
    expect(firstResponse.status).toBe(200);

    const secondResponse = await POST(
      createTextRequest("http://localhost:3000/api/stripe/webhook", "payload"),
    );
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get("Retry-After")).toBe("60");
    await expect(secondResponse.json()).resolves.toEqual({
      error: "Too many webhook requests",
    });
  });
});
