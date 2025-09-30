"use client";

import * as React from "react";

import type { ProductDTO } from "@/app/types/product";

import { QuantityInput } from "./quantity-input";
import { AddToCartButton } from "./add-to-cart-button";

const MAX_QUANTITY = 10;

type ProductPurchaseActionsProps = {
  product: ProductDTO;
};

export function ProductPurchaseActions({
  product,
}: ProductPurchaseActionsProps) {
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityInput
        value={quantity}
        onChange={setQuantity}
        max={MAX_QUANTITY}
        aria-label={`Quantity for ${product.name}`}
      />
      <AddToCartButton
        product={product}
        quantity={quantity}
        size="lg"
        className="h-11 sm:h-12 sm:min-w-[200px]"
      />
    </div>
  );
}
