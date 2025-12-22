import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listProductsMock, productGridState } = vi.hoisted(() => ({
  listProductsMock: vi.fn(),
  productGridState: {
    lastProps: null as null | { products: unknown[] },
  },
}));

vi.mock("@/lib/stripe", () => ({
  listProducts: listProductsMock,
}));

vi.mock("@/components/product-grid", () => ({
  ProductGrid: (props: { products: unknown[] }) => {
    productGridState.lastProps = props;
    return <div data-testid="product-grid" />;
  },
}));

const loadHomePage = async () => await import("@/app/page");

const makeProduct = (index: number) => ({
  id: `prod_${index}`,
  name: `Plant ${index}`,
  description: "",
  image: `https://example.com/plant-${index}.png`,
  priceId: `price_${index}`,
  currency: "USD",
  unitAmount: 1200 + index,
});

describe("Home page", () => {
  beforeEach(() => {
    listProductsMock.mockReset();
    productGridState.lastProps = null;
  });

  it("renders featured products when available", async () => {
    listProductsMock.mockResolvedValue([
      makeProduct(1),
      makeProduct(2),
      makeProduct(3),
      makeProduct(4),
      makeProduct(5),
    ]);

    const { default: HomePage } = await loadHomePage();

    const element = await HomePage();
    render(element);

    expect(screen.getByRole("heading", { name: /featured foliage/i })).toBeInTheDocument();
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(productGridState.lastProps?.products).toHaveLength(4);
    expect(screen.queryByText(/no plants available yet/i)).not.toBeInTheDocument();
  });

  it("shows empty catalog message when no products", async () => {
    listProductsMock.mockResolvedValue([]);

    const { default: HomePage } = await loadHomePage();

    const element = await HomePage();
    render(element);

    expect(
      screen.getByText(/no plants available yet/i),
    ).toBeInTheDocument();
  });
});
