"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";

import styles from "./order-success.module.css";

type SuccessLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmount?: number | null;
  amountSubtotal?: number;
  currency?: string;
  image?: string | null;
};

type TimelineStep = {
  id: string;
  label: string;
  description?: string;
  timestamp?: number;
  status: "complete" | "pending";
};

type OrderSuccessProps = {
  sessionId?: string;
  amountTotal?: number | null;
  amountSubtotal?: number | null;
  amountDiscount?: number | null;
  promoCode?: string | null;
  currency?: string | null;
  customerEmail?: string | null;
  lineItems?: SuccessLineItem[];
  timelineSteps?: TimelineStep[];
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
  amountSubtotal,
  amountDiscount,
  promoCode,
  currency,
  customerEmail,
  lineItems,
  timelineSteps,
}: OrderSuccessProps) {
  const clear = useCart((state) => state.clear);
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    clear();
    setCleared(true);
  }, [clear]);

  const formattedTotal = formatAmount(amountTotal, currency);
  const formattedSubtotal = formatAmount(amountSubtotal ?? undefined, currency);
  const shouldShowDiscount =
    typeof amountDiscount === "number" && amountDiscount > 0;
  const formattedDiscount = shouldShowDiscount
    ? formatAmount(amountDiscount, currency)
    : null;

  return (
    <section className={styles.section}>
      <div className={styles.titleRow}>
        <CheckCircle2 className={styles.icon} />
        <div>
          <h1 className={styles.heading}>Payment successful</h1>
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
                <code className={styles.sessionCode}>{sessionId}</code>
              </li>
            )}
          </ul>
        </div>
      )}

      {timelineSteps && timelineSteps.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.label}>Order timeline</h2>
          <ul className={styles.stepList}>
            {timelineSteps.map((step) => {
              const timestamp = step.timestamp
                ? new Date(step.timestamp)
                : null;
              const isComplete = step.status === "complete";

              return (
                <li key={step.id} className={styles.stepItem}>
                  <span
                    className={
                      isComplete
                        ? styles.stepIconComplete
                        : styles.stepIconPending
                    }
                    aria-hidden
                  >
                    <CheckCircle2 />
                  </span>
                  <div className={styles.stepBody}>
                    <div className={styles.stepHeader}>
                      <p className={styles.stepTitle}>{step.label}</p>
                      {timestamp && (
                        <time
                          className={styles.stepTime}
                          dateTime={timestamp.toISOString()}
                          suppressHydrationWarning
                        >
                          {timestamp.toLocaleString()}
                        </time>
                      )}
                    </div>
                    {step.description && (
                      <p className={styles.stepDescription}>
                        {step.description}
                      </p>
                    )}
                  </div>
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
              const subtotal = formatAmount(
                item.amountSubtotal,
                item.currency ?? currency,
              );
              const unitAmount =
                item.unitAmount != null
                  ? formatAmount(item.unitAmount, item.currency ?? currency)
                  : null;

              return (
                <li key={item.id} className={styles.lineItem}>
                  <div className={styles.lineItemInfo}>
                    {item.image && (
                      <div className={styles.lineItemImage}>
                        <Image
                          src={item.image}
                          alt={item.description}
                          fill
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div>
                      <div className={styles.lineItemTitle}>
                        {item.description}
                      </div>
                      <div className={styles.lineItemMeta}>
                        Qty {item.quantity}
                        {unitAmount ? ` • ${unitAmount}` : ""}
                      </div>
                    </div>
                  </div>
                  {subtotal && (
                    <div className={styles.lineItemTotal}>{subtotal}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className={styles.totals}>
            {formattedSubtotal && (
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
            )}
            {formattedDiscount && (
              <div className={styles.totalRow}>
                <span>
                  {promoCode ? `Promo code (${promoCode})` : "Discount"}
                </span>
                <span>-{formattedDiscount}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <span>{formattedTotal ?? "—"}</span>
            </div>
          </div>
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
        <Link href="/products" className={styles.primaryLink}>
          Continue shopping
        </Link>
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
