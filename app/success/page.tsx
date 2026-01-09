import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import type Stripe from "stripe";

import OrderSuccess from "@/components/cart/order-success";
import { stripe } from "@/lib/stripe";

const searchParamsSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
  preview: z.string().optional(),
});

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export const metadata: Metadata = {
  title: "Payment success | Mini Shop",
  description: "Stripe checkout confirmation page for Mini Shop orders.",
};

export const dynamic = "force-dynamic";

function isActiveProduct(
  product: Stripe.Product | Stripe.DeletedProduct,
): product is Stripe.Product {
  return !("deleted" in product) || product.deleted !== true;
}

function normalizeLineItems(session: Stripe.Checkout.Session) {
  const items = session.line_items?.data ?? [];

  return items.map((item) => {
    const price = item.price;
    const product =
      price &&
      typeof price.product === "object" &&
      isActiveProduct(price.product)
        ? price.product
        : null;
    const quantity = item.quantity ?? 1;
    const unitAmount =
      price?.unit_amount ??
      (item.amount_subtotal != null && quantity > 0
        ? Math.round(item.amount_subtotal / quantity)
        : null);

    return {
      id: item.id,
      description: product?.name ?? item.description ?? "Checkout item",
      quantity,
      unitAmount,
      amountSubtotal: item.amount_subtotal ?? undefined,
      currency: (item.currency ?? session.currency ?? "USD").toUpperCase(),
      image: product?.images?.[0] ?? null,
    };
  });
}

function resolvePromotionCode(session: Stripe.Checkout.Session) {
  const fromMetadata =
    typeof session.metadata?.promotion_code === "string"
      ? session.metadata?.promotion_code
      : null;

  if (fromMetadata) {
    return fromMetadata;
  }

  const discount = session.discounts?.[0];
  if (!discount) {
    return null;
  }

  const promotion =
    discount.promotion_code && typeof discount.promotion_code === "object"
      ? discount.promotion_code
      : null;

  return promotion?.code ?? null;
}

function parseMetadataTimestamp(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const raw = metadata?.[key];
  if (typeof raw !== "string") {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolvePaymentConfirmedAt(session: Stripe.Checkout.Session) {
  const fromMetadata = parseMetadataTimestamp(
    session.metadata ?? undefined,
    "payment_confirmed_at",
  );
  if (typeof fromMetadata === "number") {
    return fromMetadata;
  }

  const paymentIntent =
    session.payment_intent && typeof session.payment_intent === "object"
      ? session.payment_intent
      : null;
  const latestCharge =
    paymentIntent?.latest_charge &&
    typeof paymentIntent.latest_charge === "object"
      ? paymentIntent.latest_charge
      : null;

  if (typeof latestCharge?.created === "number") {
    return latestCharge.created * 1000;
  }

  if (typeof paymentIntent?.created === "number") {
    return paymentIntent.created * 1000;
  }

  return session.created ? session.created * 1000 : undefined;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const parsed = searchParamsSchema.safeParse(await searchParams);

  if (!parsed.success) {
    redirect("/cart");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.session_id,
      {
        expand: [
          "line_items",
          "line_items.data.price.product",
          "discounts",
          "discounts.promotion_code",
          "payment_intent",
          "payment_intent.latest_charge",
        ],
      },
    );

    const allowPreview =
      parsed.data.preview === "1" &&
      (process.env.NEXT_PUBLIC_DEMO_SUCCESS === "true" ||
        process.env.NODE_ENV === "development");

    if (!session || (session.payment_status !== "paid" && !allowPreview)) {
      redirect("/cart");
    }

    const lineItems = normalizeLineItems(session);
    const orderPlacedAt = session.created ? session.created * 1000 : undefined;
    const paymentConfirmedAt = resolvePaymentConfirmedAt(session);
    const receiptSentAt = session.customer_details?.email
      ? paymentConfirmedAt
      : undefined;
    const promoCode = resolvePromotionCode(session);

    const amountSubtotal =
      session.amount_subtotal ??
      (lineItems.length > 0
        ? lineItems.reduce((sum, item) => sum + (item.amountSubtotal ?? 0), 0)
        : undefined);
    const amountDiscount = session.total_details?.amount_discount ?? undefined;

    return (
      <OrderSuccess
        sessionId={session.id}
        amountTotal={session.amount_total}
        amountSubtotal={amountSubtotal}
        amountDiscount={amountDiscount}
        promoCode={promoCode}
        currency={session.currency}
        customerEmail={session.customer_details?.email}
        lineItems={lineItems}
        timelineSteps={[
          {
            id: "order-placed",
            label: "Order placed",
            description: "We saved your items and locked in pricing.",
            timestamp: orderPlacedAt,
            status: "complete",
          },
          {
            id: "payment-confirmed",
            label: "Payment confirmed",
            description: "Stripe verified the payment details.",
            timestamp: paymentConfirmedAt,
            status: "complete",
          },
          {
            id: "receipt-sent",
            label: "Receipt emailed",
            description: session.customer_details?.email
              ? `Sent to ${session.customer_details.email}`
              : "Receipt is on the way.",
            timestamp: receiptSentAt,
            status: "complete",
          },
        ]}
      />
    );
  } catch (error) {
    console.error("Failed to retrieve checkout session", error);
    redirect("/cart");
  }
}
