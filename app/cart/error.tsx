"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart page failed to render", error);
  }, [error]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Cart unavailable</h1>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t load your cart. Refresh the page or try again shortly.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
