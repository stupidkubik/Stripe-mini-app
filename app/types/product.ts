export type ProductLight = "bright" | "medium" | "low";
export type ProductWatering = "weekly" | "biweekly" | "monthly";

export type ProductMetadata = {
  slug?: string;
  category?: string;
  light?: ProductLight;
  petSafe?: boolean;
  watering?: ProductWatering;
};

export type ProductDTO = {
  id: string;
  name: string;
  description?: string | null;
  image: string; // URL (Stripe files/Unsplash и т.п.)
  priceId: string; // Stripe Price ID
  currency: string; // 'EUR' | 'USD' | ...
  unitAmount: number; // minor units (цены в центах)
  metadata?: ProductMetadata;
};
