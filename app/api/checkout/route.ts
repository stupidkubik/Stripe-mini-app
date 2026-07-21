import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { z } from "zod";

import { getSiteOrigin } from "@/lib/config/server";
import {
  checkCheckoutRateLimit,
  reserveStripeApiBudget,
} from "@/lib/rate-limit";
import {
  parsePositiveInt,
  readRequestText,
  RequestBodyTooLargeError,
} from "@/lib/request-body";
import { logServerError } from "@/lib/server-log";
import { isStorefrontCurrency } from "@/lib/storefront-policy";
import { getProductByPriceId, stripe } from "@/lib/stripe";

const checkoutItemSchema = z.object({
  priceId: z.string().min(1, "Price ID is missing for one of the items."),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .max(10, "Quantity cannot exceed 10.")
    .default(1),
});

const requestSchema = z.object({
  customerEmail: z.string().email().optional(),
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your cart is empty.")
    .max(10, "Your cart has too many different items."),
  promotionCode: z.string().trim().max(64).optional(),
});

const CHECKOUT_ERROR_CODES = {
  invalidPayload: "invalid_payload",
  cartEmpty: "cart_empty",
  itemUnavailable: "item_unavailable",
  currencyMismatch: "currency_mismatch",
  promoInvalid: "promo_invalid",
  promoApplyFailed: "promo_apply_failed",
  rateLimited: "rate_limited",
  payloadTooLarge: "payload_too_large",
  checkoutFailed: "checkout_failed",
} as const;
const STRIPE_METADATA_VALUE_LIMIT = 500;
const RECEIPT_TOKEN_COOKIE = "checkout_receipt_token";
const RECEIPT_TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;
const DEFAULT_CHECKOUT_BODY_LIMIT_BYTES = 16 * 1024;

async function lookupPromotionCode(code: string) {
  const result = await stripe.promotionCodes.list({
    code,
    active: true,
    limit: 1,
  });

  return result.data[0] ?? null;
}

function normalizeMetadata(
  metadata: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      value.slice(0, STRIPE_METADATA_VALUE_LIMIT),
    ]),
  );
}

export async function POST(request: Request) {
  try {
    const headerList = await Promise.resolve(headers());
    const rateLimit = checkCheckoutRateLimit(headerList);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many checkout attempts. Please wait a moment and try again.",
          code: CHECKOUT_ERROR_CODES.rateLimited,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    let json: unknown = null;

    try {
      const body = await readRequestText(
        request,
        parsePositiveInt(
          process.env.CHECKOUT_MAX_BODY_BYTES,
          DEFAULT_CHECKOUT_BODY_LIMIT_BYTES,
        ),
      );
      json = JSON.parse(body);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json(
          {
            error: "Checkout request is too large.",
            code: CHECKOUT_ERROR_CODES.payloadTooLarge,
          },
          { status: 413 },
        );
      }
    }

    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Some checkout details need your attention.",
          code: CHECKOUT_ERROR_CODES.invalidPayload,
          issues: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const uniquePriceIds = Array.from(
      new Set(parsed.data.items.map((item) => item.priceId)),
    );
    const hasPromotionCode = Boolean(parsed.data.promotionCode?.trim());
    const stripeCallBudget = reserveStripeApiBudget(
      uniquePriceIds.length + (hasPromotionCode ? 1 : 0) + 1,
    );

    if (!stripeCallBudget.allowed) {
      return NextResponse.json(
        {
          error:
            "Checkout is temporarily busy. Please wait a moment and try again.",
          code: CHECKOUT_ERROR_CODES.rateLimited,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(stripeCallBudget.retryAfterSeconds),
          },
        },
      );
    }

    const validPriceIds = new Set<string>();

    for (const priceId of uniquePriceIds) {
      const product = await getProductByPriceId(priceId);

      if (!product) {
        return NextResponse.json(
          {
            error: "One of the items in your cart is no longer available.",
            code: CHECKOUT_ERROR_CODES.itemUnavailable,
          },
          { status: 400 },
        );
      }

      if (!isStorefrontCurrency(product.currency)) {
        return NextResponse.json(
          {
            error: "Your cart contains an unsupported currency.",
            code: CHECKOUT_ERROR_CODES.currencyMismatch,
          },
          { status: 400 },
        );
      }

      validPriceIds.add(priceId);
    }

    const lineItemsMap = new Map<string, number>();

    for (const item of parsed.data.items) {
      if (!validPriceIds.has(item.priceId)) {
        return NextResponse.json(
          {
            error: "One of the items in your cart is no longer available.",
            code: CHECKOUT_ERROR_CODES.itemUnavailable,
          },
          { status: 400 },
        );
      }

      const current = lineItemsMap.get(item.priceId) ?? 0;
      lineItemsMap.set(item.priceId, Math.min(current + item.quantity, 10));
    }

    if (lineItemsMap.size === 0) {
      return NextResponse.json(
        { error: "Your cart is empty.", code: CHECKOUT_ERROR_CODES.cartEmpty },
        { status: 400 },
      );
    }

    const lineItems = Array.from(lineItemsMap.entries()).map(
      ([price, quantity]) => ({
        price,
        quantity,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 10,
        },
      }),
    );

    const origin = getSiteOrigin();

    let promotionCodeId: string | undefined;

    if (parsed.data.promotionCode) {
      const code = parsed.data.promotionCode.trim();
      if (code.length > 0) {
        try {
          const promotion = await lookupPromotionCode(code);
          if (!promotion) {
            return NextResponse.json(
              {
                error: "Promo code is invalid or inactive.",
                code: CHECKOUT_ERROR_CODES.promoInvalid,
              },
              { status: 400 },
            );
          }
          promotionCodeId = promotion.id;
        } catch (error) {
          logServerError("stripe.checkout.promotion.lookup", error);
          return NextResponse.json(
            {
              error: "Unable to apply promo code. Please try again.",
              code: CHECKOUT_ERROR_CODES.promoApplyFailed,
            },
            { status: 500 },
          );
        }
      }
    }

    const totalItemsInCart = Array.from(lineItemsMap.values()).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
    const metadata: Record<string, string> = {
      cart_item_count: String(totalItemsInCart),
      cart_unique_items: String(lineItemsMap.size),
    };
    const receiptToken = randomUUID();
    metadata.receipt_token = receiptToken;

    if (parsed.data.promotionCode) {
      metadata.promotion_code = parsed.data.promotionCode;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      allow_promotion_codes: false,
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : {}),
      customer_email: parsed.data.customerEmail,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: normalizeMetadata(metadata),
    });

    const response = NextResponse.json({ sessionId: session.id });
    response.headers.append(
      "Set-Cookie",
      `${RECEIPT_TOKEN_COOKIE}=${receiptToken}; Max-Age=${RECEIPT_TOKEN_MAX_AGE_SECONDS}; Path=/success; HttpOnly; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return response;
  } catch (error) {
    logServerError("stripe.checkout.process", error);
    return NextResponse.json(
      {
        error: "Unable to start checkout. Please try again.",
        code: CHECKOUT_ERROR_CODES.checkoutFailed,
      },
      { status: 500 },
    );
  }
}
