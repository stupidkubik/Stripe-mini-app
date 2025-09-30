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

const redirectToCheckoutMock = vi.fn(() => Promise.resolve({}));
let fetchMock: ReturnType<typeof vi.fn>;

vi.mock("@/lib/stripe-client", () => ({
  getStripePromise: () => Promise.resolve({
    redirectToCheckout: redirectToCheckoutMock,
  }),
}));

describe("CartPageClient", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.removeItem.mockClear();
    mockState.updateQty.mockClear();
    mockState.clear.mockClear();
    redirectToCheckoutMock.mockClear();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
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
    expect(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    ).toBeInTheDocument();
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

  it("validates email before checkout", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: "sess_123" }),
    });

    mockState.items = [
      {
        productId: "prod_checkout",
        priceId: "price_checkout",
        name: "Checkout Product",
        image: "https://example.com/checkout.jpg",
        unitAmount: 1500,
        currency: "USD",
        quantity: 1,
      },
    ];

    render(<CartPageClient />);

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /proceed to checkout/i }));

    expect(
      await screen.findByText(/email is required/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits checkout form when email is valid", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: "sess_valid" }),
    });

    mockState.items = [
      {
        productId: "prod_valid",
        priceId: "price_valid",
        name: "Valid Product",
        image: "https://example.com/valid.jpg",
        unitAmount: 2000,
        currency: "USD",
        quantity: 1,
      },
    ];

    render(<CartPageClient />);

    await user.type(screen.getByLabelText(/email for receipts/i), "user@test.com");
    await user.click(screen.getByRole("button", { name: /proceed to checkout/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/checkout",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(redirectToCheckoutMock).toHaveBeenCalledWith({
      sessionId: "sess_valid",
    });
  });
});
