"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import styles from "../error.module.css";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Products page failed to load", error);
  }, [error]);

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Unable to load products</h1>
      <p className={styles.description}>
        Something went wrong while fetching the catalog. Please try again in a
        moment.
      </p>
      <Button onClick={reset}>Retry</Button>
    </section>
  );
}
