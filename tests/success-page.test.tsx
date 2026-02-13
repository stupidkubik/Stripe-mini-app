import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super(`redirect:${url}`);
    this.url = url;
  }
}

const { stripeMock, redirectMock } = vi.hoisted(() => ({
  stripeMock: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
  redirectMock: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

vi.mock("@/components/cart/order-success", () => ({
  __esModule: true,
  default: () => null,
}));

const loadPage = async () => await import("@/app/success/page");

const baseSession = {
  id: "cs_123",
  payment_status: "paid",
  currency: "usd",
  created: 1700000000,
  amount_total: 5000,
  amount_subtotal: undefined,
  total_details: { amount_discount: 500 },
  customer_details: { email: "buyer@example.com" },
  payment_intent: "pi_123",
  metadata: {
    promotion_code: "META20",
    payment_confirmed_at: "1700000200000",
  },
  discounts: [{ promotion_code: { code: "PROMO20" } }],
  line_items: {
    data: [
      {
        id: "li_1",
        quantity: 2,
        amount_subtotal: 3000,
        currency: "usd",
        description: "Line item",
        price: {
          unit_amount: 1500,
          currency: "usd",
          product: {
            id: "prod_1",
            name: "Fern",
            images: ["https://example.com/fern.png"],
          },
        },
      },
    ],
  },
};

describe("Success page", () => {
  beforeEach(() => {
    stripeMock.checkout.sessions.retrieve.mockReset();
    redirectMock.mockClear();
    delete process.env.DEMO_SUCCESS;
    delete process.env.NEXT_PUBLIC_DEMO_SUCCESS;
  });

  it("redirects when session_id is missing", async () => {
    const { default: SuccessPage } = await loadPage();

    await expect(
      SuccessPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith("/cart");
  });

  it("redirects when payment is not confirmed", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      id: "cs_unpaid",
      payment_status: "unpaid",
    });

    const { default: SuccessPage } = await loadPage();

    await expect(
      SuccessPage({
        searchParams: Promise.resolve({ session_id: "cs_unpaid" }),
      }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith("/cart");
  });

  it("returns order summary with derived props", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue(baseSession);

    const { default: SuccessPage } = await loadPage();

    const element = await SuccessPage({
      searchParams: Promise.resolve({ session_id: "cs_123" }),
    });
    const props = (element as { props: Record<string, unknown> }).props;

    expect(props).toMatchObject({
      sessionId: "cs_123",
      amountTotal: 5000,
      amountSubtotal: 3000,
      amountDiscount: 500,
      promoCode: "META20",
      currency: "usd",
      customerEmail: "buyer@example.com",
    });

    expect(props.lineItems).toEqual([
      {
        id: "li_1",
        description: "Fern",
        quantity: 2,
        unitAmount: 1500,
        amountSubtotal: 3000,
        currency: "USD",
        image: "https://example.com/fern.png",
      },
    ]);

    expect(props.timelineSteps).toMatchObject([
      { label: "Order placed" },
      { label: "Payment confirmed", timestamp: 1700000200000 },
      { label: "Receipt emailed" },
    ]);
  });

  it("uses discount promo code when metadata is missing", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      ...baseSession,
      metadata: {},
      discounts: [{ promotion_code: { code: "PROMO20" } }],
    });

    const { default: SuccessPage } = await loadPage();

    const element = await SuccessPage({
      searchParams: Promise.resolve({ session_id: "cs_123" }),
    });
    const props = (element as { props: Record<string, unknown> }).props;

    expect(props.promoCode).toBe("PROMO20");
  });

  it("normalizes line items when price details are missing", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      ...baseSession,
      payment_intent: { id: "pi_obj" },
      metadata: {},
      discounts: [],
      amount_subtotal: undefined,
      currency: "eur",
      line_items: {
        data: [
          {
            id: "li_missing",
            quantity: 2,
            amount_subtotal: 5000,
            description: "Fallback item",
            price: null,
          },
        ],
      },
    });

    const { default: SuccessPage } = await loadPage();

    const element = await SuccessPage({
      searchParams: Promise.resolve({ session_id: "cs_123" }),
    });
    const props = (element as { props: Record<string, unknown> }).props;

    expect(props.promoCode).toBeNull();
    expect(props.amountSubtotal).toBe(5000);
    expect(props.lineItems).toEqual([
      {
        id: "li_missing",
        description: "Fallback item",
        quantity: 2,
        unitAmount: 2500,
        amountSubtotal: 5000,
        currency: "EUR",
        image: null,
      },
    ]);
  });

  it("allows preview when demo mode is enabled", async () => {
    process.env.DEMO_SUCCESS = "true";
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      ...baseSession,
      payment_status: "unpaid",
    });

    const { default: SuccessPage } = await loadPage();

    const element = await SuccessPage({
      searchParams: Promise.resolve({ session_id: "cs_123", preview: "1" }),
    });

    expect(redirectMock).not.toHaveBeenCalled();
    const props = (element as { props: Record<string, unknown> }).props;
    expect(props.sessionId).toBe("cs_123");
  });

  it("does not allow preview from public env flag alone", async () => {
    process.env.NEXT_PUBLIC_DEMO_SUCCESS = "true";
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      ...baseSession,
      payment_status: "unpaid",
    });

    const { default: SuccessPage } = await loadPage();

    await expect(
      SuccessPage({
        searchParams: Promise.resolve({ session_id: "cs_123", preview: "1" }),
      }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith("/cart");
  });
});
