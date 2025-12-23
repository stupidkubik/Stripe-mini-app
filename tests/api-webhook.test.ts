import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTextRequest } from "./test-utils/next-api";
import { setMockHeaders } from "./test-utils/next-headers";

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

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
  beforeEach(() => {
    stripeMock.webhooks.constructEvent.mockReset();
    stripeMock.checkout.sessions.list.mockReset();
    recordPaymentEventMock.mockReset();
    setMockHeaders();
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
});
