import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductGrid } from "@/components/product-grid";
import { getIntersectionObservers } from "./test-utils/intersection-observer";

vi.mock("@/components/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
  ProductCardSkeleton: () => <div data-testid="product-card-skeleton" />,
}));

const makeProducts = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `prod-${index}`,
    name: `Product ${index}`,
    description: "",
    image: "https://example.com/plant.png",
    priceId: `price-${index}`,
    currency: "USD",
    unitAmount: 1500,
  }));

describe("ProductGrid", () => {
  it("renders an initial batch and loads more on intersection", () => {
    const products = makeProducts(20);
    const { container } = render(<ProductGrid products={products} />);

    expect(screen.getAllByTestId("product-card")).toHaveLength(12);

    const sentinel = container.querySelector("li[aria-hidden]");
    expect(sentinel).not.toBeNull();

    const observers = getIntersectionObservers();
    expect(observers.length).toBeGreaterThan(0);

    act(() => {
      observers[0].trigger({ target: sentinel as Element, isIntersecting: true });
    });

    expect(screen.getAllByTestId("product-card")).toHaveLength(20);
    expect(container.querySelector("li[aria-hidden]")).toBeNull();
  });
});
