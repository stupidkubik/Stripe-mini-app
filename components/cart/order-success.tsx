"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";

import type { PaymentEventLog } from "@/lib/payment-events";
import styles from "./order-success.module.css";

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
  paymentEvents?: PaymentEventLog[];
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
  paymentEvents,
}: OrderSuccessProps) {
  const clear = useCart((state) => state.clear);
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    clear();
    setCleared(true);
  }, [clear]);

  const formattedTotal = formatAmount(amountTotal, currency);

  return (
    <section className={styles.section}>
      <div className={styles.titleRow}>
        <CheckCircle2 className={styles.icon} />
        <div>
          <h1 className={styles.heading}>
            Payment successful
          </h1>
          <p className={styles.subtitle}>
            Thank you for your purchase! We&apos;ve emailed you a confirmation.
          </p>
        </div>
      </div>

      {(customerEmail || formattedTotal || sessionId) && (
        <div className={styles.card}>
          <ul className={styles.cardList}>
            {customerEmail && (
              <li>
                <span className={styles.label}>Receipt sent to:</span>{" "}
                {customerEmail}
              </li>
            )}
            {formattedTotal && (
              <li>
                <span className={styles.label}>Order total:</span>{" "}
                {formattedTotal}
              </li>
            )}
            {sessionId && (
              <li>
                <span className={styles.label}>Stripe session:</span>{" "}
                <code className={styles.sessionCode}>
                  {sessionId}
                </code>
              </li>
            )}
          </ul>
        </div>
      )}

      {paymentEvents && paymentEvents.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.label}>Payment status</h2>
          <ul className={styles.timeline}>
            {paymentEvents.map((event) => {
              const amount = formatAmount(event.amount, event.currency ?? currency);
              const timestamp = new Date(event.createdAt);
              const label = event.type === "payment_succeeded" ? "Payment succeeded" : "Payment failed";

              return (
                <li key={event.id} className={styles.timelineItem}>
                  <div className={styles.timelineContent}>
                    <p
                      className={
                        event.type === "payment_succeeded"
                          ? `${styles.timelineLabel} ${styles.timelineLabelSuccess}`
                          : `${styles.timelineLabel} ${styles.timelineLabelError}`
                      }
                    >
                      {label}
                    </p>
                    {amount && <p className={styles.timelineAmount}>{amount}</p>}
                    {event.errorMessage && (
                      <p className={styles.timelineError}>{event.errorMessage}</p>
                    )}
                  </div>
                  <time
                    className={styles.timestamp}
                    dateTime={timestamp.toISOString()}
                    suppressHydrationWarning
                  >
                    {timestamp.toLocaleString()}
                  </time>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {lineItems && lineItems.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.label}>Items in this order</h2>
          <ul className={styles.lineItems}>
            {lineItems.map((item) => {
              const subtotal = formatAmount(item.amountSubtotal, item.currency ?? currency);
              return (
                <li key={item.id} className={styles.lineItem}>
                  <div>
                    <div className={styles.lineItemTitle}>{item.description}</div>
                    <div className={styles.lineItemMeta}>Quantity: {item.quantity}</div>
                  </div>
                  {subtotal && <div className={styles.lineItemTotal}>{subtotal}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={styles.note}>
        <p>
          {cleared
            ? "Your cart has been cleared. Feel free to continue browsing for more products."
            : "Clearing your cart…"}
        </p>
      </div>

      <div className={styles.actions}>
        <Link
          href="/products"
          className={styles.primaryLink}
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
