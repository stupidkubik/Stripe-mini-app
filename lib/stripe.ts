import "server-only";

import Stripe from "stripe";
import { cache } from "react";

import type { ProductDTO } from "@/app/types/product";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-08-27.basil";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to your environment before calling Stripe helpers.",
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

function normalizeProduct(
  product: Stripe.Product,
  price: Stripe.Price,
): ProductDTO | null {
  if (price.unit_amount == null || !price.currency) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? FALLBACK_IMAGE,
    priceId: price.id,
    currency: price.currency.toUpperCase(),
    unitAmount: price.unit_amount,
  };
}

async function resolvePrice(
  product: Stripe.Product,
): Promise<Stripe.Price | null> {
  const { default_price: defaultPrice } = product;

  if (defaultPrice && typeof defaultPrice !== "string") {
    return defaultPrice;
  }

  if (typeof defaultPrice === "string") {
    try {
      return await stripe.prices.retrieve(defaultPrice);
    } catch (error) {
      console.error(`Failed to retrieve default price ${defaultPrice}`, error);
      return null;
    }
  }

  try {
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    });

    return prices.data[0] ?? null;
  } catch (error) {
    console.error(`Failed to list prices for product ${product.id}`, error);
    return null;
  }
}

async function fetchStripeProducts(): Promise<ProductDTO[]> {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
    limit: 100,
  });

  const normalized = await Promise.all(
    products.data.map(async (product) => {
      const price = await resolvePrice(product);
      if (!price) {
        return null;
      }

      return normalizeProduct(product, price);
    }),
  );

  return normalized
    .filter((entry): entry is ProductDTO => Boolean(entry))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const listProducts = cache(fetchStripeProducts);

async function fetchStripeProduct(
  productId: string,
): Promise<ProductDTO | null> {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });

    if (product.deleted) {
      return null;
    }

    const price = await resolvePrice(product);
    if (!price) {
      return null;
    }

    return normalizeProduct(product, price);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      return null;
    }

    console.error(`Failed to retrieve product ${productId}`, error);
    return null;
  }
}

export const getProduct = cache(fetchStripeProduct);
