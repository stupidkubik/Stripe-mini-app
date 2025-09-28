import type { Metadata } from "next";

import OrderSuccess from "@/components/cart/order-success";

export const metadata: Metadata = {
  title: "Payment success | Mini Shop",
  description: "Stripe checkout confirmation page for Mini Shop orders.",
};

export default function SuccessPage() {
  return <OrderSuccess />;
}
