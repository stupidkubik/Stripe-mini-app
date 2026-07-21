import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTextRequest } from "./test-utils/next-api";
import { setMockHeaders } from "./test-utils/next-headers";

process.env.STRIPE_WEBHOOK_SECRET = "webhook_secret_test_value";
const ORIGINAL_WEBHOOK_BODY_LIMIT = process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES;

class StripeSignatureVerificationError extends Error {}

const { stripeMock, processOrderEventMock } = vi.hoisted(() => ({
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
  processOrderEventMock: vi.fn(),
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

vi.mock("@/lib/order-store", () => ({
  getOrderStore: () => ({ processEvent: processOrderEventMock }),
}));

const loadRoute = async () => await import("@/app/api/stripe/webhook/route");

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    delete process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES;
    stripeMock.webhooks.constructEvent.mockReset();
    stripeMock.checkout.sessions.list.mockReset();
    processOrderEventMock.mockReset();
    processOrderEventMock.mockResolvedValue({
      processed: true,
      orderStatus: "paid",
      outboxCreated: true,
    });
    setMockHeaders();
  });

  afterAll(() => {
    if (ORIGINAL_WEBHOOK_BODY_LIMIT === undefined) {
      delete process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES;
    } else {
      process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES = ORIGINAL_WEBHOOK_BODY_LIMIT;
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
    expect(processOrderEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "evt_1",
        eventType: "checkout.session.completed",
        sessionId: "cs_123",
        paymentIntentId: "pi_123",
        amount: 5000,
        currency: "usd",
        status: "paid",
      }),
    );
  });

  it("returns success when Stripe replays an already processed event", async () => {
    processOrderEventMock.mockResolvedValue({
      processed: false,
      orderStatus: "paid",
      outboxCreated: false,
    });
    stripeMock.webhooks.constructEvent.mockReturnValue({
      id: "evt_replayed",
      type: "checkout.session.completed",
      created: 1700000000,
      data: {
        object: {
          id: "cs_replayed",
          payment_intent: "pi_replayed",
          amount_total: 5000,
          currency: "usd",
        },
      },
    });
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const response = await POST(
      createTextRequest("http://localhost:3000/api/stripe/webhook", "payload"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(processOrderEventMock).toHaveBeenCalledTimes(1);
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
    expect(processOrderEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "evt_2",
        eventType: "payment_intent.payment_failed",
        sessionId: "cs_456",
        paymentIntentId: "pi_456",
        status: "failed",
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
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(stripeMock.checkout.sessions.list).not.toHaveBeenCalled();
    expect(processOrderEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "evt_meta",
        sessionId: "cs_meta",
        status: "failed",
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
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(processOrderEventMock).not.toHaveBeenCalled();
  });

  it("returns 500 when handler throws", async () => {
    processOrderEventMock.mockRejectedValue(new Error("boom"));
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
    const request = createTextRequest(
      "http://localhost:3000/api/stripe/webhook",
      "payload",
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook handler failure",
    });
  });

  it("returns 413 before verifying an oversized webhook payload", async () => {
    process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES = "8";
    setMockHeaders({ "stripe-signature": "sig" });

    const { POST } = await loadRoute();
    const response = await POST(
      createTextRequest(
        "http://localhost:3000/api/stripe/webhook",
        "payload-too-large",
      ),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook payload is too large",
    });
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });
});
