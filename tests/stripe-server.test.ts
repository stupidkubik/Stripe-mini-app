import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const { stripeState, StripeInvalidRequestError } = vi.hoisted(() => {
  class StripeInvalidRequestError extends Error {
    code?: string;
    statusCode?: number;
  }

  return {
    stripeState: {
      products: {
        list: vi.fn(),
      },
      prices: {
        retrieve: vi.fn(),
      },
    },
    StripeInvalidRequestError,
  };
});

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => Promise<unknown>>(
    callback: T,
  ) => {
    let cached: ReturnType<T> | undefined;
    return ((...args: Parameters<T>) => {
      cached ??= callback(...args) as ReturnType<T>;
      return cached;
    }) as T;
  },
}));

vi.mock("stripe", () => {
  class StripeMock {
    static errors = { StripeInvalidRequestError };
    products = stripeState.products;
    prices = stripeState.prices;

    constructor(_key: string, _opts: unknown) {}
  }

  return { __esModule: true, default: StripeMock };
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1200&q=80";
const ORIGINAL_KEY = process.env.STRIPE_SECRET_KEY;
const ORIGINAL_CATALOGUE_SOURCE = process.env.CATALOGUE_SOURCE;

const loadStripeModule = async () => {
  vi.resetModules();
  process.env.STRIPE_SECRET_KEY = "sk_test";
  return await import("@/lib/stripe");
};

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod_1",
    name: "Fern",
    description: "Leafy",
    images: [],
    active: true,
    metadata: { slug: "fern" },
    default_price: {
      id: "price_1",
      active: true,
      type: "one_time",
      unit_amount: 1800,
      currency: "usd",
    },
    ...overrides,
  };
}

