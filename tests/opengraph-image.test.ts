import { describe, expect, it, vi } from "vitest";

const { imageResponseSpy } = vi.hoisted(() => ({
  imageResponseSpy: vi.fn(),
}));

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(node: unknown, options: { width?: number; height?: number }) {
      imageResponseSpy(node, options);
    }
  },
}));

const loadModule = async () => await import("@/app/opengraph-image");

describe("OpenGraph image", () => {
  it("exports metadata constants", async () => {
    const mod = await loadModule();

    expect(mod.runtime).toBe("edge");
    expect(mod.alt).toBe("Verdant Lane — Stripe-powered houseplant boutique");
    expect(mod.contentType).toBe("image/png");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
  });

  it("creates an ImageResponse with expected size", async () => {
    const mod = await loadModule();

    await mod.default();

    expect(imageResponseSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1200, height: 630 }),
    );
  });
});
