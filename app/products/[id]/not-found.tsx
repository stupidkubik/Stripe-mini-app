import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="text-sm text-muted-foreground">
        The product you&apos;re looking for is unavailable or has been removed.
      </p>
      <Link
        href="/products"
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Back to catalog
      </Link>
    </section>
  );
}
