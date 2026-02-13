import "server-only";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitCheckResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RouteName = "checkout" | "webhook";

type RouteRateLimitConfig = {
  max: number;
  windowMs: number;
  keyPrefix: string;
};

const LOCAL_CLIENT = "local";
const rateLimitStore = new Map<string, RateLimitBucket>();

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRouteConfig(routeName: RouteName): RouteRateLimitConfig {
  if (routeName === "checkout") {
    return {
      max: parsePositiveInt(process.env.RATE_LIMIT_CHECKOUT_MAX, 30),
      windowMs: parsePositiveInt(
        process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS,
        60_000,
      ),
      keyPrefix: "checkout",
    };
  }

  return {
    max: parsePositiveInt(process.env.RATE_LIMIT_WEBHOOK_MAX, 120),
    windowMs: parsePositiveInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS, 60_000),
    keyPrefix: "webhook",
  };
}

function getClientAddress(headerList: Headers): string {
  const xForwardedFor = headerList.get("x-forwarded-for");
  const forwardedClient = xForwardedFor?.split(",")[0]?.trim();

  return (
    headerList.get("cf-connecting-ip")?.trim() ??
    headerList.get("x-real-ip")?.trim() ??
    forwardedClient ??
    LOCAL_CLIENT
  );
}

function getClientKey(headerList: Headers) {
  const ip = getClientAddress(headerList);
  const userAgent = headerList.get("user-agent")?.trim() ?? "unknown";
  return `${ip}|${userAgent.slice(0, 120)}`;
}

export function checkRouteRateLimit(
  routeName: RouteName,
  headerList: Headers,
): RateLimitCheckResult {
  const config = getRouteConfig(routeName);
  const now = Date.now();
  const key = `${config.keyPrefix}:${getClientKey(headerList)}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= config.max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}
