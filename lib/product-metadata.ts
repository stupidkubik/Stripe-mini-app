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

export function formatCategory(category?: string) {
  if (!category) {
    return undefined;
  }

  return category
    .split("-")
    .map((segment) =>
      segment ? segment[0].toUpperCase() + segment.slice(1) : "",
    )
    .join(" ");
}

export function formatLight(light?: ProductLight) {
  return light ? LIGHT_LABELS[light] : undefined;
}

export function formatWatering(watering?: ProductWatering) {
  return watering ? WATERING_LABELS[watering] : undefined;
}
