import { afterEach, describe, expect, it } from "vitest";

import nextConfig, { securityHeaders } from "@/next.config";
import {
  ConfigurationError,
  readBuildConfig,
  readDatabaseUrl,
  readStripeSecretConfig,
} from "@/lib/config/env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("browser security headers", () => {
  it("applies the complete policy to every route", async () => {
    const rules = await nextConfig.headers?.();

    expect(rules).toEqual([{ source: "/:path*", headers: securityHeaders }]);
    expect(Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value])))
      .toMatchObject({
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      });
    expect(
      securityHeaders.find(({ key }) => key === "Content-Security-Policy")
        ?.value,
    ).toContain("frame-ancestors 'none'");
  });
});

describe("typed environment profiles", () => {
  it("uses Stripe as the default runtime catalogue", () => {
    delete process.env.CATALOGUE_SOURCE;
    expect(readBuildConfig()).toEqual({ CATALOGUE_SOURCE: "stripe" });
  });

  it("reports all invalid Stripe configuration in one actionable error", () => {
    process.env.STRIPE_SECRET_KEY = "not-a-key";

    expect(() => readStripeSecretConfig()).toThrowError(ConfigurationError);
    expect(() => readStripeSecretConfig()).toThrow(
      "Invalid Stripe runtime configuration: STRIPE_SECRET_KEY",
    );
  });

  it("rejects a non-Postgres database URL", () => {
    process.env.DATABASE_URL = "https://example.com/database";
    delete process.env.POSTGRES_URL;

    expect(() => readDatabaseUrl()).toThrow(
      "Invalid database runtime configuration: environment: must use the postgres or postgresql protocol",
    );
  });
});
