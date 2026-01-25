"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { ProductDTO } from "@/app/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCategory,
  formatLight,
  formatWatering,
  getRatingPlaceholder,
  getShowcaseTag,
} from "@/lib/product-metadata";
import { formatPrice } from "@/lib/pricing";
import { QuantityInput } from "@/components/quantity-input";
import { useCart } from "@/app/store/cart";
import styles from "./product-card.module.css";

type Props = { product: ProductDTO };

const MAX_QUANTITY = 10;

type ProductCardMediaProps = {
  product: ProductDTO;
  productHref: string;
};

const ProductCardMedia = React.memo(function ProductCardMedia({
  product,
  productHref,
}: ProductCardMediaProps) {
  return (
    <Link href={productHref} className={styles.imageLink}>
      <div className={styles.imageWrapper}>
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
  );
});

ProductCardMedia.displayName = "ProductCardMedia";

type ProductCardDetailsProps = {
  product: ProductDTO;
  titleId: string;
  descriptionId: string;
};

const ProductCardDetails = React.memo(function ProductCardDetails({
  product,
  titleId,
  descriptionId,
}: ProductCardDetailsProps) {
  const showcaseTag = getShowcaseTag(product.id, product.metadata?.slug);
  const rating = getRatingPlaceholder(product.id, product.metadata?.slug);
  const ratingLabel = `Rating ${rating.value.toFixed(1)} out of 5`;
  const showcaseLabel =
    showcaseTag === "new"
      ? "Новинка"
      : showcaseTag === "hit"
        ? "Хит"
        : undefined;

  const metaBadges = [
    formatCategory(product.metadata?.category),
    formatLight(product.metadata?.light),
    formatWatering(product.metadata?.watering),
  ].filter((badge): badge is string => Boolean(badge));

  return (
    <>
      <h3 id={titleId} className={styles.title}>
        {product.name}
      </h3>
      <p className={styles.price}>
        {formatPrice(product.unitAmount, product.currency)}
      </p>
      <div className={styles.showcaseRow}>
        {showcaseLabel && (
          <span
            className={`${styles.highlightBadge} ${
              showcaseTag === "new"
                ? styles.highlightBadgeNew
                : styles.highlightBadgeHit
            }`}
          >
            {showcaseLabel}
          </span>
        )}
        <span className={styles.rating} aria-label={ratingLabel}>
          <span className={styles.ratingIcon} aria-hidden="true">
            ★
          </span>
          <span>{rating.value.toFixed(1)}</span>
          <span className={styles.ratingCount}>({rating.count})</span>
        </span>
      </div>
      {metaBadges.length > 0 && (
        <div className={styles.metaBadges}>
          {metaBadges.map((badge, index) => (
            <span key={`${badge}-${index}`} className={styles.metaBadge}>
              {badge}
            </span>
          ))}
        </div>
      )}

      <p id={descriptionId} className={styles.description}>
        {product.description || "—"}
      </p>
    </>
  );
});

ProductCardDetails.displayName = "ProductCardDetails";

const ProductCard = React.memo(function ProductCard({ product }: Props) {
  const idPrefix = `product-card-${product.id}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const productSlug = product.metadata?.slug ?? product.id;
  const productHref = `/products/${encodeURIComponent(productSlug)}`;

  const { cartItem, updateQty, removeItem } = useCart(
    useShallow((state) => ({
      cartItem: state.items.find((item) => item.productId === product.id),
      updateQty: state.updateQty,
      removeItem: state.removeItem,
    })),
  );

  const handleQuantityChange = React.useCallback(
    (nextQuantity: number) => {
      const clamped = Math.max(0, Math.min(nextQuantity, MAX_QUANTITY));

      if (clamped === 0) {
        removeItem(product.id);
        return;
      }

      updateQty(product.id, clamped);
    },
    [product.id, removeItem, updateQty],
  );

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={styles.card}
    >
      <ProductCardMedia product={product} productHref={productHref} />

      <div className={styles.content}>
        <ProductCardDetails
          product={product}
          titleId={titleId}
          descriptionId={descriptionId}
        />

        <div className={styles.actions}>
          <Link href={productHref} className={styles.detailsLink}>
            View details
          </Link>
          {cartItem ? (
            <QuantityInput
              value={cartItem.quantity}
              onChange={handleQuantityChange}
              min={0}
              max={MAX_QUANTITY}
              ariaLabel={`Quantity for ${product.name}`}
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
});

ProductCard.displayName = "ProductCard";

export { ProductCard };

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
