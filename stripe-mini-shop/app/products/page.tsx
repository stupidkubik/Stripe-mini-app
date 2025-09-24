import { ProductGrid, ProductGridSkeleton } from '@/components/product-grid';
import { ProductDTO } from '@/app/types/product';

// Здесь ты обычно подтягиваешь продукты со Stripe на сервере (SSR/ISR)
// Ниже — заглушка для первых шагов:
async function getProducts(): Promise<ProductDTO[]> {
  return [
    {
      id: 'prod_1',
      name: 'Minimal Tee',
      description: '100% cotton. Clean cut.',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
      priceId: 'price_1',
      currency: 'EUR',
      unitAmount: 2900,
    },
    // ...
  ];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      {/* пока нет загрузки с сервера можно убрать скелетон;
         оставлю пример, если будешь делать suspense */}
      {/* <Suspense fallback={<ProductGridSkeleton count={8} />}> */}
      <ProductGrid products={products} />
      {/* </Suspense> */}
    </section>
  );
}
