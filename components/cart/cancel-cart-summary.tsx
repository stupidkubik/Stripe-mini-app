"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import styles from "./cancel-cart-summary.module.css";

export default function CancelCartSummary() {
  const items = useCart((state) => state.items);
  const total = useCart((state) => state.total());
  const count = useCart((state) => state.count());
  const currency = items[0]?.currency ?? "USD";

  if (items.length === 0) {
    return (
      <section className={styles.emptyCard}>
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptyText}>
          Add a product from the catalog, then try checkout again.
        </p>
        <Button asChild className={styles.emptyButton}>
          <Link href="/products">Browse products</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className={styles.summary}>
      <header className={styles.summaryHeader}>
        <div>
          <h2 className={styles.summaryTitle}>Your cart</h2>
          <p className={styles.summarySubtitle}>
            {count} item{count === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total</div>
          <div className={styles.totalValue}>
            {formatPrice(total, currency)}
          </div>
        </div>
      </header>

      <div className={styles.items}>
        {items.map((item) => (
          <div
            key={item.productId}
            className={styles.itemCard}
          >
            <div className={styles.itemImage}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="80px"
              />
            </div>

            <div className={styles.itemContent}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemMeta}>
                {formatPrice(item.unitAmount, item.currency)} · Qty {item.quantity}
              </div>
            </div>

            <div className={styles.itemTotal}>
              {formatPrice(item.unitAmount * item.quantity, item.currency)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
