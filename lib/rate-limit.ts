import "server-only";

import { parsePositiveInt } from "@/lib/request-body";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitCheckResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitConfig = {
  max: number;
  windowMs: number;
};

const LOCAL_CLIENT = "local";
const MAX_TRACKED_BUCKETS = 10_001;
const rateLimitStore = new Map<string, RateLimitBucket>();

function checkoutConfig(): RateLimitConfig {
  return {
    max: parsePositiveInt(process.env.RATE_LIMIT_CHECKOUT_MAX, 30),
    windowMs: parsePositiveInt(
      process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS,
      60_000,
    ),
  };
}

function stripeApiBudgetConfig(): RateLimitConfig {
  return {
    max: parsePositiveInt(process.env.STRIPE_API_BUDGET_MAX, 300),
    windowMs: parsePositiveInt(process.env.STRIPE_API_BUDGET_WINDOW_MS, 60_000),
  };
}

function normalizeProviderAddress(value: string | null): string | null {
  const address = value?.split(",", 1)[0]?.trim();
  return address ? address.slice(0, 64) : null;
}

function getClientAddress(headerList: Headers): string {
  // These headers are trusted only when the corresponding platform flag is
  // injected by the host. Never use generic x-forwarded-for directly.
  if (process.env.VERCEL === "1") {
    return (
      normalizeProviderAddress(headerList.get("x-vercel-forwarded-for")) ??
      LOCAL_CLIENT
    );
  }

  if (process.env.CF_PAGES === "1") {
    return (
      normalizeProviderAddress(headerList.get("cf-connecting-ip")) ??
      LOCAL_CLIENT
    );
  }

  return LOCAL_CLIENT;
}

function cleanupExpiredBuckets(now: number) {
  if (rateLimitStore.size < MAX_TRACKED_BUCKETS) {
    return;
  }

  for (const [storedKey, bucket] of rateLimitStore) {
    if (now >= bucket.resetAt) {
      rateLimitStore.delete(storedKey);
    }
  }
}

function consumeFixedWindow(
  key: string,
  config: RateLimitConfig,
  cost = 1,
): RateLimitCheckResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const existing = rateLimitStore.get(key);
  if (rateLimitStore.size >= MAX_TRACKED_BUCKETS && !existing) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (!existing || now >= existing.resetAt) {
    if (cost > config.max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(config.windowMs / 1000),
      };
    }

    rateLimitStore.set(key, {
      count: cost,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count + cost > config.max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }

  existing.count += cost;
  rateLimitStore.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function checkCheckoutRateLimit(
  headerList: Headers,
): RateLimitCheckResult {
  return consumeFixedWindow(
    `checkout:${getClientAddress(headerList)}`,
    checkoutConfig(),
  );
}

export function reserveStripeApiBudget(cost: number): RateLimitCheckResult {
  const normalizedCost = Number.isSafeInteger(cost) && cost > 0 ? cost : 1;
  return consumeFixedWindow(
    "stripe-api:global",
    stripeApiBudgetConfig(),
    normalizedCost,
  );
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}