describe("Stripe catalogue snapshot", () => {
  beforeEach(() => {
    stripeState.products.list.mockReset();
    stripeState.prices.retrieve.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (ORIGINAL_KEY === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = ORIGINAL_KEY;
    }
    if (ORIGINAL_CATALOGUE_SOURCE === undefined) {
      delete process.env.CATALOGUE_SOURCE;
    } else {
      process.env.CATALOGUE_SOURCE = ORIGINAL_CATALOGUE_SOURCE;
    }
  });

  it("uses the deterministic fixture without a Stripe secret", async () => {
    vi.resetModules();
    delete process.env.STRIPE_SECRET_KEY;
    process.env.CATALOGUE_SOURCE = "fixture";

    const { listProducts } = await import("@/lib/stripe");

    await expect(listProducts()).resolves.toHaveLength(3);
    expect(stripeState.products.list).not.toHaveBeenCalled();
  });

  it("builds one normalized snapshot reused by every lookup", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [product()],
      has_more: false,
    });

    const { getProduct, getProductByPriceId, getProductBySlug, listProducts } =
      await loadStripeModule();

    const products = await listProducts();

    expect(products).toEqual([
      {
        id: "prod_1",
        name: "Fern",
        description: "Leafy",
        image: FALLBACK_IMAGE,
        priceId: "price_1",
        currency: "USD",
        unitAmount: 1800,
        metadata: { slug: "fern" },
      },
    ]);
    await expect(getProduct("PROD_1")).resolves.toBe(products[0]);
    await expect(getProductBySlug(" FERN ")).resolves.toBe(products[0]);
    await expect(getProductByPriceId("price_1")).resolves.toBe(products[0]);
    expect(stripeState.products.list).toHaveBeenCalledTimes(1);
    expect(stripeState.products.list).toHaveBeenCalledWith({
      active: true,
      expand: ["data.default_price"],
      limit: 100,
    });
    expect(stripeState.products).not.toHaveProperty("search");
  });

  it("paginates once while building the snapshot", async () => {
    stripeState.products.list
      .mockResolvedValueOnce({
        data: [product()],
        has_more: true,
      })
      .mockResolvedValueOnce({
        data: [
          product({
            id: "prod_2",
            name: "Aloe",
            metadata: { slug: "aloe" },
            default_price: {
              id: "price_2",
              active: true,
              type: "one_time",
              unit_amount: 1500,
              currency: "usd",
            },
          }),
        ],
        has_more: false,
      });

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toMatchObject([
      { id: "prod_2" },
      { id: "prod_1" },
    ]);
    expect(stripeState.products.list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ starting_after: "prod_1" }),
    );
  });

  it("filters a product when default_price is absent", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [product({ default_price: null })],
      has_more: false,
    });

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toEqual([]);
  });

  it("filters products whose normalized price is incomplete", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [
        product({
          default_price: {
            ...product().default_price,
            unit_amount: null,
          },
        }),
      ],
      has_more: false,
    });

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toEqual([]);
  });

  it.each([
    ["inactive product", { active: false }],
    [
      "inactive price",
      { default_price: { ...product().default_price, active: false } },
    ],
    [
      "recurring price",
      { default_price: { ...product().default_price, type: "recurring" } },
    ],
    [
      "negative amount",
      { default_price: { ...product().default_price, unit_amount: -1 } },
    ],
    [
      "fractional minor-unit amount",
      { default_price: { ...product().default_price, unit_amount: 10.5 } },
    ],
    [
      "malformed currency",
      { default_price: { ...product().default_price, currency: "USDX" } },
    ],
    [
      "different storefront currency",
      { default_price: { ...product().default_price, currency: "eur" } },
    ],
  ])("filters an %s", async (_case, overrides) => {
    stripeState.products.list.mockResolvedValue({
      data: [product(overrides)],
      has_more: false,
    });

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toEqual([]);
  });

  it("skips a product whose referenced default price was deleted", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [product({ default_price: "price_deleted" })],
      has_more: false,
    });
    const error = new StripeInvalidRequestError("missing");
    error.code = "resource_missing";
    stripeState.prices.retrieve.mockRejectedValue(error);

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toEqual([]);
  });

  it("indexes only the current default price and rejects a replaced price", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [product()],
      has_more: false,
    });

    const { getProductByPriceId } = await loadStripeModule();

    await expect(getProductByPriceId("price_1")).resolves.toMatchObject({
      id: "prod_1",
    });
    await expect(getProductByPriceId("price_replaced")).resolves.toBeNull();
  });

  it("normalizes valid metadata and discards unsafe storefront fields", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [
        product({
          name: "  Fern  ",
          images: ["javascript:alert(1)"],
          metadata: {
            slug: " Bad / Slug ",
            category: " Tropical ",
            light: "invalid",
            pet_safe: "TRUE",
            watering: "Monthly",
          },
        }),
      ],
      has_more: false,
    });

    const { listProducts } = await loadStripeModule();

    await expect(listProducts()).resolves.toMatchObject([
      {
        name: "Fern",
        image: FALLBACK_IMAGE,
        metadata: {
          category: "tropical",
          petSafe: true,
          watering: "monthly",
        },
      },
    ]);
    expect((await listProducts())[0]?.metadata?.slug).toBeUndefined();
    expect((await listProducts())[0]?.metadata?.light).toBeUndefined();
  });

  it("does not load the snapshot for blank lookup keys", async () => {
    const { getProduct, getProductByPriceId, getProductBySlug } =
      await loadStripeModule();

    await expect(getProduct("  ")).resolves.toBeNull();
    await expect(getProductBySlug("  ")).resolves.toBeNull();
    await expect(getProductByPriceId("  ")).resolves.toBeNull();
    expect(stripeState.products.list).not.toHaveBeenCalled();
  });

  it("retries bounded transient failures before publishing a snapshot", async () => {
    const transientError = new StripeInvalidRequestError("rate limited");
    transientError.statusCode = 429;
    stripeState.products.list
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce({ data: [product()], has_more: false });

    const { StripeCatalogueRepository } = await import("@/lib/catalogue");
    const retryDelay = vi.fn(async () => undefined);
    const repository = new StripeCatalogueRepository(
      stripeState as unknown as Stripe,
      retryDelay,
    );

    await expect(repository.getSnapshot()).resolves.toMatchObject({
      products: [{ id: "prod_1" }],
    });
    expect(stripeState.products.list).toHaveBeenCalledTimes(3);
    expect(retryDelay).toHaveBeenCalledTimes(2);
  });

  it("fails clearly and logs only sanitized fields after retries are exhausted", async () => {
    const transientError = Object.assign(
      new Error("buyer@example.com https://dashboard.stripe.com/private"),
      { type: "StripeRateLimitError", statusCode: 429 },
    );
    stripeState.products.list.mockRejectedValue(transientError);

    const { CatalogueUnavailableError, StripeCatalogueRepository } =
      await import("@/lib/catalogue");
    const repository = new StripeCatalogueRepository(
      stripeState as unknown as Stripe,
      async () => undefined,
    );

    await expect(repository.getSnapshot()).rejects.toBeInstanceOf(
      CatalogueUnavailableError,
    );
    expect(stripeState.products.list).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(
      /buyer|dashboard|private/,
    );
  });
});
