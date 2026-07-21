import "server-only";

import {
  createCatalogueSnapshot,
  type CatalogueRepository,
  type SellableProduct,
} from "@/lib/catalogue";

export const CATALOGUE_FIXTURE_VERSION = "2026-07-21.v1";

const products: SellableProduct[] = [
  {
    id: "prod_fixture_aloe",
    name: "Aloe Vera",
    description: "A resilient succulent for bright indoor spaces.",
    image: "/window.svg",
    priceId: "price_fixture_aloe",
    currency: "USD",
    unitAmount: 1800,
    metadata: {
      slug: "aloe-vera",
      category: "succulents",
      light: "bright",
      petSafe: false,
      watering: "biweekly",
    },
  },
  {
    id: "prod_fixture_fern",
    name: "Boston Fern",
    description: "Soft green fronds for a humid, softly lit room.",
    image: "/globe.svg",
    priceId: "price_fixture_fern",
    currency: "USD",
    unitAmount: 2400,
    metadata: {
      slug: "boston-fern",
      category: "ferns",
      light: "medium",
      petSafe: true,
      watering: "weekly",
    },
  },
  {
    id: "prod_fixture_snake",
    name: "Snake Plant",
    description: "An architectural, low-maintenance houseplant.",
    image: "/file.svg",
    priceId: "price_fixture_snake",
    currency: "USD",
    unitAmount: 3200,
    metadata: {
      slug: "snake-plant",
      category: "foliage",
      light: "low",
      petSafe: false,
      watering: "monthly",
    },
  },
];

const snapshot = createCatalogueSnapshot(products);

export class FixtureCatalogueRepository implements CatalogueRepository {
  async getSnapshot() {
    return snapshot;
  }
}
