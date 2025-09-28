"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Products page failed to load", error);
  }, [error]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Unable to load products</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while fetching the catalog. Please try again in a moment.
      </p>
      <Button onClick={reset}>Retry</Button>
    </section>
  );
}
