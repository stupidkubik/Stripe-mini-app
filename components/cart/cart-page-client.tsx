"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import { QuantityInput } from "@/components/quantity-input";
import { CheckoutForm } from "@/components/cart/checkout-form";

export default function CartPageClient() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQty = useCart((state) => state.updateQty);
  const clear = useCart((state) => state.clear);
  const total = useCart((state) => state.total());
  const count = useCart((state) => state.count());

  const currency = items[0]?.currency ?? "USD";

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
                  <QuantityInput
                    value={item.quantity}
                    onChange={(qty) => updateQty(item.productId, qty)}
                    aria-label={`Quantity for ${item.name}`}
                  />

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

        <CheckoutForm
          items={items}
          currency={currency}
          total={total}
          onClear={clear}
        />
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
