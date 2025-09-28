import type { Metadata } from "next";

import CartPageClient from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Your cart | Mini Shop",
  description: "Review your cart items and proceed to Stripe checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
