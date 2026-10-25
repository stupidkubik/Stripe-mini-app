import { describe, expect, it } from "vitest";
import Stripe from "stripe";

// SDK minors move API_VERSION within one release, and those changes are
// additive. A new release name brings breaking API changes: check its
// changelog against the calls in lib/ and app/ before updating this test.
describe("Stripe API version", () => {
  it("stays on the endive release", () => {
    expect(Stripe.API_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.endive$/);
  });
});
