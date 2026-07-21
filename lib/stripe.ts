import "server-only";

import { unstable_cache } from "next/cache";
import Stripe from "stripe";

import {
  StripeCatalogueRepository,
  type CatalogueSnapshot,
} from "@/lib/catalogue";

const STRIPE_API_VERSION = "2026-01-28.clover";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CATALOGUE_REVALIDATE_SECONDS = 60;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to your environment before calling Stripe helpers.",
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
  typescript: true,
});

const catalogueRepository = new StripeCatalogueRepository(stripe);

const getCachedCatalogueSnapshot = unstable_cache(
  async () => catalogueRepository.getSnapshot(),
  ["stripe-catalogue-snapshot-v1"],
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
