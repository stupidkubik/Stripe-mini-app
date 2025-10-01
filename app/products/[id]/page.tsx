import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPrice } from "@/lib/pricing";
import { getProduct, listProducts } from "@/lib/stripe";
import { ProductPurchaseActions } from "@/components/product-purchase-actions";

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
    <section className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted sm:aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="space-y-2.5 sm:space-y-3">
          <Link
            href="/products"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to catalog
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-primary sm:text-3xl">
            {formatPrice(product.unitAmount, product.currency)}
          </p>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground sm:space-y-4 sm:text-base">
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>No description provided for this product yet.</p>
          )}
        </div>

        <div className="mt-auto">
          <ProductPurchaseActions product={product} />
        </div>
      </div>
    </section>
  );
}
