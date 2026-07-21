import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearServerLogSamples,
  logServerError,
  serializeServerError,
} from "@/lib/server-log";

describe("server error logging", () => {
  beforeEach(() => {
    clearServerLogSamples();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps only explicitly allowed operational fields", () => {
    const payload = serializeServerError("stripe.checkout.session.create", {
      name: "StripeRateLimitError",
      type: "StripeRateLimitError",
      statusCode: 429,
      requestId: "req_safe123",
      message: "buyer@example.com used SECRET25",
      headers: { authorization: "secret" },
      raw: {
        request_log_url: "https://dashboard.stripe.com/acct_secret/logs",
        receipt_token: "receipt-secret",
      },
    });

    expect(payload).toEqual({
      operation: "stripe.checkout.session.create",
      errorType: "StripeRateLimitError",
      statusCode: 429,
      requestId: "req_safe123",
      retryable: true,
    });
    expect(JSON.stringify(payload)).not.toMatch(
      /buyer|SECRET25|authorization|dashboard|acct_secret|receipt-secret/,
    );
  });

  it("does not copy unsafe tokens or arbitrary error text", () => {
    expect(
      serializeServerError("stripe.webhook.verify", {
        name: "unsafe error with spaces",
        requestId: "https://dashboard.stripe.com/private",
        message: "raw secret",
      }),
    ).toEqual({
      operation: "stripe.webhook.verify",
      errorType: "UnknownError",
      retryable: false,
    });
  });

  it("samples repeated Stripe 429 errors per operation", () => {
    const error = {
      type: "StripeRateLimitError",
      statusCode: 429,
      requestId: "req_sample",
    };

    for (let index = 0; index < 10; index += 1) {
      logServerError("stripe.catalog.product.search", error, "warn");
    }

    expect(console.warn).toHaveBeenCalledTimes(3);
    expect(console.warn).toHaveBeenLastCalledWith(
      "[server-error]",
      expect.objectContaining({
        operation: "stripe.catalog.product.search",
        statusCode: 429,
      }),
    );
  });
});
