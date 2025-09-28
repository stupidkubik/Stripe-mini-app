"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/app/store/cart";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const clear = useCart((state) => state.clear);
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    clear();
    setCleared(true);
  }, [clear]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Payment successful
          </h1>
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase! We&apos;ve emailed you a confirmation.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        <p>
          {cleared
            ? "Your cart has been cleared. Feel free to continue browsing for more products."
            : "Clearing your cart…"}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Continue shopping
        </Link>
        <Button asChild variant="ghost">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
