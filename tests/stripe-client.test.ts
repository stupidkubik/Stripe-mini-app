import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStripeMock } = vi.hoisted(() => ({
  loadStripeMock: vi.fn(),
}));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: loadStripeMock,
}));

const loadModule = async () => await import("@/lib/stripe-client");

const ORIGINAL_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

beforeEach(() => {
  vi.resetModules();
  loadStripeMock.mockReset();
});

afterEach(() => {
  if (ORIGINAL_KEY === undefined) {
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = ORIGINAL_KEY;
  }
});

describe("getStripePromise", () => {
  it("loads Stripe.js when a publishable key exists", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
    loadStripeMock.mockResolvedValue({});

    const { getStripePromise } = await loadModule();

    const first = getStripePromise();
    const second = getStripePromise();

    expect(loadStripeMock).toHaveBeenCalledTimes(1);
    expect(loadStripeMock).toHaveBeenCalledWith("pk_test_123");
    expect(first).toBe(second);
    await expect(first).resolves.toEqual({});
  });

  it("returns null when the publishable key is missing", async () => {
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const { getStripePromise } = await loadModule();

    const result = await getStripePromise();

    expect(loadStripeMock).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
