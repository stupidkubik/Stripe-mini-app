"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductDTO } from "@/app/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import { QuantityInput } from "@/components/quantity-input";
import { useCart } from "@/app/store/cart";
import styles from "./product-card.module.css";

type Props = { product: ProductDTO };

const MAX_QUANTITY = 10;

export function ProductCard({ product }: Props) {
  const idPrefix = `product-card-${product.id}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;

  const cartItem = useCart((state) =>
    state.items.find((item) => item.productId === product.id),
  );
  const updateQty = useCart((state) => state.updateQty);
  const removeItem = useCart((state) => state.removeItem);

  const handleQuantityChange = (nextQuantity: number) => {
    const clamped = Math.max(0, Math.min(nextQuantity, MAX_QUANTITY));

    if (clamped === 0) {
      removeItem(product.id);
      return;
    }

    updateQty(product.id, clamped);
  };

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={styles.card}
    >
      <Link href={`/products/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          {/* Если используешь внешние домены — добавь их в next.config.js -> images.domains */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 100vw"
            className={styles.image}
            priority={false}
          />
        </div>
      </Link>

      <div className={styles.content}>
        <h3 id={titleId} className={styles.title}>
          {product.name}
        </h3>
        <p className={styles.price}>
          {formatPrice(product.unitAmount, product.currency)}
        </p>

        <p id={descriptionId} className={styles.description}>
          {product.description || "—"}
        </p>

        <div className={styles.actions}>
          <Link
            href={`/products/${product.id}`}
            className={styles.detailsLink}
          >
            View details
          </Link>
          {cartItem ? (
            <QuantityInput
              value={cartItem.quantity}
              onChange={handleQuantityChange}
              min={0}
              max={MAX_QUANTITY}
              aria-label={`Quantity for ${product.name}`}
            />
          ) : (
            <AddToCartButton
              product={product}
              size="sm"
              className={styles.addButton}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton className={styles.skeletonMedia} />
      <div className={styles.skeletonBody}>
        <Skeleton className={styles.skeletonLineShort} />
        <Skeleton className={styles.skeletonLinePrice} />
        <Skeleton className={styles.skeletonLineFull} />
        <Skeleton className={styles.skeletonLineLong} />
        <div className={styles.skeletonActions}>
          <Skeleton className={styles.skeletonButton} />
        </div>
      </div>
    </div>
  );
}
