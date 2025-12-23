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

type CardSeed = {
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

const CARDS: CardSeed[] = [
  {
    "slug": "golden-barrel-cactus",
    "name": "Golden Barrel Cactus",
    "description": "Sun-loving globe cactus with golden spines; bold and low maintenance.",
    "price": 2600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "saguaro-cactus",
    "name": "Saguaro Cactus",
    "description": "Iconic upright cactus silhouette that loves full sun and dry soil.",
    "price": 7800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "prickly-pear",
    "name": "Prickly Pear",
    "description": "Flat, paddle-shaped pads with seasonal blooms; a desert classic.",
    "price": 3200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "bunny-ears-cactus",
    "name": "Bunny Ears Cactus",
    "description": "Soft-looking pads with tiny spines; compact and playful.",
    "price": 2400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "red-spine-barrel",
    "name": "Red Spine Barrel",
    "description": "Ridged barrel cactus with vivid spines and slow, steady growth.",
    "price": 2800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "old-man-cactus",
    "name": "Old Man Cactus",
    "description": "Columnar cactus with fuzzy white hairs that soften the silhouette.",
    "price": 3100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "moon-cactus",
    "name": "Moon Cactus",
    "description": "Colorful grafted cactus that pops on desks and sunny shelves.",
    "price": 2200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "fishbone-cactus",
    "name": "Fishbone Cactus",
    "description": "Zigzag stems with a sculptural, trailing form and bright blooms.",
    "price": 2900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "medium",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "christmas-cactus",
    "name": "Christmas Cactus",
    "description": "Holiday bloomer with segmented stems and bright, dangling flowers.",
    "price": 2700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "medium",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "easter-cactus",
    "name": "Easter Cactus",
    "description": "Rounded segments and spring blooms with softer, lush growth.",
    "price": 2700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "medium",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "dragon-fruit-cactus",
    "name": "Dragon Fruit Cactus",
    "description": "Climbing cactus with dramatic stems and potential for exotic fruit.",
    "price": 3600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "blue-myrtle-cactus",
    "name": "Blue Myrtle Cactus",
    "description": "Tall blue-green columns with a clean, modern desert look.",
    "price": 4400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "fairy-castle-cactus",
    "name": "Fairy Castle Cactus",
    "description": "Clustered spires that look like tiny towers; slow and hardy.",
    "price": 3000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "peanut-cactus",
    "name": "Peanut Cactus",
    "description": "Low, clumping cactus with finger-like stems and orange blooms.",
    "price": 2100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "hedgehog-cactus",
    "name": "Hedgehog Cactus",
    "description": "Compact and spiny with showy spring flowers in bright light.",
    "price": 2400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "organ-pipe-cactus",
    "name": "Organ Pipe Cactus",
    "description": "Multiple upright stems that branch from the base like organ pipes.",
    "price": 6200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "bishop-cap-cactus",
    "name": "Bishop Cap Cactus",
    "description": "Star-shaped ribs and a clean, geometric look for minimal setups.",
    "price": 2300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "golden-lace-cactus",
    "name": "Golden Lace Cactus",
    "description": "Dense golden spines on a small globe; great for sunny windows.",
    "price": 1900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "ladyfinger-cactus",
    "name": "Ladyfinger Cactus",
    "description": "Slender stems that cluster tightly; a tidy desktop cactus.",
    "price": 2000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "claret-cup-cactus",
    "name": "Claret Cup Cactus",
    "description": "Compact pads with vivid red flowers when grown in bright light.",
    "price": 2500,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  }
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

async function upsertCard(seed: CardSeed) {
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
  for (const card of CARDS) {
    const { product, price } = await upsertCard(card);
    results.push({ name: card.name, productId: product.id, priceId: price.id });
  }

  console.log(`\nSeeded ${results.length} cards:`);
  for (const entry of results) {
    console.log(`- ${entry.name} -> product ${entry.productId}, price ${entry.priceId}`);
  }

  console.log("\nDone. Refresh your Next.js catalog to see the new items.");
}

main().catch((error) => {
  console.error("Failed to seed Stripe:", error);
  process.exit(1);
});
