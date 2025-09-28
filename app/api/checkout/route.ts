import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

type CheckoutItem = {
  priceId: string;
  quantity?: number;
};

function getOriginFromHeaders() {
  const headerList = headers();
  return headerList.get("origin") ?? headerList.get("referer") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }

    const lineItems = body.items.map((item) => ({
      price: item.priceId,
      quantity: Math.max(1, Math.min(item.quantity ?? 1, 10)),
    }));

    const origin = getOriginFromHeaders();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Failed to create Stripe Checkout session", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
