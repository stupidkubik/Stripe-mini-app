import type { ProductLight, ProductWatering } from "@/app/types/product";

export const LIGHT_LABELS: Record<ProductLight, string> = {
  bright: "Bright light",
  medium: "Medium light",
  low: "Low light",
};

export const WATERING_LABELS: Record<ProductWatering, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

export type ShowcaseTag = "new" | "hit";

type RatingPlaceholder = {
  value: number;
  count: number;
};

const showcaseCache = new Map<string, ShowcaseTag | undefined>();
const ratingCache = new Map<string, RatingPlaceholder>();
const categoryCache = new Map<string, string>();

function buildStableKey(id: string, slug?: string) {
  const base = (slug ?? id).trim().toLowerCase();
  return base.length > 0 ? base : id.trim().toLowerCase();
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getShowcaseTag(id: string, slug?: string): ShowcaseTag | undefined {
  const key = buildStableKey(id, slug);
  if (showcaseCache.has(key)) {
    return showcaseCache.get(key);
  }
  const bucket = hashValue(key) % 10;

  if (bucket === 0 || bucket === 1) {
    showcaseCache.set(key, "hit");
    return "hit";
  }

  if (bucket === 2 || bucket === 3) {
    showcaseCache.set(key, "new");
    return "new";
  }

  showcaseCache.set(key, undefined);
  return undefined;
}

export function getRatingPlaceholder(
  id: string,
  slug?: string,
): RatingPlaceholder {
  const key = buildStableKey(id, slug);
  const cached = ratingCache.get(key);
  if (cached) {
    return cached;
  }
  const hash = hashValue(`${key}:rating`);
  const rating = 4.2 + (hash % 70) / 100;
  const count = 24 + (hash % 180);

  const value = {
    value: Math.round(rating * 10) / 10,
    count,
  };
  ratingCache.set(key, value);
  return value;
}

export function formatCategory(category?: string) {
  if (!category) {
    return undefined;
  }

  const cached = categoryCache.get(category);
  if (cached) {
    return cached;
  }

  const formatted = category
    .split("-")
    .map((segment) =>
      segment ? segment[0].toUpperCase() + segment.slice(1) : "",
    )
    .join(" ");
  categoryCache.set(category, formatted);
  return formatted;
}

export function formatLight(light?: ProductLight) {
  return light ? LIGHT_LABELS[light] : undefined;
}

export function formatWatering(watering?: ProductWatering) {
  return watering ? WATERING_LABELS[watering] : undefined;
}
