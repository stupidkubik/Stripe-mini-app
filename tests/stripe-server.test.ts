import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { stripeState, StripeInvalidRequestError } = vi.hoisted(() => {
  class StripeInvalidRequestError extends Error {
    code?: string;
  }

  return {
    stripeState: {
      products: {
        list: vi.fn(),
        retrieve: vi.fn(),
        search: vi.fn(),
      },
      prices: {
        retrieve: vi.fn(),
        list: vi.fn(),
      },
    },
    StripeInvalidRequestError,
  };
});

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

const loadStripeModule = async () => {
  vi.resetModules();
  process.env.STRIPE_SECRET_KEY = "sk_test";
  return await import("@/lib/stripe");
};

describe("stripe server helpers", () => {
  beforeEach(() => {
    stripeState.products.list.mockReset();
    stripeState.products.retrieve.mockReset();
    stripeState.products.search.mockReset();
    stripeState.prices.retrieve.mockReset();
    stripeState.prices.list.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (ORIGINAL_KEY === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = ORIGINAL_KEY;
    }
  });

  it("lists products and normalizes prices", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [
        {
          id: "prod_b",
          name: "Zebra Plant",
          description: null,
          images: [],
          default_price: {
            id: "price_b",
            unit_amount: 2000,
            currency: "usd",
          },
        },
        {
          id: "prod_a",
          name: "Aloe",
          description: "Succulent",
          images: ["https://example.com/aloe.png"],
          default_price: "price_a",
        },
      ],
    });
    stripeState.prices.retrieve.mockResolvedValue({
      id: "price_a",
      unit_amount: 1500,
      currency: "eur",
    });

    const { listProducts } = await loadStripeModule();

    const products = await listProducts();

    expect(products.map((entry) => entry.name)).toEqual([
      "Aloe",
      "Zebra Plant",
    ]);
    expect(products[0]).toEqual({
      id: "prod_a",
      name: "Aloe",
      description: "Succulent",
      image: "https://example.com/aloe.png",
      priceId: "price_a",
      currency: "EUR",
      unitAmount: 1500,
    });
    expect(products[1].image).toBe(FALLBACK_IMAGE);
  });

  it("paginates through all Stripe product pages", async () => {
    stripeState.products.list
      .mockResolvedValueOnce({
        data: [
          {
            id: "prod_1",
            name: "Page One",
            description: null,
            images: [],
            default_price: {
              id: "price_1",
              unit_amount: 1100,
              currency: "usd",
            },
          },
        ],
        has_more: true,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "prod_2",
            name: "Page Two",
            description: null,
            images: [],
            default_price: {
              id: "price_2",
              unit_amount: 1200,
              currency: "usd",
            },
          },
        ],
        has_more: false,
      });

    const { listProducts } = await loadStripeModule();
    const products = await listProducts();

    expect(products.map((entry) => entry.id)).toEqual(["prod_1", "prod_2"]);
    expect(stripeState.products.list).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        active: true,
        expand: ["data.default_price"],
        limit: 100,
      }),
    );
    expect(stripeState.products.list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        active: true,
        expand: ["data.default_price"],
        limit: 100,
        starting_after: "prod_1",
      }),
    );
  });

  it("filters products without valid prices", async () => {
    stripeState.products.list.mockResolvedValue({
      data: [
        {
          id: "prod_bad",
          name: "Bad",
          description: null,
          images: [],
          default_price: {
            id: "price_bad",
            unit_amount: null,
            currency: "usd",
          },
        },
      ],
    });

    const { listProducts } = await loadStripeModule();

    const products = await listProducts();

    expect(products).toEqual([]);
  });

  it("returns null when Stripe reports missing product", async () => {
    const error = new StripeInvalidRequestError("missing");
    error.code = "resource_missing";
    stripeState.products.retrieve.mockRejectedValue(error);

    const { getProduct } = await loadStripeModule();

    await expect(getProduct("prod_missing")).resolves.toBeNull();
  });

  it("returns null for deleted products", async () => {
    stripeState.products.retrieve.mockResolvedValue({
      id: "prod_deleted",
      deleted: true,
    });

    const { getProduct } = await loadStripeModule();

    await expect(getProduct("prod_deleted")).resolves.toBeNull();
  });

  it("uses prices.list when default price is missing", async () => {
    stripeState.products.retrieve.mockResolvedValue({
      id: "prod_1",
      name: "Fern",
      description: null,
      images: [],
      default_price: null,
    });
    stripeState.prices.list.mockResolvedValue({
      data: [
        {
          id: "price_1",
          unit_amount: 1800,
          currency: "usd",
        },
      ],
    });

    const { getProduct } = await loadStripeModule();

    const product = await getProduct("prod_1");

    expect(product).toEqual({
      id: "prod_1",
      name: "Fern",
      description: null,
      image: FALLBACK_IMAGE,
      priceId: "price_1",
      currency: "USD",
      unitAmount: 1800,
    });
  });

  it("finds products by slug and normalizes metadata", async () => {
    stripeState.products.search.mockResolvedValue({
      data: [
        {
          id: "prod_slug",
          name: "Slug Plant",
          description: "Prickly",
          images: [],
          metadata: {
            slug: "fern",
            category: "Cactus",
            light: "Bright",
            pet_safe: "TRUE",
            watering: "Monthly",
          },
          default_price: {
            id: "price_slug",
            unit_amount: 2400,
            currency: "usd",
          },
        },
      ],
    });

    const { getProductBySlug } = await loadStripeModule();

    const product = await getProductBySlug(" fern ");

    expect(product).toEqual({
      id: "prod_slug",
      name: "Slug Plant",
      description: "Prickly",
      image: FALLBACK_IMAGE,
      priceId: "price_slug",
      currency: "USD",
      unitAmount: 2400,
      metadata: {
        slug: "fern",
        category: "cactus",
        light: "bright",
        petSafe: true,
        watering: "monthly",
      },
    });
  });

  it("falls back to listing products when search fails", async () => {
    stripeState.products.search.mockRejectedValue(new Error("search down"));
    stripeState.products.list.mockResolvedValue({
      data: [
        {
          id: "prod_list",
          name: "Listed",
          description: null,
          images: [],
          metadata: { slug: "aloe" },
          default_price: {
            id: "price_list",
            unit_amount: 1900,
            currency: "usd",
          },
        },
      ],
    });

    const { getProductBySlug } = await loadStripeModule();

    const product = await getProductBySlug("ALOE");

    expect(product?.id).toBe("prod_list");
    expect(product?.metadata?.slug).toBe("aloe");
  });

  it("falls back to product id lookup when slug is not found", async () => {
    stripeState.products.search.mockResolvedValue({ data: [] });
    stripeState.products.list.mockResolvedValue({
      data: [
        {
          id: "prod_other",
          name: "Other",
          description: null,
          images: [],
          metadata: { slug: "other" },
          default_price: {
            id: "price_other",
            unit_amount: 2100,
            currency: "usd",
          },
        },
      ],
    });
    stripeState.products.retrieve.mockResolvedValue({
      id: "prod_1",
      name: "Fallback",
      description: null,
      images: [],
      default_price: {
        id: "price_fallback",
        unit_amount: 1600,
        currency: "usd",
      },
    });

    const { getProductBySlug } = await loadStripeModule();

    const product = await getProductBySlug("PROD_1");

    expect(stripeState.products.retrieve).toHaveBeenCalledWith("prod_1", {
      expand: ["default_price"],
    });
    expect(product?.id).toBe("prod_1");
  });

  it("does not lookup product id for regular slugs", async () => {
    stripeState.products.search.mockResolvedValue({ data: [] });
    stripeState.products.list.mockResolvedValue({
      data: [],
    });

    const { getProductBySlug } = await loadStripeModule();

    await expect(getProductBySlug("fern-deluxe")).resolves.toBeNull();
    expect(stripeState.products.retrieve).not.toHaveBeenCalled();
  });

  it("returns null for blank slugs", async () => {
    const { getProductBySlug } = await loadStripeModule();

    await expect(getProductBySlug("   ")).resolves.toBeNull();
    expect(stripeState.products.search).not.toHaveBeenCalled();
  });
});
