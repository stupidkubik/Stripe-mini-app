import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/stripe";
import styles from "./page.module.css";

export const revalidate = 60;

type FeatureIconName = "shield" | "sparkle" | "truck";

const FEATURED_ICONS: ReadonlyArray<{
  title: string;
  description: string;
  icon: FeatureIconName;
}> = [
  {
    title: "Stripe-secured checkout",
    description:
      "Run end-to-end payments in test mode, including 3D Secure flows.",
    icon: "shield",
  },
  {
    title: "Carefully sourced",
    description:
      "Small-batch growers and sustainable greenhouses—no mass-market clones.",
    icon: "sparkle",
  },
  {
    title: "Delivered thriving",
    description:
      "Climate-controlled packaging keeps foliage lush from nursery to doorstep.",
    icon: "truck",
  },
];

const TECH_HIGHLIGHTS = [
  {
    title: "Stripe-first data layer",
    description:
      "Products and prices sync from Stripe, with promo codes validated server-side before Checkout.",
  },
  {
    title: "Next.js App Router + ISR",
    description:
      "Catalog pages cache via ISR, with dynamic Open Graph, sitemap, and robots endpoints.",
  },
  {
    title: "Testing + CI feedback loops",
    description:
      "Vitest and Playwright suites ship with coverage and workflow badges for quick QA.",
  },
];

const LEARNING_NOTES = [
  {
    title: "Checkout UX under real constraints",
    description:
      "Handling promo errors, empty carts, and Stripe redirects without breaking the flow.",
  },
  {
    title: "Clear server/client boundaries",
    description:
      "Keeping Stripe logic server-only while the cart stays fast and responsive in the browser.",
  },
  {
    title: "Production-minded edge cases",
    description:
      "Validating price IDs, throttling quantities, and surfacing webhook outcomes on success.",
  },
  {
    title: "Storytelling for demos",
    description:
      "Combining feature highlights with friendly copy to make the build portfolio-ready.",
  },
];

function FeatureIcon({ icon }: { icon: FeatureIconName }) {
  const className = styles.featureIcon;
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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden />
            Verdant Lane • Houseplant studio
          </span>

          <div>
            <h1 className={styles.heroTitle}>
              Bring calm, living greenery into any room
            </h1>
            <p className={styles.heroText}>
              Verdant Lane curates resilient indoor plants, pots, and care kits.
              Explore the collection, add favorites to your cart, and experience
              a production-grade Stripe checkout in minutes.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Button asChild size="lg" className={styles.primaryAction}>
              <Link href="/products">Explore catalog</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={styles.secondaryAction}
            >
              <Link href="/cart">View cart</Link>
            </Button>
          </div>
        </div>

        <div className={styles.heroImage}>
          <Image
            src="https://images.unsplash.com/photo-1459664018906-085c36f472af?auto=format&fit=crop&w=1600&q=80"
            alt="Sunlit living room filled with houseplants"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
          <div className={styles.heroCaption}>
            <strong>Real checkout, gentle onboarding</strong>
            <p>
              Add a plant to your cart, use Stripe test cards, and see the full
              fulfillment loop in action.
            </p>
          </div>
        </div>

        <dl className={styles.features}>
          {FEATURED_ICONS.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <FeatureIcon icon={feature.icon} />
                <dt className={styles.featureTitle}>{feature.title}</dt>
              </div>
              <dd className={styles.featureDescription}>
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Featured foliage</h2>
            <p className={styles.sectionText}>
              Pulled straight from Stripe Products & Prices; refreshed every
              minute via ISR.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/products">View all products</Link>
          </Button>
        </div>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className={styles.emptyCard}>
            No plants available yet. Seed your Stripe account and refresh to
            grow the collection.
          </div>
        )}
      </section>

      <section className={styles.portfolioSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Tech highlights</h2>
            <p className={styles.sectionText}>
              Quick snapshots of the engineering focus areas behind the demo.
            </p>
          </div>
        </div>
        <div className={styles.portfolioGrid}>
          {TECH_HIGHLIGHTS.map((item) => (
            <article key={item.title} className={styles.portfolioCard}>
              <h3 className={styles.portfolioTitle}>{item.title}</h3>
              <p className={styles.portfolioText}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.learningSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>What I learned</h2>
            <p className={styles.sectionText}>
              The takeaways that shaped how this build came together.
            </p>
          </div>
        </div>
        <div className={styles.learningGrid}>
          {LEARNING_NOTES.map((item, index) => (
            <article key={item.title} className={styles.learningCard}>
              <span className={styles.learningIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.learningTitle}>{item.title}</h3>
                <p className={styles.learningText}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
