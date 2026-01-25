"use client";

import * as React from "react";

import { ProductDTO } from "../app/types/product";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import styles from "./product-grid.module.css";

const INITIAL_VISIBLE = 8;
const LOAD_BATCH = 8;

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(products.length, INITIAL_VISIBLE),
  );
  const [sentinel, setSentinel] = React.useState<HTMLLIElement | null>(null);
  const productsLengthRef = React.useRef(products.length);
  const setSentinelRef = React.useCallback(
    (node: HTMLLIElement | null) => {
      setSentinel(node);
    },
    [],
  );

  React.useEffect(() => {
    setVisibleCount(Math.min(products.length, INITIAL_VISIBLE));
  }, [products]);

  React.useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  React.useEffect(() => {
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            prev >= productsLengthRef.current
              ? prev
              : Math.min(productsLengthRef.current, prev + LOAD_BATCH),
          );
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinel]);

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
          ref={setSentinelRef}
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
