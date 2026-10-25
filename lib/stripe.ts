import "server-only";

import { unstable_cache } from "next/cache";
import Stripe from "stripe";

import {
  StripeCatalogueRepository,
  type CatalogueSnapshot,
  type CatalogueRepository,
} from "@/lib/catalogue";
import { FixtureCatalogueRepository } from "@/lib/catalogue-fixture";
import { readBuildConfig, readStripeSecretConfig } from "@/lib/config/env";

const CATALOGUE_REVALIDATE_SECONDS = 60;
let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  const { STRIPE_SECRET_KEY: secretKey } = readStripeSecretConfig();

  stripeClient ??= new Stripe(secretKey, {
    // Requests use the API version the SDK types describe; see
    // tests/stripe-api-version.test.ts for what guards a major release change.
    apiVersion: Stripe.API_VERSION,
    typescript: true,
  });
  return stripeClient;
}

function getCatalogueRepository(): CatalogueRepository {
  return readBuildConfig().CATALOGUE_SOURCE === "fixture"
    ? new FixtureCatalogueRepository()
    : new StripeCatalogueRepository(getStripeClient());
}

const getCachedCatalogueSnapshot = unstable_cache(
  async () => getCatalogueRepository().getSnapshot(),
  ["catalogue-snapshot-v2"],
  {
    revalidate: CATALOGUE_REVALIDATE_SECONDS,
    tags: ["stripe-catalogue"],
  },
);

export async function getCatalogueSnapshot(): Promise<CatalogueSnapshot> {
  return getCachedCatalogueSnapshot();
}

export async function listProducts() {
  return (await getCatalogueSnapshot()).products;
}

export async function getProduct(productId: string) {
  const key = productId.trim().toLowerCase();
  return key ? ((await getCatalogueSnapshot()).byId[key] ?? null) : null;
}

export async function getProductBySlug(slug: string) {
  const key = slug.trim().toLowerCase();
  if (!key) {
    return null;
  }

  const snapshot = await getCatalogueSnapshot();
  return snapshot.bySlug[key] ?? snapshot.byId[key] ?? null;
}

export async function getProductByPriceId(priceId: string) {
  const key = priceId.trim();
  return key ? ((await getCatalogueSnapshot()).byPriceId[key] ?? null) : null;
}
