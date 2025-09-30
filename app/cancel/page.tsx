import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";

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
    <main className="container mx-auto flex min-h-[60vh] flex-col justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden />
          Checkout cancelled
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Your payment was cancelled
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          No charges were made. You can revisit your cart, adjust quantities, and submit the checkout again whenever you&apos;re ready.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="sm:min-w-[200px]">
          <Link href="/cart">Return to cart</Link>
        </Button>
        <Button asChild variant="ghost" className="sm:min-w-[160px]">
          <Link href="/products">Continue browsing</Link>
        </Button>
      </div>
    </main>
  );
}
