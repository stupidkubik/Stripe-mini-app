import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import CartPageClient from "@/components/cart/cart-page-client";
import type { CartItem } from "@/app/store/cart";

const mockState = {
  items: [] as CartItem[],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQty: vi.fn(),
  clear: vi.fn(),
  count: () => mockState.items.reduce((acc, item) => acc + item.quantity, 0),
  total: () =>
    mockState.items.reduce(
      (acc, item) => acc + item.unitAmount * item.quantity,
      0,
    ),
};

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: typeof mockState) => T) =>
    selector(mockState),
}));

vi.mock("@/lib/stripe-client", () => ({
  getStripePromise: () => Promise.resolve({ redirectToCheckout: vi.fn() }),
}));

describe("CartPageClient", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.removeItem.mockClear();
    mockState.updateQty.mockClear();
    mockState.clear.mockClear();
  });

  it("renders empty state when cart is empty", () => {
    render(<CartPageClient />);

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse products/i }),
    ).toBeInTheDocument();
  });

  it("shows cart items and total", () => {
    mockState.items = [
      {
        productId: "prod_1",
        priceId: "price_1",
        name: "Test Product",
        image: "https://example.com/image.jpg",
        unitAmount: 2500,
        currency: "USD",
        quantity: 2,
      },
    ];

    render(<CartPageClient />);

    expect(screen.getByText(/test product/i)).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("allows removing an item", async () => {
    mockState.items = [
      {
        productId: "prod_remove",
        priceId: "price_remove",
        name: "Removable",
        image: "https://example.com/rem.jpg",
        unitAmount: 1000,
        currency: "USD",
        quantity: 1,
      },
    ];

    render(<CartPageClient />);

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(mockState.removeItem).toHaveBeenCalledWith("prod_remove");
  });
});
