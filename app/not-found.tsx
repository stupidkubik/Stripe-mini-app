import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
          <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden />
          Page not found
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn&apos;t find what you were looking for
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          The page may have been moved or no longer exists. Check the URL or head back to the catalog to continue exploring plants.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="sm:min-w-[200px]">
          <Link href="/products">Browse products</Link>
        </Button>
        <Button asChild variant="ghost" className="sm:min-w-[160px]">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
