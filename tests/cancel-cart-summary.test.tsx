import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CancelCartSummary from "@/components/cart/cancel-cart-summary";

const { mockState } = vi.hoisted(() => ({
  mockState: {
    items: [] as Array<{
      productId: string;
      name: string;
      image: string;
      unitAmount: number;
      currency: string;
      quantity: number;
    }>,
    total: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: typeof mockState) => T) => selector(mockState),
}));

describe("CancelCartSummary", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.total.mockReset();
    mockState.count.mockReset();
  });

  it("renders empty state when cart is empty", () => {
    render(<CancelCartSummary />);

    expect(
      screen.getByRole("heading", { name: /your cart is empty/i }),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /browse products/i });
    expect(link).toHaveAttribute("href", "/products");
  });

  it("renders cart summary when items exist", () => {
    mockState.items = [
      {
        productId: "prod_1",
        name: "Fern",
        image: "https://example.com/fern.png",
        unitAmount: 2500,
        currency: "USD",
        quantity: 2,
      },
    ];
    mockState.total.mockReturnValue(5000);
    mockState.count.mockReturnValue(2);

    render(<CancelCartSummary />);

    expect(screen.getByText("Your cart")).toBeInTheDocument();
    expect(screen.getByText(/2 items ready/i)).toBeInTheDocument();
    expect(screen.getAllByText("$50.00")).toHaveLength(2);
    expect(screen.getByText("Fern")).toBeInTheDocument();
    expect(screen.getByText(/\$25\.00 · qty 2/i)).toBeInTheDocument();
  });
});
