import "server-only";

import { readSiteRuntimeConfig } from "@/lib/config/env";

const LOCAL_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function normalizeHostOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return normalizeOrigin(trimmed);
  }

  return normalizeOrigin(`https://${trimmed}`);
}

export function getSiteOrigin(): string {
  const config = readSiteRuntimeConfig();
  return (
    normalizeHostOrigin(config.SITE_URL) ??
    normalizeHostOrigin(config.NEXT_PUBLIC_SITE_URL) ??
    normalizeHostOrigin(config.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeHostOrigin(config.VERCEL_URL) ??
    LOCAL_ORIGIN
  );
}

export function isSuccessPreviewEnabled(): boolean {
  return readSiteRuntimeConfig().DEMO_SUCCESS === "true";
}
