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
import styles from "./checkout-form.module.css";

const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  promoCode: z
    .string()
    .trim()
    .max(64, "Promo code is too long")
    .optional(),
});

const CHECKOUT_ERROR_COPY: Record<string, string> = {
  cart_empty: "Your cart is empty. Add an item before checking out.",
  item_unavailable: "Some items in your cart are no longer available. Remove them and try again.",
  promo_invalid: "That promo code isn't valid or active.",
  promo_apply_failed: "We couldn't apply that promo code. Try again or remove it.",
  invalid_payload: "Please review your cart details and try again.",
  checkout_failed: "We couldn't start checkout. Please try again.",
};

const PROMO_ERROR_CODES = new Set(["promo_invalid", "promo_apply_failed"]);
const WARNING_ERROR_CODES = new Set([
  "cart_empty",
  "item_unavailable",
  "promo_invalid",
  "promo_apply_failed",
  "invalid_payload",
]);

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutErrorPayload = {
  error?: string;
  code?: string;
  issues?: string[];
};

type CheckoutFormProps = {
  items: CartItem[];
  currency: string;
  total: number;
  onClear: () => void;
};

function resolveCheckoutError(payload?: CheckoutErrorPayload | null) {
  if (!payload) {
    return {
      message: CHECKOUT_ERROR_COPY.checkout_failed,
      issues: [],
      code: undefined,
    };
  }

  const code = payload.code;
  const message =
    payload.error ||
    (code && CHECKOUT_ERROR_COPY[code]) ||
    CHECKOUT_ERROR_COPY.checkout_failed;

  return {
    message,
    issues: payload.issues?.filter(Boolean) ?? [],
    code,
  };
}

export function CheckoutForm({ items, currency, total, onClear }: CheckoutFormProps) {
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formIssues, setFormIssues] = React.useState<string[]>([]);
  const helperId = "checkout-email-helper";
  const errorId = "checkout-email-error";
  const promoHelperId = "checkout-promo-helper";
  const promoErrorId = "checkout-promo-error";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      promoCode: "",
    },
  });

  const handleCheckoutError = React.useCallback(
    (payload?: CheckoutErrorPayload | null) => {
      const resolved = resolveCheckoutError(payload);
      const promoIssue = resolved.issues.find((issue) =>
        issue.toLowerCase().includes("promo code"),
      );
      const promoMessage =
        (resolved.code && PROMO_ERROR_CODES.has(resolved.code) && resolved.message) || promoIssue;
      const issues = promoIssue
        ? resolved.issues.filter((issue) => issue !== promoIssue)
        : resolved.issues;
      const variant = resolved.code && WARNING_ERROR_CODES.has(resolved.code) ? "warning" : "destructive";

      setFormIssues(issues);

      if (promoMessage) {
        setFormError(null);
        setError("promoCode", { type: "server", message: promoMessage });
      } else {
        setFormError(resolved.message);
      }

      toast({
        title: "Checkout needs attention",
        description: promoMessage ?? resolved.message,
        variant,
      });
    },
    [setError, setFormError, setFormIssues, toast],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (items.length === 0) {
      handleCheckoutError({ code: "cart_empty" });
      return;
    }

    setFormError(null);
    setFormIssues([]);
    clearErrors("promoCode");

    const promotionCode = values.promoCode?.trim();
    const normalizedPromotionCode = promotionCode ? promotionCode.toUpperCase() : undefined;

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
          promotionCode: normalizedPromotionCode,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { sessionId?: string; error?: string; code?: string; issues?: string[] }
        | null;

      if (!response.ok) {
        handleCheckoutError(payload);
        return;
      }

      const sessionId = payload?.sessionId;
      if (!sessionId) {
        handleCheckoutError({ error: "Stripe session could not be created", code: "checkout_failed" });
        return;
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
        error instanceof Error ? error.message : CHECKOUT_ERROR_COPY.checkout_failed;
      handleCheckoutError({ error: message });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className={styles.form}
      noValidate
    >
      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.totalValue}>{formatPrice(total, currency)}</span>
      </div>
      <p id={helperId} className={styles.helper}>
        Taxes and shipping are calculated at checkout. Payments are processed securely via Stripe.
      </p>

      <div className={styles.field}>
        <label htmlFor="checkout-email" className={styles.label}>
          Email for receipts
        </label>
        <Input
          id="checkout-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? `${helperId} ${errorId}` : helperId}
          {...register("email")}
        />
        {errors.email && (
          <p id={errorId} role="alert" className={styles.error}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="checkout-promo" className={styles.label}>
          Promo code (optional)
        </label>
        <Input
          id="checkout-promo"
          type="text"
          inputMode="text"
          placeholder="SUMMER25"
          autoComplete="off"
          aria-invalid={errors.promoCode ? "true" : "false"}
          aria-describedby={errors.promoCode ? `${promoHelperId} ${promoErrorId}` : promoHelperId}
          {...register("promoCode")}
        />
        <p id={promoHelperId} className={styles.helper}>
          Enter an active Stripe promotion code to apply it at checkout.
        </p>
        {errors.promoCode && (
          <p id={promoErrorId} role="alert" className={styles.error}>
            {errors.promoCode.message}
          </p>
        )}
      </div>

      {(formError || formIssues.length > 0) && (
        <div role="alert" className={styles.issues} aria-live="polite">
          {formError && <p>{formError}</p>}
          {formIssues.length > 0 && (
            <ul className={styles.issuesList}>
              {formIssues.map((issue, index) => (
                <li key={`${issue}-${index}`}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button
        type="submit"
        className={styles.actionButton}
        size="lg"
        disabled={isSubmitting || items.length === 0}
      >
        {isSubmitting ? "Redirecting…" : "Proceed to checkout"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={styles.actionButton}
        onClick={onClear}
        disabled={isSubmitting || items.length === 0}
      >
        Clear cart
      </Button>
    </form>
  );
}
