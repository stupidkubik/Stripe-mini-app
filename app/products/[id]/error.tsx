"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product detail failed to load", error);
  }, [error]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t load this product. Try again and if the problem persists, please
        contact support.
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
