import { ProductGridSkeleton } from "@/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./loading.module.css";

export default function LoadingProducts() {
  return (
    <section className={styles.section}>
      <Skeleton className={styles.titleSkeleton} />
      <ProductGridSkeleton />
    </section>
  );
}
