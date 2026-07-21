import "server-only";

export type ServerLogOperation =
  | "stripe.catalog.price.list"
  | "stripe.catalog.price.retrieve"
  | "stripe.catalog.product.retrieve"
  | "stripe.catalog.product.search"
  | "stripe.checkout.process"
  | "stripe.checkout.promotion.lookup"
  | "stripe.checkout.session.create"
  | "stripe.checkout.session.retrieve.cancel"
  | "stripe.checkout.session.retrieve.success"
  | "stripe.sitemap.generate"
  | "stripe.webhook.checkout-session.lookup"
  | "stripe.webhook.process"
  | "stripe.webhook.verify";

type SafeServerError = {
  operation: ServerLogOperation;
  errorType: string;
  statusCode?: number;
  requestId?: string;
  retryable: boolean;
};

type ErrorWithStripeFields = {
  name?: unknown;
  type?: unknown;
  rawType?: unknown;
  statusCode?: unknown;
  requestId?: unknown;
};

type SampleBucket = {
  count: number;
  resetAt: number;
};

const MAX_TOKEN_LENGTH = 128;
const RATE_LIMIT_SAMPLE_MAX = 3;
const RATE_LIMIT_SAMPLE_WINDOW_MS = 60_000;
const MAX_SAMPLE_BUCKETS = 100;
const sampleBuckets = new Map<string, SampleBucket>();

function safeToken(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > MAX_TOKEN_LENGTH ||
    !/^[A-Za-z0-9_.:-]+$/.test(trimmed)
  ) {
    return undefined;
  }

  return trimmed;
}

function safeStatusCode(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 100 &&
    value <= 599
    ? value
    : undefined;
}

export function serializeServerError(
  operation: ServerLogOperation,
  error: unknown,
): SafeServerError {
  const candidate =
    error && typeof error === "object"
      ? (error as ErrorWithStripeFields)
      : undefined;
  const errorType =
    safeToken(candidate?.type) ??
    safeToken(candidate?.rawType) ??
    safeToken(candidate?.name) ??
    "UnknownError";
  const statusCode = safeStatusCode(candidate?.statusCode);
  const requestId = safeToken(candidate?.requestId);

  return {
    operation,
    errorType,
    ...(statusCode === undefined ? {} : { statusCode }),
    ...(requestId === undefined ? {} : { requestId }),
    retryable:
      statusCode === 429 || (statusCode !== undefined && statusCode >= 500),
  };
}

function shouldLog(payload: SafeServerError): boolean {
  if (payload.statusCode !== 429) {
    return true;
  }

  const now = Date.now();
  const key = `${payload.operation}:${payload.errorType}:429`;
  const existing = sampleBuckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (sampleBuckets.size >= MAX_SAMPLE_BUCKETS) {
      for (const [storedKey, bucket] of sampleBuckets) {
        if (now >= bucket.resetAt) {
          sampleBuckets.delete(storedKey);
        }
      }

      if (sampleBuckets.size >= MAX_SAMPLE_BUCKETS) {
        const oldestKey = sampleBuckets.keys().next().value;
        if (oldestKey !== undefined) {
          sampleBuckets.delete(oldestKey);
        }
      }
    }

    sampleBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_SAMPLE_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= RATE_LIMIT_SAMPLE_MAX) {
    return false;
  }

  existing.count += 1;
  sampleBuckets.set(key, existing);
  return true;
}

export function logServerError(
  operation: ServerLogOperation,
  error: unknown,
  level: "error" | "warn" = "error",
) {
  const payload = serializeServerError(operation, error);
  if (!shouldLog(payload)) {
    return;
  }

  console[level]("[server-error]", payload);
}

export function clearServerLogSamples() {
  sampleBuckets.clear();
}
