import "server-only";

import Stripe from "stripe";
import { cache } from "react";

import type {
  ProductDTO,
  ProductLight,
  ProductMetadata,
  ProductWatering,
} from "@/app/types/product";

const STRIPE_API_VERSION = "2026-01-28.clover";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to your environment before calling Stripe helpers.",
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // Keep runtime API version aligned with dashboard even if SDK typing lags behind.
  apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
  typescript: true,
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1200&q=80"; // lush houseplants arrangement

const PRODUCT_LIGHTS = ["bright", "medium", "low"] as const;
const PRODUCT_WATERING = ["weekly", "biweekly", "monthly"] as const;

function normalizeMetadataValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEnumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  return allowed.includes(normalized as T) ? (normalized as T) : undefined;
}

function normalizeBoolean(value: string | undefined): boolean | undefined {
  const normalized = value?.toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
}

function normalizeProductMetadata(
  metadata?: Stripe.Metadata,
): ProductMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  const raw = metadata as Record<string, string | undefined>;
  const slug = normalizeMetadataValue(raw.slug);
  const category = normalizeMetadataValue(raw.category)?.toLowerCase();
  const light = normalizeEnumValue<ProductLight>(raw.light, PRODUCT_LIGHTS);
  const watering = normalizeEnumValue<ProductWatering>(
    raw.watering,
    PRODUCT_WATERING,
  );
  const petSafe = normalizeBoolean(raw.pet_safe);

  const normalized: ProductMetadata = {
    slug,
    category,
    light,
    petSafe,
    watering,
  };

  const hasMetadata = Object.values(normalized).some(
    (value) => value !== undefined,
  );

  return hasMetadata ? normalized : undefined;
}

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
    metadata: normalizeProductMetadata(product.metadata),
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
  const products: Stripe.Product[] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    products.push(...page.data);

    if (!page.has_more || page.data.length === 0) {
      break;
    }

    startingAfter = page.data[page.data.length - 1]?.id;
    if (!startingAfter) {
      break;
    }
  }

  const normalized = await Promise.all(
    products.map(async (product) => {
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

async function fetchStripeProductBySlug(
  slug: string,
): Promise<ProductDTO | null> {
  const trimmedSlug = normalizeMetadataValue(slug);
  const normalizedSlug = trimmedSlug?.toLowerCase();

  if (!normalizedSlug || !trimmedSlug) {
    return null;
  }

  let matchedProduct: Stripe.Product | undefined;

  try {
    const results = await stripe.products.search({
      query: `metadata['slug']:'${trimmedSlug
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")}'`,
      limit: 1,
      expand: ["data.default_price"],
    });

    matchedProduct = results.data[0];
  } catch (error) {
    console.warn(`Failed to search for product slug ${normalizedSlug}`, error);
  }

  if (matchedProduct && !matchedProduct.deleted) {
    const price = await resolvePrice(matchedProduct);
    if (price) {
      return normalizeProduct(matchedProduct, price);
    }
  }

  const products = await fetchStripeProducts();
  const match = products.find(
    (product) => product.metadata?.slug?.toLowerCase() === normalizedSlug,
  );

  if (match) {
    return match;
  }

  if (normalizedSlug.startsWith("prod_")) {
    return getProduct(normalizedSlug);
  }

  return null;
}

export const getProductBySlug = fetchStripeProductBySlug;
