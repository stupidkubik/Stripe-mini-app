"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import styles from "../../error.module.css";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product detail failed to load", error);
  }, [error]);

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.description}>
        We couldn&apos;t load this product. Try again and if the problem
        persists, please contact support.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
