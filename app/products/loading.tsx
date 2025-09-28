import { ProductGridSkeleton } from "@/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <ProductGridSkeleton />
    </section>
  );
}
