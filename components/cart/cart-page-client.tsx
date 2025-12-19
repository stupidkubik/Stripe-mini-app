"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import { QuantityInput } from "@/components/quantity-input";
import { CheckoutForm } from "@/components/cart/checkout-form";
import CartStickySummary from "@/components/cart/cart-sticky-summary";
import styles from "./cart-page-client.module.css";

export default function CartPageClient() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQty = useCart((state) => state.updateQty);
  const clear = useCart((state) => state.clear);
  const total = useCart((state) => state.total());
  const count = useCart((state) => state.count());

  const currency = items[0]?.currency ?? "USD";

  if (items.length === 0) {
    return (
      <section className={`${styles.page} ${styles.pageEmpty}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Your cart</h1>
          <p className={styles.subtitle}>
            You haven&apos;t added anything yet. Discover products and come back
            when you&apos;re ready.
          </p>
        </header>

        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>Your cart is empty.</p>
          <Link
            href="/products"
            className={styles.emptyLink}
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your cart</h1>
        <p className={styles.subtitle}>
          {count} item{count === 1 ? "" : "s"} ready for checkout.
        </p>
      </header>

      <div className={styles.layout}>
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
                  sizes="128px"
                />
              </div>

              <div className={styles.itemContent}>
                <div>
                  <h2 className={styles.itemName}>
                    {item.name}
                  </h2>
                  <p className={styles.itemPrice}>
                    {formatPrice(item.unitAmount, item.currency)}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <QuantityInput
                    value={item.quantity}
                    onChange={(qty) => updateQty(item.productId, qty)}
                    aria-label={`Quantity for ${item.name}`}
                    size="lg"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.removeButton}
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.checkoutColumn}>
          <div id="cart-checkout" className={styles.checkoutAnchor}>
            <CheckoutForm
              items={items}
              currency={currency}
              total={total}
              onClear={clear}
            />
          </div>
        </div>
      </div>

      <CartStickySummary />
    </section>
  );
}

export function CartPageSkeleton() {
  return (
    <section className={styles.skeletonPage}>
      <div className={styles.skeletonHeader}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonLayout}>
        <div className={styles.skeletonItems}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className={styles.skeletonItem} />
          ))}
        </div>
        <Skeleton className={styles.skeletonSidebar} />
      </div>
    </section>
  );
}
