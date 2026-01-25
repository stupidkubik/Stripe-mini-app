"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import styles from "./cart-sticky-summary.module.css";

export default function CartStickySummary() {
  const { count, total, currency } = useCart(
    useShallow((state) => ({
      count: state.count(),
      total: state.total(),
      currency: state.items[0]?.currency ?? "USD",
    })),
  );

  if (count === 0) {
    return null;
  }

  return (
    <div className={styles.bar}>
      <div className={cn("page-container", styles.inner)}>
        <div className={styles.meta}>
          <div className={styles.label}>Total</div>
          <div className={styles.total}>{formatPrice(total, currency)}</div>
          <div className={styles.count}>
            {count} item{count === 1 ? "" : "s"} in cart
          </div>
        </div>
        <Button asChild size="lg" className={styles.cta}>
          <Link href="#cart-checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
