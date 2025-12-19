import { Skeleton } from "@/components/ui/skeleton";
import styles from "./loading.module.css";

export default function ProductDetailLoading() {
  return (
    <section className={styles.section}>
      <Skeleton className={styles.imageSkeleton} />
      <div className={styles.content}>
        <Skeleton className={styles.lineSmall} />
        <Skeleton className={styles.lineTitle} />
        <Skeleton className={styles.linePrice} />
        <Skeleton className={styles.lineParagraph} />
        <Skeleton className={styles.lineButton} />
      </div>
    </section>
  );
}
