import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import CancelCartSummary from "@/components/cart/cancel-cart-summary";
import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";
import styles from "./page.module.css";

const searchParamsSchema = z.object({
  session_id: z.string().min(1, "session_id is required"),
});

export const metadata: Metadata = {
  title: "Checkout cancelled | Mini Shop",
  description: "Stripe checkout cancellation page for Mini Shop orders.",
};

export const dynamic = "force-dynamic";

type CancelPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const parsed = searchParamsSchema.safeParse(await searchParams);

  if (!parsed.success) {
    redirect("/cart");
  }

  try {
    await stripe.checkout.sessions.retrieve(parsed.data.session_id);
  } catch (error) {
    console.error("Failed to retrieve cancelled checkout session", error);
    redirect("/cart");
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          Checkout cancelled
        </span>
        <h1 className={styles.title}>
          Your payment was cancelled
        </h1>
        <p className={styles.description}>
          No charges were made. Your cart is saved below, so you can adjust quantities and try checkout again whenever you&apos;re ready.
        </p>

        <div className={styles.actions}>
          <Button asChild size="lg" className={styles.primaryAction}>
            <Link href="/cart">Try checkout again</Link>
          </Button>
          <Button asChild variant="ghost" className={styles.secondaryAction}>
            <Link href="/products">Continue browsing</Link>
          </Button>
        </div>
      </div>

      <CancelCartSummary />
    </section>
  );
}
