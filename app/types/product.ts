export type ProductDTO = {
  id: string;
  name: string;
  description?: string | null;
  image: string; // URL (Stripe files/Unsplash и т.п.)
  priceId: string; // Stripe Price ID
  currency: string; // 'EUR' | 'USD' | ...
  unitAmount: number; // minor units (цены в центах)
};
