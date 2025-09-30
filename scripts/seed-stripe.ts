import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";

// Ensure Next-style env files (.env.local, .env) are loaded when running this script directly.
loadEnvConfig(process.cwd());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY. Add it to your environment before running the seed script.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

type PlantSeed = {
  slug: string;
  name: string;
  description: string;
  price: number; // minor units (cents)
  currency: string;
  image: string;
  category: string;
  light: "bright" | "medium" | "low";
  petSafe: boolean;
  watering: "weekly" | "biweekly" | "monthly";
};

const PLANTS: PlantSeed[] = [
  {
    slug: "monstera-deliciosa",
    name: "Monstera Deliciosa",
    description: "A statement climber with iconic split leaves that thrives in bright, indirect light.",
    price: 5200,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1526376110933-3929d3b822f3?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "fiddle-leaf-fig",
    name: "Fiddle Leaf Fig",
    description: "Tall and dramatic foliage that instantly elevates any living space.",
    price: 6800,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "snake-plant-laurentii",
    name: "Snake Plant Laurentii",
    description: "Architectural leaves that tolerate low light and infrequent watering—perfect for beginners.",
    price: 3200,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1530092376769-9aed6841f241?auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "zz-plant-raven",
    name: "ZZ Plant Raven",
    description: "Glossy, near-black foliage that thrives on neglect and low light conditions.",
    price: 3600,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1578898886225-c7c894047899?auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "pothos-neon",
    name: "Pothos Neon",
    description: "Vining plant with electric lime foliage—great for hanging baskets and shelves.",
    price: 2600,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1467043198406-dc953a3defa7?auto=format&fit=crop&w=1200&q=80",
    category: "vining",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "string-of-pearls",
    name: "String of Pearls",
    description: "Trailing succulent pearls that cascade gracefully—loves bright windowsills.",
    price: 4000,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e9eb6a0?auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "calathea-orbifolia",
    name: "Calathea Orbifolia",
    description: "Lush, oversized leaves with silver striping—loves humidity and filtered light.",
    price: 4500,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1526895470751-2f5c4e9eb6a0?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "bird-of-paradise",
    name: "Bird of Paradise",
    description: "Bold tropical fan that enjoys bright light and rewards you with fast growth.",
    price: 7800,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "peace-lily-sensation",
    name: "Peace Lily Sensation",
    description: "Air-purifying classic with dramatic white blooms and plush foliage.",
    price: 3900,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1614594856656-1ffe521b2cc3?auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "rubber-tree-burgundy",
    name: "Rubber Tree Burgundy",
    description: "High-gloss leaves in deep burgundy tones—perfect for modern interiors.",
    price: 4200,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1522158637959-30385a09e22d?auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "chinese-money-plant",
    name: "Chinese Money Plant",
    description: "Playful round leaves on upright stems—an easy grower and fast propagator.",
    price: 2900,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "prayer-plant-tricolor",
    name: "Prayer Plant Tricolor",
    description: "Foliage that folds at night with painterly pink veins—loves humidity.",
    price: 3400,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "spider-plant-classic",
    name: "Spider Plant Classic",
    description: "Reliable hanging plant that shoots out baby spiderettes you can propagate.",
    price: 2400,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1600402444720-08ec2b1433bd?auto=format&fit=crop&w=1200&q=80",
    category: "hanging",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "boston-fern",
    name: "Boston Fern",
    description: "Feathery fronds that love steamy bathrooms and kitchens for a lush cascade.",
    price: 2800,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1594631407225-3f6a0a4de1a5?auto=format&fit=crop&w=1200&q=80",
    category: "fern",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "philodendron-brasil",
    name: "Philodendron Brasil",
    description: "Trailing vines with streaks of lime and chartreuse on each heart-shaped leaf.",
    price: 3100,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1525476326905-999815fca738?auto=format&fit=crop&w=1200&q=80",
    category: "vining",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "alocasia-polly",
    name: "Alocasia Polly",
    description: "Striking arrow-shaped leaves with electric white veins and a sculptural form.",
    price: 3700,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1520869578617-557b8a5c54c2?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "maidenhair-fern",
    name: "Maidenhair Fern",
    description: "Delicate fronds on dark wiry stems—loves steady moisture and filtered light.",
    price: 2600,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1576409182246-2479d0a9ee5e?auto=format&fit=crop&w=1200&q=80",
    category: "fern",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "anthurium-flamingo",
    name: "Anthurium Flamingo",
    description: "Glossy heart-shaped blooms in flamingo pink that last for weeks.",
    price: 4100,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1498765207850-0c16f095cdfd?auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "hoya-carnosa-compacta",
    name: "Hoya Carnosa Compacta",
    description: "Twisting rope-like vines with waxy foliage and clusters of starry blooms.",
    price: 3800,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1603885767295-5a9ad6bb0a64?auto=format&fit=crop&w=1200&q=80",
    category: "vining",
    light: "bright",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "parlor-palm",
    name: "Parlor Palm",
    description: "Victorian classic with elegant fronds that tolerates low light apartments.",
    price: 2700,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1587502537685-5aa74f282b31?auto=format&fit=crop&w=1200&q=80",
    category: "palm",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "aglaonema-silver-bay",
    name: "Aglaonema Silver Bay",
    description: "Silvery foliage with painterly variegation—thrives in low to medium light.",
    price: 3300,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1594631252845-29f78c1368f2?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "dracaena-lemon-lime",
    name: "Dracaena Lemon Lime",
    description: "Striped lime foliage on tall canes—adds instant height and color contrast.",
    price: 3500,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "schefflera-arboricola",
    name: "Schefflera Arboricola",
    description: "Umbrella plant with glossy leaf clusters—adaptable to a variety of homes.",
    price: 3600,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "dieffenbachia-tropic-snow",
    name: "Dieffenbachia Tropic Snow",
    description: "Variegated foliage splashed with creamy white—loves bright, indirect light.",
    price: 3000,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1621425675740-1620ebd07c7c?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "philodendron-pink-princess",
    name: "Philodendron Pink Princess",
    description: "Collector-favorite with dramatic pink variegation on chocolate leaves.",
    price: 8200,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1607459345512-89911f662483?auto=format&fit=crop&w=1200&q=80",
    category: "collector",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "stromanthe-triostar",
    name: "Stromanthe Triostar",
    description: "Painterly foliage in cream, green, and pink—folds closed each evening.",
    price: 3900,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "cast-iron-plant",
    name: "Cast Iron Plant",
    description: "True low-light champion that withstands missed waterings and drafts.",
    price: 2900,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "low",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "peperomia-watermelon",
    name: "Peperomia Watermelon",
    description: "Compact rosettes with watermelon-striped foliage—ideal for desks and shelves.",
    price: 2800,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1621425675732-74fd9f5bff1e?auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "succulent-sampler-trio",
    name: "Succulent Sampler Trio",
    description: "Three hand-picked rosette succulents for sunny windowsills and gifting.",
    price: 2500,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: true,
    watering: "monthly",
  },
  {
    slug: "bonsai-juniper",
    name: "Bonsai Juniper",
    description: "Classic bonsai styled over lava rock—an elegant accent for shelves and consoles.",
    price: 5500,
    currency: "usd",
    image: "https://images.unsplash.com/photo-1601000938259-9a0f0b1bd7b8?auto=format&fit=crop&w=1200&q=80",
    category: "bonsai",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
];

async function findProductBySlug(slug: string) {
  try {
    const result = await stripe.products.search({
      query: `metadata['slug']:'${slug}'`,
      limit: 1,
    });
    return result.data[0] ?? null;
  } catch (error) {
    console.warn(`Unable to search for product ${slug}:`, error);
    return null;
  }
}

async function findPriceByLookup(lookupKey: string) {
  try {
    const result = await stripe.prices.search({
      query: `lookup_key:'${lookupKey}' AND active:'true'`,
      limit: 1,
    });
    return result.data[0] ?? null;
  } catch (error) {
    console.warn(`Unable to search for price ${lookupKey}:`, error);
    return null;
  }
}

async function upsertPlant(seed: PlantSeed) {
  const lookupKey = `${seed.slug}_price`;
  const metadata = {
    slug: seed.slug,
    category: seed.category,
    light: seed.light,
    pet_safe: seed.petSafe ? "true" : "false",
    watering: seed.watering,
  } as Record<string, string>;

  let product = await findProductBySlug(seed.slug);

  if (!product) {
    product = await stripe.products.create({
      name: seed.name,
      description: seed.description,
      images: [seed.image],
      shippable: true,
      active: true,
      metadata,
    });
    console.log(`Created product ${seed.name}`);
  } else {
    await stripe.products.update(product.id, {
      name: seed.name,
      description: seed.description,
      images: [seed.image],
      active: true,
      metadata,
    });
    console.log(`Updated product ${seed.name}`);
  }

  let price = await findPriceByLookup(lookupKey);
  if (price && price.product !== product.id) {
    await stripe.prices.update(price.id, { active: false }).catch(() => undefined);
    price = null;
  }

  if (price && price.unit_amount !== seed.price) {
    await stripe.prices.update(price.id, { active: false }).catch(() => undefined);
    price = null;
  }

  if (!price) {
    price = await stripe.prices.create({
      currency: seed.currency,
      unit_amount: seed.price,
      nickname: `${seed.name} price`,
      lookup_key: lookupKey,
      product: product.id,
      metadata,
    });
    console.log(`Created price for ${seed.name}`);
  }

  if (product.default_price !== price.id) {
    await stripe.products.update(product.id, { default_price: price.id });
  }

  return { product, price };
}

async function main() {
  const results = [] as { name: string; productId: string; priceId: string }[];
  for (const plant of PLANTS) {
    const { product, price } = await upsertPlant(plant);
    results.push({ name: plant.name, productId: product.id, priceId: price.id });
  }

  console.log(`\nSeeded ${results.length} plants:`);
  for (const entry of results) {
    console.log(`• ${entry.name} → product ${entry.productId}, price ${entry.priceId}`);
  }

  console.log("\nDone. Refresh your Next.js catalog to see the new plants.");
}

main().catch((error) => {
  console.error("Failed to seed Stripe:", error);
  process.exit(1);
});
