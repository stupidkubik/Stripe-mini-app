import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPrice } from "@/lib/pricing";
import { getProduct, listProducts } from "@/lib/stripe";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";
import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product not found",
      description: "The requested product could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const relativeUrl = `/products/${product.id}`;
  const absoluteUrl = new URL(relativeUrl, baseUrl).toString();
  const ogImage = product.image ?? "/opengraph-image";

  return {
    title: `${product.name} | Mini Shop`,
    description: product.description ?? undefined,
    alternates: {
      canonical: relativeUrl,
    },
    openGraph: {
      type: "website",
      url: absoluteUrl,
      title: `${product.name} | Mini Shop`,
      description: product.description ?? undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Mini Shop`,
      description: product.description ?? undefined,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <section className={styles.page}>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <Link
            href="/products"
            className={styles.backLink}
          >
            ← Back to catalog
          </Link>
          <h1 className={styles.title}>
            {product.name}
          </h1>
          <p className={styles.price}>
            {formatPrice(product.unitAmount, product.currency)}
          </p>
        </div>

        <div className={styles.description}>
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>No description provided for this product yet.</p>
          )}
        </div>

        <div className={styles.actions}>
          <ProductPurchaseActions product={product} />
        </div>
      </div>
    </section>
  );
}
