'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/pricing';
import { useCart } from '@/app/store/cart';
import { ProductDTO } from '@/app/types/product';

type Props = { product: ProductDTO };

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();

  const onAdd = () => {
    startTransition(() => {
      addItem(
        {
          productId: product.id,
          priceId: product.priceId,
          name: product.name,
          image: product.image,
          unitAmount: product.unitAmount,
          currency: product.currency,
        },
        1,
      );
      toast({
        title: 'Added to cart',
        description: `${product.name} • ${formatPrice(product.unitAmount, product.currency)}`,
      });
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground transition-shadow hover:shadow-lg">
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

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 line-clamp-1 text-sm text-muted-foreground">{product.name}</div>
        <div className="mb-3 text-lg font-semibold">
          {formatPrice(product.unitAmount, product.currency)}
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {product.description || '—'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View details
          </Link>
          <Button size="sm" disabled={pending} onClick={onAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            {pending ? 'Adding…' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
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
