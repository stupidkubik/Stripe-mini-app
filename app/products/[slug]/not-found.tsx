import Link from "next/link";

import { Button } from "@/components/ui/button";
import styles from "../../error.module.css";

export default function ProductNotFound() {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Product not found</h1>
      <p className={styles.description}>
        The product you&apos;re looking for is unavailable or has been removed.
      </p>
      <Button asChild>
        <Link href="/products">Back to catalog</Link>
      </Button>
    </section>
  );
}
