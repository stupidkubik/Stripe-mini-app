import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/stripe";

export const revalidate = 60;

type FeatureIconName = "shield" | "sparkle" | "truck";

const FEATURED_ICONS: ReadonlyArray<{ title: string; description: string; icon: FeatureIconName }> = [
  {
    title: "Stripe-secured checkout",
    description: "Run end-to-end payments in test mode, including 3D Secure flows.",
    icon: "shield",
  },
  {
    title: "Carefully sourced",
    description: "Small-batch growers and sustainable greenhouses—no mass-market clones.",
    icon: "sparkle",
  },
  {
    title: "Delivered thriving",
    description: "Climate-controlled packaging keeps foliage lush from nursery to doorstep.",
    icon: "truck",
  },
];

function FeatureIcon({ icon }: { icon: FeatureIconName }) {
  const className = "h-5 w-5 text-primary";
  switch (icon) {
    case "shield":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
          aria-hidden
        >
          <path d="M12 3 5 6v6c0 5 4 7 7 9 3-2 7-4 7-9V6l-7-3Z" />
        </svg>
      );
    case "truck":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
          aria-hidden
        >
          <path d="M3 7a1 1 0 0 1 1-1h10v9H4a1 1 0 0 1-1-1V7Zm11 0h3l4 4v3a1 1 0 0 1-1 1h-6V7Z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
        </svg>
      );
    case "sparkle":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={className}
          aria-hidden
        >
          <path d="M12 3v4m0 10v4m7-7h-4M9 12H5m13.5-6.5L16 8m-8 8-2.5 2.5M7.5 5.5 10 8m8 8 2.5 2.5" />
        </svg>
      );
  }
}

export default async function HomePage() {
  const products = await listProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-24">
      <section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden />
            Verdant Lane • Houseplant studio
          </span>

          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Bring calm, living greenery into any room
            </h1>
            <p className="text-pretty text-lg text-muted-foreground">
              Verdant Lane curates resilient indoor plants, pots, and care kits. Explore the collection,
              add favorites to your cart, and experience a production-grade Stripe checkout in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="sm:min-w-[200px]">
              <Link href="/products">Explore catalog</Link>
            </Button>
            <Button asChild variant="outline" className="sm:min-w-[160px]">
              <Link href="/cart">View cart</Link>
            </Button>
          </div>

          <dl className="grid gap-6 sm:grid-cols-3">
            {FEATURED_ICONS.map((feature) => (
              <div key={feature.title} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <FeatureIcon icon={feature.icon} />
                  <dt className="text-sm font-medium text-foreground">{feature.title}</dt>
                </div>
                <dd className="mt-3 text-sm text-muted-foreground">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1459664018906-085c36f472af?auto=format&fit=crop&w=1600&q=80"
            alt="Sunlit living room filled with houseplants"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-white/70 p-4 text-xs text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-black/40">
            <p className="font-medium text-foreground">Real checkout, gentle onboarding</p>
            <p>Add a plant to your cart, use Stripe test cards, and see the full fulfillment loop in action.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Featured foliage</h2>
            <p className="text-sm text-muted-foreground">
              Pulled straight from Stripe Products & Prices; refreshed every minute via ISR.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/products">View all products</Link>
          </Button>
        </div>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No plants available yet. Seed your Stripe account and refresh to grow the collection.
          </div>
        )}
      </section>
    </div>
  );
}
