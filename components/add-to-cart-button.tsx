"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useCart } from "@/app/store/cart";
import type { ProductDTO } from "@/app/types/product";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/pricing";

type AddToCartButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  product: ProductDTO;
  quantity?: number;
  toastDescription?: string;
  pendingLabel?: string;
};

export function AddToCartButton({
  product,
  quantity = 1,
  toastDescription,
  pendingLabel = "Adding…",
  children,
  disabled,
  ...buttonProps
}: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();

  const handleAdd = () => {
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
        quantity,
      );

      toast({
        title: "Added to cart",
        description:
          toastDescription ??
          `${product.name} • ${formatPrice(product.unitAmount, product.currency)}`,
      });
    });
  };

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={disabled || pending}
      {...buttonProps}
    >
      {pending
        ? pendingLabel
        : children ?? (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              Add to cart
            </>
          )}
    </Button>
  );
}
