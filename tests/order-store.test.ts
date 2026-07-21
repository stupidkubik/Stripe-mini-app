import { describe, expect, it } from "vitest";

import { InMemoryOrderStore, type OrderEventInput } from "@/lib/order-store";

function event(overrides: Partial<OrderEventInput> = {}): OrderEventInput {
  return {
    eventId: "evt_paid",
    eventType: "checkout.session.completed",
    eventCreatedAt: 2_000,
    sessionId: "cs_123",
    paymentIntentId: "pi_123",
    status: "paid",
    amount: 2500,
    currency: "usd",
    ...overrides,
  };
}

describe("order store state machine", () => {
  it("processes a replayed event once under concurrency", async () => {
    const store = new InMemoryOrderStore();

    const results = await Promise.all(
      Array.from({ length: 20 }, () => store.processEvent(event())),
    );

    expect(results.filter((result) => result.processed)).toHaveLength(1);
    expect(results.filter((result) => result.outboxCreated)).toHaveLength(1);
    expect(store.getOrder("cs_123")?.status).toBe("paid");
    expect(store.getPaidOutboxCount()).toBe(1);
  });

  it("allows failed to advance to paid but never reverses paid", async () => {
    const store = new InMemoryOrderStore();

    await store.processEvent(
      event({
        eventId: "evt_failed_first",
        eventCreatedAt: 1_000,
        eventType: "payment_intent.payment_failed",
        status: "failed",
      }),
    );
    await store.processEvent(event());
    await store.processEvent(
      event({
        eventId: "evt_failed_late",
        eventCreatedAt: 3_000,
        eventType: "payment_intent.payment_failed",
        status: "failed",
      }),
    );

    expect(store.getOrder("cs_123")?.status).toBe("paid");
    expect(store.getPaidOutboxCount()).toBe(1);
  });

  it("durably accepts an unlinked failure event without creating an order", async () => {
    const store = new InMemoryOrderStore();

    await expect(
      store.processEvent(
        event({
          eventId: "evt_unlinked",
          sessionId: undefined,
          status: "failed",
        }),
      ),
    ).resolves.toEqual({ processed: true, outboxCreated: false });
    expect(store.getPaidOutboxCount()).toBe(0);
  });
});
