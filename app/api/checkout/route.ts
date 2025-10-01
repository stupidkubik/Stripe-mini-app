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
  promotionCode: z.string().trim().max(64).optional(),
});

async function lookupPromotionCode(code: string) {
  try {
    const result = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    return result.data[0] ?? null;
  } catch (error) {
    console.error(`Failed to lookup promotion code ${code}`, error);
    throw error;
  }
}

async function getOriginFromHeaders() {
  const headerList = await Promise.resolve(headers());
  return (
    headerList.get("origin") ??
    headerList.get("referer") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
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

    let promotionCodeId: string | undefined;

    if (parsed.data.promotionCode) {
      const code = parsed.data.promotionCode.trim();
      if (code.length > 0) {
        try {
          const promotion = await lookupPromotionCode(code);
          if (!promotion) {
            return NextResponse.json(
              { error: "Promo code is invalid or inactive." },
              { status: 400 },
            );
          }
          promotionCodeId = promotion.id;
        } catch (error) {
          console.error(`Failed to apply promo code ${code}`, error);
          return NextResponse.json(
            { error: "Unable to apply promo code. Please try again." },
            { status: 500 },
          );
        }
      }
    }

    const metadata: Record<string, string> = {
      cart: JSON.stringify(
        Array.from(lineItemsMap.entries()).map(([priceId, quantity]) => ({
          priceId,
          quantity,
        })),
      ),
    };

    if (parsed.data.promotionCode) {
      metadata.promotion_code = parsed.data.promotionCode;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      ...(promotionCodeId ? { discounts: [{ promotion_code: promotionCodeId }] } : {}),
      customer_email: parsed.data.customerEmail,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
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
