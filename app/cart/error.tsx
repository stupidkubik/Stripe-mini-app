"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import styles from "../error.module.css";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart page failed to render", error);
  }, [error]);

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Cart unavailable</h1>
      <p className={styles.description}>
        We couldn&apos;t load your cart. Refresh the page or try again shortly.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
