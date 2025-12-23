import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProductCard } from "@/components/product-card";

let lastQuantityProps: {
  value: number;
  onChange: (value: number) => void;
} | null = null;

const { mockState } = vi.hoisted(() => ({
  mockState: {
    items: [] as Array<{ productId: string; quantity: number }>,
    updateQty: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: typeof mockState) => T) =>
    selector(mockState),
}));

vi.mock("@/components/quantity-input", () => ({
  QuantityInput: (props: {
    value: number;
    onChange: (value: number) => void;
  }) => {
    lastQuantityProps = props;
    return <div data-testid="quantity-input" />;
  },
}));

vi.mock("@/components/add-to-cart-button", () => ({
  AddToCartButton: () => (
    <button data-testid="add-to-cart" type="button">
      Add
    </button>
  ),
}));

const product = {
  id: "prod-1",
  name: "Monstera",
  description: "Leafy",
  image: "https://example.com/plant.png",
  priceId: "price-1",
  currency: "USD",
  unitAmount: 3200,
};

describe("ProductCard", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.updateQty.mockClear();
    mockState.removeItem.mockClear();
    lastQuantityProps = null;
  });

  it("renders add-to-cart when item is not in cart", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
    expect(screen.queryByTestId("quantity-input")).not.toBeInTheDocument();
    expect(screen.getByText("$32.00")).toBeInTheDocument();
  });

  it("renders quantity input when item is in cart", () => {
    mockState.items = [{ productId: product.id, quantity: 2 }];

    render(<ProductCard product={product} />);

    expect(screen.getByTestId("quantity-input")).toBeInTheDocument();
    expect(screen.queryByTestId("add-to-cart")).not.toBeInTheDocument();
    expect(lastQuantityProps?.value).toBe(2);
  });

  it("removes item when quantity becomes zero", () => {
    mockState.items = [{ productId: product.id, quantity: 1 }];

    render(<ProductCard product={product} />);

    lastQuantityProps?.onChange(0);

    expect(mockState.removeItem).toHaveBeenCalledWith(product.id);
    expect(mockState.updateQty).not.toHaveBeenCalled();
  });

  it("clamps quantity and updates item", () => {
    mockState.items = [{ productId: product.id, quantity: 1 }];

    render(<ProductCard product={product} />);

    lastQuantityProps?.onChange(42);

    expect(mockState.updateQty).toHaveBeenCalledWith(product.id, 10);
    expect(mockState.removeItem).not.toHaveBeenCalled();
  });

  it("uses fallback description when missing", () => {
    render(<ProductCard product={{ ...product, description: undefined }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders metadata badges when available", () => {
    render(
      <ProductCard
        product={{
          ...product,
          metadata: {
            category: "air-plant",
            light: "low",
            watering: "weekly",
          },
        }}
      />,
    );

    expect(screen.getByText("Air Plant")).toBeInTheDocument();
    expect(screen.getByText("Low light")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("hides metadata badges when none are present", () => {
    render(<ProductCard product={product} />);

    expect(screen.queryByText("Low light")).not.toBeInTheDocument();
    expect(screen.queryByText("Weekly")).not.toBeInTheDocument();
  });
});
