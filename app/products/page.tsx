import { ProductGrid } from '@/components/product-grid';
import { listProducts } from '@/lib/stripe';

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Products are not available at the moment. Please check back soon.
        </p>
      )}
    </section>
  );
}
