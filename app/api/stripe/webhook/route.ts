import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getOrderStore, type OrderEventInput } from "@/lib/order-store";
import {
  parsePositiveInt,
  readRequestText,
  RequestBodyTooLargeError,
} from "@/lib/request-body";
import { logServerError } from "@/lib/server-log";
import { stripe } from "@/lib/stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET is not set. Add it to your environment before receiving Stripe webhooks.",
  );
}

const webhookSecret: string = STRIPE_WEBHOOK_SECRET;
const DEFAULT_WEBHOOK_BODY_LIMIT_BYTES = 1024 * 1024;

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
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      { status: 400 },
    );
  }

  let body: string;

  try {
    body = await readRequestText(
      request,
      parsePositiveInt(
        process.env.STRIPE_WEBHOOK_MAX_BODY_BYTES,
        DEFAULT_WEBHOOK_BODY_LIMIT_BYTES,
      ),
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { error: "Webhook payload is too large" },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { error: "Unable to read webhook payload" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      logServerError("stripe.webhook.verify", error, "warn");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    logServerError("stripe.webhook.verify", error);
    return NextResponse.json(
      { error: "Unable to process webhook" },
      { status: 400 },
    );
  }

  try {
    let orderEvent: OrderEventInput | undefined;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        orderEvent = {
          eventId: event.id,
          eventType: event.type,
          eventCreatedAt: event.created * 1000,
          sessionId: session.id,
          paymentIntentId: resolvePaymentIntentId(
            session.payment_intent ?? undefined,
          ),
          amount: session.amount_total,
          currency: session.currency,
          status: "paid",
        };
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
            logServerError(
              "stripe.webhook.checkout-session.lookup",
              lookupError,
            );
          }
        }

        orderEvent = {
          eventId: event.id,
          eventType: event.type,
          eventCreatedAt: event.created * 1000,
          sessionId: relatedSessionId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "failed",
        };
        break;
      }
      default: {
        console.info(`Unhandled Stripe webhook event type: ${event.type}`);
      }
    }

    if (orderEvent) {
      await getOrderStore().processEvent(orderEvent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logServerError("stripe.webhook.process", error);
    return NextResponse.json(
      { error: "Webhook handler failure" },
      { status: 500 },
    );
  }
}
