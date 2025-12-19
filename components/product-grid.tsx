"use client";

import * as React from "react";

import { ProductDTO } from "../app/types/product";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import styles from "./product-grid.module.css";

const INITIAL_VISIBLE = 12;
const LOAD_BATCH = 8;

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(products.length, INITIAL_VISIBLE),
  );
  const sentinelRef = React.useRef<HTMLLIElement | null>(null);

  React.useEffect(() => {
    setVisibleCount(Math.min(products.length, INITIAL_VISIBLE));
  }, [products]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= products.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(products.length, prev + LOAD_BATCH),
          );
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [visibleCount, products.length]);

  const displayedProducts = React.useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );

  const hasMore = visibleCount < products.length;

  return (
    <ul className={styles.grid} role="list">
      {displayedProducts.map((p) => (
        <li key={p.id} className={styles.item}>
          <ProductCard product={p} />
        </li>
      ))}
      {hasMore && (
        <li
          key="sentinel"
          ref={sentinelRef}
          aria-hidden
          className={styles.sentinel}
        />
      )}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={styles.grid} role="list" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className={styles.item}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
