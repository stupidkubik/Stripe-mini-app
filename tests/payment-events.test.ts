import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { getPaymentEvents, recordPaymentEvent } from "@/lib/payment-events";

const uniqueId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2)}`;

beforeAll(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("payment events", () => {
  it("returns empty results when there are no events", () => {
    const events = getPaymentEvents({ sessionId: uniqueId("session") });
    expect(events).toEqual([]);
  });

  it("records events for session and payment intent", () => {
    const sessionId = uniqueId("session");
    const paymentIntentId = uniqueId("pi");

    recordPaymentEvent({
      id: uniqueId("evt"),
      type: "payment_succeeded",
      createdAt: 1000,
      sessionId,
      paymentIntentId,
      amount: 2500,
      currency: "USD",
      customerEmail: "buyer@example.com",
      errorMessage: null,
    });

    expect(getPaymentEvents({ sessionId })).toHaveLength(1);
    expect(getPaymentEvents({ paymentIntentId })).toHaveLength(1);
  });

  it("dedupes events across keys and sorts by createdAt", () => {
    const sessionId = uniqueId("session");
    const paymentIntentId = uniqueId("pi");

    recordPaymentEvent({
      id: "evt-1",
      type: "payment_succeeded",
      createdAt: 2000,
      sessionId,
      paymentIntentId,
      amount: 2500,
      currency: "USD",
      customerEmail: "buyer@example.com",
      errorMessage: null,
    });

    recordPaymentEvent({
      id: "evt-2",
      type: "payment_failed",
      createdAt: 1000,
      paymentIntentId,
      amount: 2500,
      currency: "USD",
      customerEmail: "buyer@example.com",
      errorMessage: "Card declined",
    });

    recordPaymentEvent({
      id: "evt-3",
      type: "payment_succeeded",
      createdAt: 1500,
      sessionId,
      amount: 2500,
      currency: "USD",
      customerEmail: "buyer@example.com",
      errorMessage: null,
    });

    const events = getPaymentEvents({ sessionId, paymentIntentId });
    expect(events.map((event) => event.id)).toEqual(["evt-2", "evt-3", "evt-1"]);
  });

  it("keeps only the last 10 events per key", () => {
    const sessionId = uniqueId("session");

    for (let i = 0; i < 12; i += 1) {
      recordPaymentEvent({
        id: `evt-${i}`,
        type: "payment_succeeded",
        createdAt: i * 1000,
        sessionId,
        amount: 1000,
        currency: "USD",
        customerEmail: "buyer@example.com",
        errorMessage: null,
      });
    }

    const events = getPaymentEvents({ sessionId });
    expect(events).toHaveLength(10);
    expect(events[0].id).toBe("evt-2");
    expect(events[9].id).toBe("evt-11");
  });
});
