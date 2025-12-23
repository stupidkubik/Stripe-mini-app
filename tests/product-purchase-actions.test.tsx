import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductPurchaseActions } from "@/components/product-purchase-actions";

let lastQuantityProps: {
  value: number;
  onChange: (value: number) => void;
} | null = null;
let lastAddProps: { quantity?: number } | null = null;

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
  AddToCartButton: (props: { quantity?: number }) => {
    lastAddProps = props;
    return (
      <button data-testid="add-to-cart" type="button">
        Add
      </button>
    );
  },
}));

const product = {
  id: "prod-1",
  name: "Snake Plant",
  description: "",
  image: "https://example.com/plant.png",
  priceId: "price-1",
  currency: "USD",
  unitAmount: 4500,
};

describe("ProductPurchaseActions", () => {
  it("syncs quantity between input and add-to-cart button", () => {
    render(<ProductPurchaseActions product={product} />);

    expect(screen.getByTestId("quantity-input")).toBeInTheDocument();
    expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
    expect(lastAddProps?.quantity).toBe(1);

    act(() => {
      lastQuantityProps?.onChange(4);
    });

    expect(lastAddProps?.quantity).toBe(4);
  });
});
