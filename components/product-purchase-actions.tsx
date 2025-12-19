"use client";

import * as React from "react";

import type { ProductDTO } from "@/app/types/product";

import { QuantityInput } from "./quantity-input";
import { AddToCartButton } from "./add-to-cart-button";
import styles from "./product-purchase-actions.module.css";

const MAX_QUANTITY = 10;

type ProductPurchaseActionsProps = {
  product: ProductDTO;
};

export function ProductPurchaseActions({
  product,
}: ProductPurchaseActionsProps) {
  const [quantity, setQuantity] = React.useState(1);

  return (
    <div className={styles.actions}>
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
        className={styles.addButton}
      />
    </div>
  );
}
