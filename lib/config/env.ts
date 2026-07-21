import "server-only";

import { z, ZodError, type ZodType } from "zod";

export class ConfigurationError extends Error {
  constructor(scope: string, issues: string[]) {
    super(`Invalid ${scope} configuration: ${issues.join("; ")}`);
    this.name = "ConfigurationError";
  }
}

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().trim().optional(),
);

const origin = z
  .string()
  .trim()
  .min(1)
  .transform((value) =>
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`,
  )
  .pipe(z.url())
  .transform((value) => new URL(value).origin);

const optionalOrigin = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  origin.optional(),
);

function parse<T>(scope: string, schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    throw new ConfigurationError(
      scope,
      error.issues.map((issue) => {
        const field = issue.path.join(".") || "environment";
        return `${field}: ${issue.message}`;
      }),
    );
  }
}

const buildSchema = z.object({
  CATALOGUE_SOURCE: z.enum(["fixture", "stripe"]).default("stripe"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalOrigin,
  NEXT_PUBLIC_STOREFRONT_CURRENCY: optionalText.refine(
    (value) => value === undefined || /^[A-Za-z]{3}$/.test(value),
    "must be a three-letter currency code",
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalText.refine(
    (value) => value === undefined || /^pk_(test|live)(?:_|$)/.test(value),
    "must be a Stripe publishable key",
  ),
});

const siteRuntimeSchema = z.object({
  SITE_URL: optionalOrigin,
  NEXT_PUBLIC_SITE_URL: optionalOrigin,
  VERCEL_PROJECT_PRODUCTION_URL: optionalOrigin,
  VERCEL_URL: optionalOrigin,
  DEMO_SUCCESS: z.enum(["true", "false"]).optional(),
});

const stripeSecretSchema = z.object({
  STRIPE_SECRET_KEY: z
    .string()
    .trim()
    .regex(/^sk_(test|live)(?:_|$)/, "must be a Stripe secret key"),
});

const webhookSecretSchema = z.object({
  STRIPE_WEBHOOK_SECRET: z.string().trim().min(8),
});

const receiptSecretSchema = z
  .object({
    RECEIPT_SIGNING_SECRET: optionalText,
    STRIPE_SECRET_KEY: optionalText,
  })
  .refine(
    (value) => value.RECEIPT_SIGNING_SECRET || value.STRIPE_SECRET_KEY,
    {
      message: "RECEIPT_SIGNING_SECRET or STRIPE_SECRET_KEY is required",
      path: ["RECEIPT_SIGNING_SECRET"],
    },
  );

const databaseSchema = z
  .object({
    DATABASE_URL: optionalText,
    POSTGRES_URL: optionalText,
  })
  .transform((value) => value.DATABASE_URL ?? value.POSTGRES_URL)
  .pipe(
    z
      .string()
      .url()
      .refine(
        (value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol),
        "must use the postgres or postgresql protocol",
      ),
  );

export function readBuildConfig() {
  return parse("build", buildSchema, process.env);
}

export function readPublicConfig() {
  return parse("public", publicSchema, process.env);
}

export function readSiteRuntimeConfig() {
  return parse("site runtime", siteRuntimeSchema, process.env);
}

export function readStripeSecretConfig() {
  return parse("Stripe runtime", stripeSecretSchema, process.env);
}

export function readWebhookSecretConfig() {
  return parse("webhook runtime", webhookSecretSchema, process.env);
}

export function readReceiptSigningSecret(): string {
  const config = parse("receipt runtime", receiptSecretSchema, process.env);
  return config.RECEIPT_SIGNING_SECRET ?? config.STRIPE_SECRET_KEY!;
}

export function readDatabaseUrl(): string {
  return parse("database runtime", databaseSchema, process.env);
}
