import type { Metadata } from "next";

import { ProductGrid } from "@/components/product-grid";
import { listProducts } from "@/lib/stripe";
import styles from "./page.module.css";

export const revalidate = 60;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Catalog | Mini Shop",
  description: "Browse the full Verdant Lane catalog pulled live from Stripe Products and Prices.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Catalog | Mini Shop",
    description: "Explore every plant and accessory available in the Verdant Lane mini shop.",
    url: `${baseUrl}/products`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalog | Mini Shop",
    description: "Explore every plant and accessory available in the Verdant Lane mini shop.",
  },
};

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Products</h1>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className={styles.description}>
          Products are not available at the moment. Please check back soon.
        </p>
      )}
    </section>
  );
}
