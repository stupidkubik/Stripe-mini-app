"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";

type SuccessLineItem = {
  id: string;
  description: string;
  quantity: number;
  amountSubtotal?: number;
  currency?: string;
  image?: string | null;
};

type OrderSuccessProps = {
  sessionId?: string;
  amountTotal?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  lineItems?: SuccessLineItem[];
};

function formatAmount(amount?: number | null, currency?: string | null) {
  if (amount == null || currency == null) {
    return null;
  }
  try {
    return formatPrice(amount, currency.toUpperCase());
  } catch {
    return null;
  }
}

export default function OrderSuccess({
  sessionId,
  amountTotal,
  currency,
  customerEmail,
  lineItems,
}: OrderSuccessProps) {
  const clear = useCart((state) => state.clear);
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    clear();
    setCleared(true);
  }, [clear]);

  const formattedTotal = formatAmount(amountTotal, currency);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Payment successful
          </h1>
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase! We&apos;ve emailed you a confirmation.
          </p>
        </div>
      </div>

      {(customerEmail || formattedTotal || sessionId) && (
        <div className="rounded-2xl border bg-card p-6 text-sm">
          <ul className="space-y-2 text-muted-foreground">
            {customerEmail && (
              <li>
                <span className="font-medium text-foreground">Receipt sent to:</span>{" "}
                {customerEmail}
              </li>
            )}
            {formattedTotal && (
              <li>
                <span className="font-medium text-foreground">Order total:</span>{" "}
                {formattedTotal}
              </li>
            )}
            {sessionId && (
              <li>
                <span className="font-medium text-foreground">Stripe session:</span>{" "}
                <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {sessionId}
                </code>
              </li>
            )}
          </ul>
        </div>
      )}

      {lineItems && lineItems.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-base font-medium text-foreground">Items in this order</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {lineItems.map((item) => {
              const subtotal = formatAmount(item.amountSubtotal, item.currency ?? currency);
              return (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-foreground">{item.description}</div>
                    <div className="text-xs">Quantity: {item.quantity}</div>
                  </div>
                  {subtotal && <div className="font-medium text-foreground">{subtotal}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        <p>
          {cleared
            ? "Your cart has been cleared. Feel free to continue browsing for more products."
            : "Clearing your cart…"}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Continue shopping
        </Link>
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
