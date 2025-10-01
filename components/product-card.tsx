"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductDTO } from "@/app/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/pricing";
import { QuantityInput } from "@/components/quantity-input";
import { useCart } from "@/app/store/cart";

type Props = { product: ProductDTO };

const MAX_QUANTITY = 10;

export function ProductCard({ product }: Props) {
  const idPrefix = `product-card-${product.id}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;

  const cartItem = useCart((state) =>
    state.items.find((item) => item.productId === product.id),
  );
  const updateQty = useCart((state) => state.updateQty);
  const removeItem = useCart((state) => state.removeItem);

  const handleQuantityChange = (nextQuantity: number) => {
    const clamped = Math.max(0, Math.min(nextQuantity, MAX_QUANTITY));

    if (clamped === 0) {
      removeItem(product.id);
      return;
    }

    updateQty(product.id, clamped);
  };

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/90 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {/* Если используешь внешние домены — добавь их в next.config.js -> images.domains */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 id={titleId} className="mb-1 line-clamp-1 text-sm font-medium text-foreground">
          {product.name}
        </h3>
        <p className="mb-2 text-lg font-semibold sm:mb-3">
          {formatPrice(product.unitAmount, product.currency)}
        </p>

        <p id={descriptionId} className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {product.description || "—"}
        </p>

        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View details
          </Link>
          {cartItem ? (
            <QuantityInput
              value={cartItem.quantity}
              onChange={handleQuantityChange}
              min={0}
              max={MAX_QUANTITY}
              aria-label={`Quantity for ${product.name}`}
            />
          ) : (
            <AddToCartButton product={product} size="sm" />
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
