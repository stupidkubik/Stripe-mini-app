import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import type Stripe from "stripe";

import OrderSuccess from "@/components/cart/order-success";
import { stripe } from "@/lib/stripe";

const searchParamsSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
});

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export const metadata: Metadata = {
  title: "Payment success | Mini Shop",
  description: "Stripe checkout confirmation page for Mini Shop orders.",
};

export const dynamic = "force-dynamic";

function isActiveProduct(product: Stripe.Product | Stripe.DeletedProduct): product is Stripe.Product {
  return !("deleted" in product) || product.deleted !== true;
}

function normalizeLineItems(session: Stripe.Checkout.Session) {
  const items = session.line_items?.data ?? [];

  return items.map((item) => {
    const price = item.price;
    const product =
      price && typeof price.product === "object" && isActiveProduct(price.product)
        ? price.product
        : null;

    return {
      id: item.id,
      description: product?.name ?? item.description ?? "Checkout item",
      quantity: item.quantity ?? 0,
      amountSubtotal: item.amount_subtotal ?? undefined,
      currency: (item.currency ?? session.currency ?? "USD").toUpperCase(),
      image: product?.images?.[0] ?? null,
    };
  });
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
        expand: ["line_items", "line_items.data.price.product"],
      },
    );

    if (!session || session.payment_status !== "paid") {
      redirect("/cart");
    }

    const lineItems = normalizeLineItems(session);

    return (
      <OrderSuccess
        sessionId={session.id}
        amountTotal={session.amount_total}
        currency={session.currency}
        customerEmail={session.customer_details?.email}
        lineItems={lineItems}
      />
    );
  } catch (error) {
    console.error("Failed to retrieve checkout session", error);
    redirect("/cart");
  }
}
