import type { Metadata } from "next";
import Link from "next/link";

import CancelCartSummary from "@/components/cart/cancel-cart-summary";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Checkout cancelled | Mini Shop",
  description: "Stripe checkout cancellation page for Mini Shop orders.",
};

export default function CancelPage() {
  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          Checkout cancelled
        </span>
        <h1 className={styles.title}>Your payment was cancelled</h1>
        <p className={styles.description}>
          No charges were made. Your cart is saved below, so you can adjust
          quantities and try checkout again whenever you&apos;re ready.
        </p>

        <div className={styles.actions}>
          <Button asChild size="lg" className={styles.primaryAction}>
            <Link href="/cart">Try checkout again</Link>
          </Button>
          <Button asChild variant="ghost" className={styles.secondaryAction}>
            <Link href="/products">Continue browsing</Link>
          </Button>
        </div>
      </div>

      <CancelCartSummary />
    </section>
  );
}
