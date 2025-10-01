import "server-only";

export type PaymentEventType = "payment_succeeded" | "payment_failed";

export type PaymentEventLog = {
  id: string;
  type: PaymentEventType;
  createdAt: number;
  sessionId?: string;
  paymentIntentId?: string;
  amount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  errorMessage?: string | null;
};

const MAX_EVENTS_PER_KEY = 10;
const store = new Map<string, PaymentEventLog[]>();

function append(key: string, entry: PaymentEventLog) {
  const existing = store.get(key) ?? [];
  const next = [...existing, entry];
  if (next.length > MAX_EVENTS_PER_KEY) {
    next.splice(0, next.length - MAX_EVENTS_PER_KEY);
  }
  store.set(key, next);
}

export function recordPaymentEvent(entry: PaymentEventLog) {
  const normalized: PaymentEventLog = {
    ...entry,
    createdAt: entry.createdAt,
  };

  if (normalized.sessionId) {
    append(`session:${normalized.sessionId}`, normalized);
  }

  if (normalized.paymentIntentId) {
    append(`pi:${normalized.paymentIntentId}`, normalized);
  }

  append("global", normalized);

  const logPayload = {
    eventId: normalized.id,
    sessionId: normalized.sessionId,
    paymentIntentId: normalized.paymentIntentId,
    amount: normalized.amount,
    currency: normalized.currency,
    customerEmail: normalized.customerEmail,
    errorMessage: normalized.errorMessage,
  };

  if (normalized.type === "payment_succeeded") {
    console.info("[stripe] payment_succeeded", logPayload);
  } else {
    console.warn("[stripe] payment_failed", logPayload);
  }
}

export function getPaymentEvents(params: {
  sessionId?: string;
  paymentIntentId?: string;
}): PaymentEventLog[] {
  const { sessionId, paymentIntentId } = params;
  const merged = new Map<string, PaymentEventLog>();

  if (sessionId) {
    for (const event of store.get(`session:${sessionId}`) ?? []) {
      merged.set(event.id, event);
    }
  }

  if (paymentIntentId) {
    for (const event of store.get(`pi:${paymentIntentId}`) ?? []) {
      merged.set(event.id, event);
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.createdAt - b.createdAt);
}
