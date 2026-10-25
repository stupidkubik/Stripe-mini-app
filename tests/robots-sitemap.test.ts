import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listProductsMock } = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
}));

const loadRobots = async () => await import("@/app/robots");
const loadSitemap = async () => await import("@/app/sitemap");

describe("Robots and sitemap", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    vi.stubEnv("SITE_URL", "https://example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("builds robots.txt data", async () => {
    const { default: robots } = await loadRobots();

    const result = robots();

    expect(result.host).toBe("https://example.com");
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
    expect(result.rules).toMatchObject([
      {
        userAgent: "*",
        allow: "/",
      },
    ]);
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
      expect(route.lastModified).toEqual(new Date("2024-01-01T00:00:00.000Z"));
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
      "https://example.com/legal/terms",
      "https://example.com/legal/privacy",
    ]);
  });
});
