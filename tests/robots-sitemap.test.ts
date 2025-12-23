import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listProductsMock } = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
}));

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const loadRobots = async () => await import("@/app/robots");
const loadSitemap = async () => await import("@/app/sitemap");

describe("Robots and sitemap", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  });

  afterEach(() => {
    if (ORIGINAL_SITE_URL === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL;
    }
    vi.useRealTimers();
  });

  it("builds robots.txt data", async () => {
    const { default: robots } = await loadRobots();

    const result = robots();

    expect(result.host).toBe("https://example.com");
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
    expect(result.rules?.[0]).toMatchObject({
      userAgent: "*",
      allow: "/",
    });
  });

  it("builds sitemap with products", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    listProductsMock.mockResolvedValue([{ id: "prod_1" }, { id: "prod_2" }]);

    const { default: sitemap } = await loadSitemap();

    const routes = await sitemap();

    expect(routes).toHaveLength(7);
    expect(routes[0].url).toBe("https://example.com");
    expect(routes[1].url).toBe("https://example.com/products");
    expect(routes[5].url).toBe("https://example.com/products/prod_1");
    expect(routes[6].url).toBe("https://example.com/products/prod_2");

    for (const route of routes) {
      expect(route.lastModified?.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z",
      );
    }
  });

  it("returns static sitemap on Stripe failure", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    listProductsMock.mockRejectedValue(new Error("Stripe down"));

    const { default: sitemap } = await loadSitemap();

    const routes = await sitemap();

    expect(routes).toHaveLength(5);
    expect(routes.map((route) => route.url)).toEqual([
      "https://example.com",
      "https://example.com/products",
      "https://example.com/cart",
      "https://example.com/success",
      "https://example.com/cancel",
    ]);
  });
});
