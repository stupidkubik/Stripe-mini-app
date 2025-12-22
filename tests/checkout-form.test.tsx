import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "@/components/cart/checkout-form";
import type { CartItem } from "@/app/store/cart";

const toastMock = vi.hoisted(() => vi.fn());
const getStripePromiseMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

vi.mock("@/lib/stripe-client", () => ({
  getStripePromise: getStripePromiseMock,
}));

describe("CheckoutForm", () => {
  const baseItem: CartItem = {
    productId: "prod_1",
    priceId: "price_1",
    name: "Sample",
    image: "https://example.com/sample.png",
    unitAmount: 2500,
    currency: "USD",
    quantity: 1,
  };
  let fetchMock: ReturnType<typeof vi.fn>;
  let redirectToCheckoutMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    toastMock.mockClear();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    redirectToCheckoutMock = vi.fn().mockResolvedValue({});
    getStripePromiseMock.mockResolvedValue({
      redirectToCheckout: redirectToCheckoutMock,
    });
  });

  it("warns when submitting with an empty cart", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CheckoutForm
        items={[]}
        currency="USD"
        total={0}
        onClear={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText(/email for receipts/i),
      "user@test.com",
    );

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(
      await screen.findByText(/your cart is empty/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Checkout needs attention",
        description: expect.stringMatching(/cart is empty/i),
        variant: "warning",
      }),
    );
  });

  it("surfaces promo errors and keeps non-promo issues", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          code: "promo_invalid",
          issues: ["Promo code expired", "Try another card"],
        }),
    });

    render(
      <CheckoutForm
        items={[baseItem]}
        currency="USD"
        total={2500}
        onClear={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText(/email for receipts/i),
      "buyer@test.com",
    );
    await user.type(screen.getByLabelText(/promo code/i), "summer25");
    await user.click(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    );

    expect(
      await screen.findByText(/that promo code isn't valid/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/try another card/i)).toBeInTheDocument();
    expect(screen.queryByText(/promo code expired/i)).not.toBeInTheDocument();

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.promotionCode).toBe("SUMMER25");

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringMatching(/promo code isn't valid/i),
        variant: "warning",
      }),
    );
  });

  it("handles missing Stripe session ids", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <CheckoutForm
        items={[baseItem]}
        currency="USD"
        total={2500}
        onClear={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText(/email for receipts/i),
      "buyer@test.com",
    );
    await user.click(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    );

    expect(
      await screen.findByText(/stripe session could not be created/i),
    ).toBeInTheDocument();
    expect(getStripePromiseMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        description: expect.stringMatching(/stripe session could not be created/i),
      }),
    );
  });

  it("surfaces Stripe redirect failures", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: "sess_123" }),
    });

    redirectToCheckoutMock.mockResolvedValue({
      error: {
        message: "Stripe redirect failed",
      },
    });

    render(
      <CheckoutForm
        items={[baseItem]}
        currency="USD"
        total={2500}
        onClear={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText(/email for receipts/i),
      "buyer@test.com",
    );
    await user.click(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    );

    expect(
      await screen.findByText(/stripe redirect failed/i),
    ).toBeInTheDocument();
    expect(redirectToCheckoutMock).toHaveBeenCalledWith({
      sessionId: "sess_123",
    });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        description: "Stripe redirect failed",
      }),
    );
  });
});
