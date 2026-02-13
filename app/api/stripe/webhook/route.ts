import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { recordPaymentEvent } from "@/lib/payment-events";
import { checkRouteRateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET is not set. Add it to your environment before receiving Stripe webhooks.",
  );
}

const webhookSecret: string = STRIPE_WEBHOOK_SECRET;

export const runtime = "nodejs";

function resolvePaymentIntentId(
  primary: Stripe.Checkout.Session["payment_intent"] | undefined,
) {
  if (!primary) {
    return undefined;
  }

  return typeof primary === "string" ? primary : primary.id;
}

export async function POST(request: Request) {
  const headerList = await Promise.resolve(headers());
  const rateLimit = checkRouteRateLimit("webhook", headerList);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many webhook requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await request.text();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    console.warn("Stripe webhook received without Stripe-Signature header");
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error(
        "Stripe webhook signature verification failed",
        error.message,
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.error(
      "Unexpected error while verifying Stripe webhook signature",
      error,
    );
    return NextResponse.json(
      { error: "Unable to process webhook" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        recordPaymentEvent({
          id: event.id,
          type: "payment_succeeded",
          createdAt: event.created * 1000,
          sessionId: session.id,
          paymentIntentId: resolvePaymentIntentId(
            session.payment_intent ?? undefined,
          ),
          amount: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email ?? null,
        });
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        let relatedSessionId = paymentIntent.metadata?.checkout_session_id;

        if (!relatedSessionId) {
          try {
            const sessions = await stripe.checkout.sessions.list({
              payment_intent: paymentIntent.id,
              limit: 1,
            });

            relatedSessionId = sessions.data[0]?.id;
          } catch (lookupError) {
            console.error(
              `Failed to lookup Checkout Session for failed payment intent ${paymentIntent.id}`,
              lookupError,
            );
          }
        }

        recordPaymentEvent({
          id: event.id,
          type: "payment_failed",
          createdAt: event.created * 1000,
          sessionId: relatedSessionId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail:
            paymentIntent.receipt_email ??
            paymentIntent.last_payment_error?.payment_method?.billing_details
              ?.email ??
            null,
          errorMessage: paymentIntent.last_payment_error?.message ?? null,
        });
        break;
      }
      default: {
        console.info(`Unhandled Stripe webhook event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to process Stripe webhook event", event.type, error);
    return NextResponse.json(
      { error: "Webhook handler failure" },
      { status: 500 },
    );
  }
}
