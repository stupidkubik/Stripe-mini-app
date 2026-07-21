import { describe, expect, it } from "vitest";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-01-28.clover";

describe("protected Stripe test account", () => {
  it("can read one catalogue item within the integration quota", async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is required. Run this named integration suite only with a protected Stripe test account.",
      );
    }
    if (!secretKey.startsWith("sk_test_")) {
      throw new Error(
        "The Stripe integration suite refuses non-test secret keys.",
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
      maxNetworkRetries: 1,
      timeout: 10_000,
    });
    const page = await stripe.products.list({ active: true, limit: 1 });

    expect(page.data.length).toBeLessThanOrEqual(1);
  });
});
