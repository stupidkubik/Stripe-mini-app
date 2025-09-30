"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { CartItem } from "@/app/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/pricing";
import { getStripePromise } from "@/lib/stripe-client";

const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  items: CartItem[];
  currency: string;
  total: number;
  onClear: () => void;
};

export function CheckoutForm({ items, currency, total, onClear }: CheckoutFormProps) {
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add an item before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    setFormError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: values.email,
          items: items.map((item) => ({
            priceId: item.priceId,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { sessionId?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to initiate checkout");
      }

      const sessionId = payload?.sessionId;
      if (!sessionId) {
        throw new Error("Stripe session could not be created");
      }

      const stripe = await getStripePromise();
      if (!stripe) {
        throw new Error("Stripe.js failed to load. Check your publishable key.");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed. Please try again.";
      setFormError(message);
      toast({
        title: "Checkout error",
        description: message,
        variant: "destructive",
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3.5 sm:space-y-4 rounded-2xl border bg-card p-5 text-sm shadow-sm sm:p-6"
      noValidate
    >
      <div className="flex items-center justify-between text-sm font-medium text-foreground sm:text-base">
        <span>Total</span>
        <span className="text-lg font-semibold">{formatPrice(total, currency)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Taxes and shipping are calculated at checkout. Payments are processed securely via Stripe.
      </p>

      <div className="space-y-2">
        <label htmlFor="checkout-email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Email for receipts
        </label>
        <Input
          id="checkout-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {formError && <p className="text-xs text-destructive">{formError}</p>}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting || items.length === 0}
      >
        {isSubmitting ? "Redirecting…" : "Proceed to checkout"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onClear}
        disabled={isSubmitting || items.length === 0}
      >
        Clear cart
      </Button>
    </form>
  );
}
