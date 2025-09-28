"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/pricing";
import { getStripePromise } from "@/lib/stripe-client";

const MAX_QUANTITY = 10;

export default function CartPageClient() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQty = useCart((state) => state.updateQty);
  const clear = useCart((state) => state.clear);
  const total = useCart((state) => state.total());
  const count = useCart((state) => state.count());

  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = React.useState(false);

  const currency = items[0]?.currency ?? "USD";

  const handleDecrement = (productId: string, quantity: number) => {
    if (quantity <= 1) {
      removeItem(productId);
      return;
    }

    updateQty(productId, quantity - 1);
  };

  const handleIncrement = (productId: string, quantity: number) => {
    if (quantity >= MAX_QUANTITY) {
      return;
    }

    updateQty(productId, quantity + 1);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      return;
    }

    setCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            priceId: item.priceId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Failed to initiate checkout");
      }

      const { sessionId } = (await response.json()) as { sessionId?: string };
      if (!sessionId) {
        throw new Error("Stripe session could not be created");
      }

      const stripe = await getStripePromise();
      if (!stripe) {
        throw new Error(
          "Stripe.js failed to load. Check your publishable key.",
        );
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      toast({
        title: "Checkout error",
        description: message,
        variant: "destructive",
      });
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added anything yet. Discover products and come back
            when you&apos;re ready.
          </p>
        </header>

        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <p className="text-sm text-muted-foreground">
          {count} item{count === 1 ? "" : "s"} ready for checkout.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <h2 className="text-base font-medium text-foreground sm:text-lg">
                    {item.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.unitAmount, item.currency)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border bg-background px-2 py-1 text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        handleDecrement(item.productId, item.quantity)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        handleIncrement(item.productId, item.quantity)
                      }
                      aria-label="Increase quantity"
                      disabled={item.quantity >= MAX_QUANTITY}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 rounded-2xl border bg-card p-6 text-sm">
          <div className="flex items-center justify-between text-base text-foreground">
            <span>Total</span>
            <span className="text-lg font-semibold">
              {formatPrice(total, currency)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Taxes and shipping are calculated at checkout. Payments are
            processed securely via Stripe.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? "Redirecting…" : "Checkout"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={clear}>
            Clear cart
          </Button>
        </aside>
      </div>
    </section>
  );
}

export function CartPageSkeleton() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    </section>
  );
}
