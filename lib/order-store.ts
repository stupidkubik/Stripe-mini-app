import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type OrderStatus = "failed" | "paid";

export type OrderEventInput = {
  eventId: string;
  eventType: string;
  eventCreatedAt: number;
  sessionId?: string;
  paymentIntentId?: string;
  status: OrderStatus;
  amount?: number | null;
  currency?: string | null;
};

export type ProcessOrderEventResult = {
  processed: boolean;
  orderStatus?: OrderStatus;
  outboxCreated: boolean;
};

export interface OrderStore {
  processEvent(event: OrderEventInput): Promise<ProcessOrderEventResult>;
}

type StoredOrder = {
  sessionId: string;
  paymentIntentId?: string;
  status: OrderStatus;
  amount?: number | null;
  currency?: string | null;
  lastEventId: string;
  lastEventCreatedAt: number;
};

type ProcessRow = {
  processed: boolean;
  order_status: OrderStatus | null;
  outbox_created: boolean;
};

export class OrderStoreConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is required for durable webhook processing.");
    this.name = "OrderStoreConfigurationError";
  }
}

export class InMemoryOrderStore implements OrderStore {
  private readonly eventIds = new Set<string>();
  private readonly orders = new Map<string, StoredOrder>();
  private readonly paidOutboxSessions = new Set<string>();

  async processEvent(event: OrderEventInput): Promise<ProcessOrderEventResult> {
    if (this.eventIds.has(event.eventId)) {
      return {
        processed: false,
        orderStatus: event.sessionId
          ? this.orders.get(event.sessionId)?.status
          : undefined,
        outboxCreated: false,
      };
    }

    this.eventIds.add(event.eventId);
    if (!event.sessionId) {
      return { processed: true, outboxCreated: false };
    }

    const existing = this.orders.get(event.sessionId);
    const status: OrderStatus =
      existing?.status === "paid" || event.status === "paid"
        ? "paid"
        : "failed";
    const order: StoredOrder = {
      sessionId: event.sessionId,
      paymentIntentId: event.paymentIntentId ?? existing?.paymentIntentId,
      status,
      amount: event.amount ?? existing?.amount,
      currency: event.currency ?? existing?.currency,
      lastEventId: event.eventId,
      lastEventCreatedAt: event.eventCreatedAt,
    };
    this.orders.set(event.sessionId, order);

    const outboxCreated =
      status === "paid" && !this.paidOutboxSessions.has(event.sessionId);
    if (outboxCreated) {
      this.paidOutboxSessions.add(event.sessionId);
    }

    return { processed: true, orderStatus: status, outboxCreated };
  }

  getOrder(sessionId: string): StoredOrder | undefined {
    return this.orders.get(sessionId);
  }

  getPaidOutboxCount(): number {
    return this.paidOutboxSessions.size;
  }
}

export class NeonOrderStore implements OrderStore {
  private readonly sql: NeonQueryFunction<false, false>;
  private schemaPromise?: Promise<void>;

  constructor(connectionString: string) {
    this.sql = neon(connectionString);
  }

  private async initializeSchema() {
    await this.sql.transaction((transaction) => [
      transaction`
        CREATE TABLE IF NOT EXISTS stripe_events (
          event_id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL,
          event_created_at BIGINT NOT NULL,
          session_id TEXT,
          payment_intent_id TEXT,
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      transaction`
        CREATE TABLE IF NOT EXISTS orders (
          session_id TEXT PRIMARY KEY,
          payment_intent_id TEXT,
          status TEXT NOT NULL CHECK (status IN ('failed', 'paid')),
          amount BIGINT,
          currency TEXT,
          last_event_id TEXT NOT NULL,
          last_event_created_at BIGINT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      transaction`
        CREATE TABLE IF NOT EXISTS order_outbox (
          id BIGSERIAL PRIMARY KEY,
          session_id TEXT NOT NULL REFERENCES orders(session_id),
          topic TEXT NOT NULL,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          delivered_at TIMESTAMPTZ,
          UNIQUE (session_id, topic)
        )
      `,
    ]);
  }

  private async ensureSchema() {
    if (!this.schemaPromise) {
      this.schemaPromise = this.initializeSchema().catch((error) => {
        this.schemaPromise = undefined;
        throw error;
      });
    }

    await this.schemaPromise;
  }

  async processEvent(event: OrderEventInput): Promise<ProcessOrderEventResult> {
    await this.ensureSchema();
    const outboxPayload = JSON.stringify({
      sessionId: event.sessionId,
      paymentIntentId: event.paymentIntentId,
      amount: event.amount,
      currency: event.currency,
    });
    const rows = (await this.sql`
      WITH inserted_event AS (
        INSERT INTO stripe_events (
          event_id,
          event_type,
          event_created_at,
          session_id,
          payment_intent_id
        )
        VALUES (
          ${event.eventId},
          ${event.eventType},
          ${event.eventCreatedAt},
          ${event.sessionId ?? null},
          ${event.paymentIntentId ?? null}
        )
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      ),
      upserted_order AS (
        INSERT INTO orders (
          session_id,
          payment_intent_id,
          status,
          amount,
          currency,
          last_event_id,
          last_event_created_at
        )
        SELECT
          ${event.sessionId ?? null},
          ${event.paymentIntentId ?? null},
          ${event.status},
          ${event.amount ?? null},
          ${event.currency ?? null},
          ${event.eventId},
          ${event.eventCreatedAt}
        FROM inserted_event
        WHERE ${event.sessionId ?? null}::TEXT IS NOT NULL
        ON CONFLICT (session_id) DO UPDATE SET
          payment_intent_id = COALESCE(
            EXCLUDED.payment_intent_id,
            orders.payment_intent_id
          ),
          status = CASE
            WHEN orders.status = 'paid' THEN 'paid'
            WHEN EXCLUDED.status = 'paid' THEN 'paid'
            ELSE orders.status
          END,
          amount = COALESCE(EXCLUDED.amount, orders.amount),
          currency = COALESCE(EXCLUDED.currency, orders.currency),
          last_event_id = EXCLUDED.last_event_id,
          last_event_created_at = EXCLUDED.last_event_created_at,
          updated_at = NOW()
        RETURNING session_id, status
      ),
      inserted_outbox AS (
        INSERT INTO order_outbox (session_id, topic, payload)
        SELECT session_id, 'order.paid', ${outboxPayload}::JSONB
        FROM upserted_order
        WHERE status = 'paid'
        ON CONFLICT (session_id, topic) DO NOTHING
        RETURNING id
      )
      SELECT
        EXISTS(SELECT 1 FROM inserted_event) AS processed,
        COALESCE(
          (SELECT status FROM upserted_order LIMIT 1),
          (SELECT status FROM orders WHERE session_id = ${event.sessionId ?? null})
        ) AS order_status,
        EXISTS(SELECT 1 FROM inserted_outbox) AS outbox_created
    `) as ProcessRow[];
    const row = rows[0];

    return {
      processed: row?.processed ?? false,
      orderStatus: row?.order_status ?? undefined,
      outboxCreated: row?.outbox_created ?? false,
    };
  }
}

let orderStore: OrderStore | undefined;

export function getOrderStore(): OrderStore {
  if (orderStore) {
    return orderStore;
  }

  const connectionString =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  if (!connectionString) {
    throw new OrderStoreConfigurationError();
  }

  orderStore = new NeonOrderStore(connectionString);
  return orderStore;
}
