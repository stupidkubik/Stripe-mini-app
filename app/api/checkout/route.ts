import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { z } from "zod";

import { listProducts, stripe } from "@/lib/stripe";

const checkoutItemSchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
  quantity: z
    .number()
    .int()
    .positive()
    .max(10)
    .default(1),
});

const requestSchema = z.object({
  customerEmail: z.string().email().optional(),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
});

async function getOriginFromHeaders() {
  const headerList = await Promise.resolve(headers());
  return (
    headerList.get("origin") ??
    headerList.get("referer") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid checkout payload",
          issues: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const products = await listProducts();
    const allowedPrices = new Map(products.map((product) => [product.priceId, product]));

    const lineItemsMap = new Map<string, number>();

    for (const item of parsed.data.items) {
      const product = allowedPrices.get(item.priceId);
      if (!product) {
        return NextResponse.json(
          { error: "One of the items in your cart is no longer available." },
          { status: 400 },
        );
      }

      const current = lineItemsMap.get(item.priceId) ?? 0;
      lineItemsMap.set(item.priceId, Math.min(current + item.quantity, 10));
    }

    if (lineItemsMap.size === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lineItems = Array.from(lineItemsMap.entries()).map(([price, quantity]) => ({
      price,
      quantity,
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
        maximum: 10,
      },
    }));

    const origin = await getOriginFromHeaders();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_email: parsed.data.customerEmail,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        cart: JSON.stringify(
          Array.from(lineItemsMap.entries()).map(([priceId, quantity]) => ({
            priceId,
            quantity,
          })),
        ),
      },
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
