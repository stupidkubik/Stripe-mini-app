import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrderSuccess from "@/components/cart/order-success";

const { mockClear } = vi.hoisted(() => ({
  mockClear: vi.fn(),
}));

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: { clear: typeof mockClear }) => T) =>
    selector({ clear: mockClear }),
}));

describe("OrderSuccess", () => {
  beforeEach(() => {
    mockClear.mockClear();
  });

  it("renders order summary and clears the cart", async () => {
    render(
      <OrderSuccess
        sessionId="cs_test_123"
        amountTotal={2500}
        amountSubtotal={3000}
        amountDiscount={500}
        promoCode="SUMMER25"
        currency="usd"
        customerEmail="buyer@example.com"
        lineItems={[
          {
            id: "line-1",
            description: "Aloe Vera",
            quantity: 2,
            unitAmount: 1500,
            amountSubtotal: 3000,
            currency: "USD",
            image: "https://example.com/aloe.png",
          },
        ]}
        timelineSteps={[
          { id: "order", label: "Order placed", status: "complete" },
          { id: "payment", label: "Payment confirmed", status: "complete" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /payment successful/i })).toBeInTheDocument();
    expect(screen.getByText(/receipt sent to/i)).toBeInTheDocument();
    expect(screen.getByText("buyer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Aloe Vera")).toBeInTheDocument();
    expect(screen.getByText(/promo code \(SUMMER25\)/i)).toBeInTheDocument();
    expect(screen.getByText("-$5.00")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockClear).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/your cart has been cleared/i),
    ).toBeInTheDocument();
  });
});
