import "server-only";

import type Stripe from "stripe";

import type {
  ProductDTO,
  ProductLight,
  ProductMetadata,
  ProductWatering,
} from "@/app/types/product";
import { logServerError } from "@/lib/server-log";
import { isStorefrontCurrency } from "@/lib/storefront-policy";

export type CatalogueSnapshot = {
  products: SellableProduct[];
  byId: Record<string, SellableProduct>;
  bySlug: Record<string, SellableProduct>;
  byPriceId: Record<string, SellableProduct>;
};

export type SellableProduct = ProductDTO;

export interface CatalogueRepository {
  getSnapshot(): Promise<CatalogueSnapshot>;
}

type RetryDelay = (milliseconds: number) => Promise<void>;

type StripeErrorFields = {
  code?: unknown;
  statusCode?: unknown;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=1200&q=80";
const PRODUCT_LIGHTS = ["bright", "medium", "low"] as const;
const PRODUCT_WATERING = ["weekly", "biweekly", "monthly"] as const;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 100;

export class CatalogueUnavailableError extends Error {
  constructor() {
    super("The Stripe catalogue snapshot could not be loaded.");
    this.name = "CatalogueUnavailableError";
  }
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

export function createCatalogueSnapshot(
  products: SellableProduct[],
): CatalogueSnapshot {
  const byId: Record<string, SellableProduct> = {};
  const bySlug: Record<string, SellableProduct> = {};
  const byPriceId: Record<string, SellableProduct> = {};

  for (const product of products) {
    const idKey = normalizeLookupKey(product.id);
    const slugKey = product.metadata?.slug
      ? normalizeLookupKey(product.metadata.slug)
      : undefined;

    if (
      (byId[idKey] && byId[idKey].id !== product.id) ||
      (slugKey && bySlug[slugKey] && bySlug[slugKey].id !== product.id) ||
      (byPriceId[product.priceId] &&
        byPriceId[product.priceId].id !== product.id)
    ) {
      throw new Error("The catalogue contains duplicate lookup keys.");
    }

    byId[idKey] = product;
    byPriceId[product.priceId] = product;
    if (slugKey) {
      bySlug[slugKey] = product;
    }
  }

  return { products, byId, bySlug, byPriceId };
}

function normalizeMetadataValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeSlug(value: string | undefined): string | undefined {
  const normalized = normalizeMetadataValue(value)?.toLowerCase();
  return normalized && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)
    ? normalized
    : undefined;
}

function normalizeImage(value: string | undefined): string {
  if (!value) {
    return FALLBACK_IMAGE;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
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
  const normalized: ProductMetadata = {
    slug: normalizeSlug(raw.slug),
    category: normalizeMetadataValue(raw.category)?.toLowerCase(),
    light: normalizeEnumValue<ProductLight>(raw.light, PRODUCT_LIGHTS),
    petSafe: normalizeBoolean(raw.pet_safe),
    watering: normalizeEnumValue<ProductWatering>(
      raw.watering,
      PRODUCT_WATERING,
    ),
  };

  return Object.values(normalized).some((value) => value !== undefined)
    ? normalized
    : undefined;
}

function createSellableProduct(
  product: Stripe.Product,
  price: Stripe.Price,
): SellableProduct | null {
  const name = product.name.trim();
  const currency = price.currency?.trim().toUpperCase();

  if (
    !product.active ||
    !price.active ||
    price.type !== "one_time" ||
    price.unit_amount == null ||
    !Number.isSafeInteger(price.unit_amount) ||
    price.unit_amount < 0 ||
    !currency ||
    !/^[A-Z]{3}$/.test(currency) ||
    !isStorefrontCurrency(currency) ||
    name.length === 0
  ) {
    return null;
  }

  return {
    id: product.id,
    name,
    description: product.description,
    image: normalizeImage(product.images?.[0]),
    priceId: price.id,
    currency,
    unitAmount: price.unit_amount,
    metadata: normalizeProductMetadata(product.metadata),
  };
}

function errorFields(error: unknown): StripeErrorFields | undefined {
  return error && typeof error === "object"
    ? (error as StripeErrorFields)
    : undefined;
}

function isMissingResource(error: unknown): boolean {
  return errorFields(error)?.code === "resource_missing";
}

function isRetryable(error: unknown): boolean {
  const statusCode = errorFields(error)?.statusCode;
  return (
    statusCode === 429 ||
    (typeof statusCode === "number" && statusCode >= 500 && statusCode <= 599)
  );
}

const defaultRetryDelay: RetryDelay = async (milliseconds) => {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export class StripeCatalogueRepository implements CatalogueRepository {
  constructor(
    private readonly stripe: Stripe,
    private readonly retryDelay: RetryDelay = defaultRetryDelay,
  ) {}

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        if (!isRetryable(error) || attempt === MAX_ATTEMPTS) {
          throw error;
        }

        const exponentialDelay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        const jitter = Math.floor(Math.random() * RETRY_BASE_DELAY_MS);
        await this.retryDelay(exponentialDelay + jitter);
      }
    }

    throw new CatalogueUnavailableError();
  }

  private async resolvePrice(
    product: Stripe.Product,
  ): Promise<Stripe.Price | null> {
    const defaultPrice = product.default_price;

    if (defaultPrice && typeof defaultPrice !== "string") {
      return defaultPrice;
    }

    if (typeof defaultPrice === "string") {
      try {
        return await this.withRetry(() =>
          this.stripe.prices.retrieve(defaultPrice),
        );
      } catch (error) {
        if (isMissingResource(error)) {
          return null;
        }

        throw error;
      }
    }

    return null;
  }

  private async loadProducts(): Promise<ProductDTO[]> {
    const products: Stripe.Product[] = [];
    let startingAfter: string | undefined;

    while (true) {
      const page = await this.withRetry(() =>
        this.stripe.products.list({
          active: true,
          expand: ["data.default_price"],
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        }),
      );

      products.push(...page.data);

      if (!page.has_more || page.data.length === 0) {
        break;
      }

      startingAfter = page.data.at(-1)?.id;
      if (!startingAfter) {
        break;
      }
    }

    const normalized: Array<SellableProduct | null> = [];

    // Stripe normally expands every default price in the list call. Resolve
    // exceptional products sequentially so missing defaults cannot create an
    // unbounded burst of fallback Price API calls.
    for (const product of products) {
      const price = await this.resolvePrice(product);
      normalized.push(price ? createSellableProduct(product, price) : null);
    }

    return normalized
      .filter((product): product is SellableProduct => product !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async getSnapshot(): Promise<CatalogueSnapshot> {
    try {
      const products = await this.loadProducts();
      return createCatalogueSnapshot(products);
    } catch (error) {
      logServerError("stripe.catalog.snapshot.load", error);
      throw new CatalogueUnavailableError();
    }
  }
}
