import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartStickySummary from "@/components/cart/cart-sticky-summary";

const { mockState } = vi.hoisted(() => ({
  mockState: {
    items: [] as Array<{
      productId: string;
      currency: string;
      quantity: number;
    }>,
    total: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: typeof mockState) => T) =>
    selector(mockState),
}));

describe("CartStickySummary", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.total.mockReset();
    mockState.count.mockReset();
    mockState.total.mockReturnValue(0);
    mockState.count.mockReturnValue(0);
  });

  it("renders nothing when cart is empty", () => {
    const { container } = render(<CartStickySummary />);

    expect(container.firstChild).toBeNull();
  });

  it("shows total and checkout link when cart has items", () => {
    mockState.items = [{ productId: "prod-1", currency: "USD", quantity: 2 }];
    mockState.total.mockReturnValue(5000);
    mockState.count.mockReturnValue(2);

    render(<CartStickySummary />);

    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText(/2 items in cart/i)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /checkout/i });
    expect(link).toHaveAttribute("href", "#cart-checkout");
  });
});
