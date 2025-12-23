import Link from "next/link";

import { Button } from "@/components/ui/button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div>
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          Page not found
        </span>
        <h1 className={styles.title}>
          We couldn&apos;t find what you were looking for
        </h1>
        <p className={styles.description}>
          The page may have been moved or no longer exists. Check the URL or
          head back to the catalog to continue exploring plants.
        </p>
      </div>

      <div className={styles.actions}>
        <Button asChild size="lg" className={styles.primaryAction}>
          <Link href="/products">Browse products</Link>
        </Button>
        <Button asChild variant="ghost" className={styles.secondaryAction}>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
