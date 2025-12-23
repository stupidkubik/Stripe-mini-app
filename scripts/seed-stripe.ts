import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";

// Ensure Next-style env files (.env.local, .env) are loaded when running this script directly.
loadEnvConfig(process.cwd());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY. Add it to your environment before running the seed script.",
  );
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
    description:
      "A statement climber with iconic split leaves that thrives in bright, indirect light.",
    price: 5200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1665408511551-525a24a75ac5?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TW9uc3RlcmElMjBEZWxpY2lvc2F8ZW58MHwxfHx8MTc1OTI0NDM2M3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "fiddle-leaf-fig",
    name: "Fiddle Leaf Fig",
    description:
      "Tall and dramatic foliage that instantly elevates any living space.",
    price: 6800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1739423877537-59a160cb708f?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RmlkZGxlJTIwTGVhZiUyMEZpZ3xlbnwwfDF8fHwxNzU5MjQ0MzY0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "snake-plant-laurentii",
    name: "Snake Plant 'Laurentii'",
    description:
      "Legendary low-maintenance plant with upright, variegated blades that tolerate low light.",
    price: 3200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1740417220344-93eb64b072bd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U25ha2UlMjBQbGFudCUyMCUyN0xhdXJlbnRpaSUyN3xlbnwwfDF8fHwxNzU5MjQ0MzY1fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "zz-plant",
    name: "ZZ Plant",
    description:
      "Glossy, architectural foliage that thrives on neglect and low light.",
    price: 3600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1675864662842-6efc0ef31f67?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8WlolMjBQbGFudHxlbnwwfDF8fHwxNzU5MjQ0MzY2fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "golden-pothos",
    name: "Golden Pothos",
    description:
      "Trailing classic with heart-shaped leaves, perfect for shelves and hanging planters.",
    price: 2400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1673969608398-18921179fa7d?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8R29sZGVuJTIwUG90aG9zfGVufDB8MXx8fDE3NTkyNDQzNjd8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "heartleaf-philodendron",
    name: "Heartleaf Philodendron",
    description:
      "Easy trailing philodendron with lush, heart-shaped leaves for cozy corners.",
    price: 2600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1701075028357-d0ca84ca0b7c?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SGVhcnRsZWFmJTIwUGhpbG9kZW5kcm9ufGVufDB8MXx8fDE3NTkyNDQzNjh8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "spider-plant",
    name: "Spider Plant",
    description:
      "Airy arching foliage with baby plantlets that root easily; great for beginners.",
    price: 2300,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1664543258903-abb77806252c?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U3BpZGVyJTIwUGxhbnR8ZW58MHwxfHx8MTc1OTI0NDM2OXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "peace-lily",
    name: "Peace Lily",
    description:
      "Elegant white bracts and deep green leaves; a forgiving indoor flowering plant.",
    price: 2900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1676117273363-2b13dbbc5385?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGVhY2UlMjBMaWx5fGVufDB8MXx8fDE3NTkyNDQzNzB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "low",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "rubber-plant",
    name: "Rubber Plant",
    description:
      "Thick, glossy leaves on a sturdy tree-form that loves bright rooms.",
    price: 4200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1683880731792-39c07ceea617?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UnViYmVyJTIwUGxhbnR8ZW58MHwxfHx8MTc1OTI0NDM3Mnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "dracaena-marginata",
    name: "Dracaena Marginata",
    description:
      "Slim, sculptural canes with fine, spiky leaves; tolerant of varied light.",
    price: 3400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667238638821-ae76609e89bd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RHJhY2FlbmElMjBNYXJnaW5hdGF8ZW58MHwxfHx8MTc1OTI0NDM3M3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "areca-palm",
    name: "Areca Palm",
    description:
      "Feathery fronds create a soft, tropical vibe; a classic living room palm.",
    price: 4500,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1681256187605-2d66160926a2?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QXJlY2ElMjBQYWxtfGVufDB8MXx8fDE3NTkyNDQzNzR8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "palm",
    light: "bright",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "parlor-palm",
    name: "Parlor Palm",
    description:
      "Compact, shade-friendly palm that purifies air and thrives in apartments.",
    price: 2800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1699533130572-ac8df014e32d?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGFybG9yJTIwUGFsbXxlbnwwfDF8fHwxNzU5MjQ0Mzc2fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "palm",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "bird-of-paradise",
    name: "Bird of Paradise",
    description:
      "Bold, banana-like leaves and tropical stature for sun-drenched interiors.",
    price: 7200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1678910963263-aab5cf376c7f?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QmlyZCUyMG9mJTIwUGFyYWRpc2V8ZW58MHwxfHx8MTc1OTI0NDM3N3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "calathea-orbifolia",
    name: "Calathea Orbifolia",
    description:
      "Striped, oversized leaves with a satiny sheen; loves humidity and gentle light.",
    price: 3900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1675720821735-3f3fbf01fb16?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2FsYXRoZWElMjBPcmJpZm9saWF8ZW58MHwxfHx8MTc1OTI0NDM3OHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "prayer-plant",
    name: "Prayer Plant",
    description:
      "Foliage that folds at night; vibrant veining and compact growth.",
    price: 3100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1679545132738-6f3bef025643?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UHJheWVyJTIwUGxhbnR8ZW58MHwxfHx8MTc1OTI0NDM5M3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "chinese-evergreen",
    name: "Chinese Evergreen",
    description:
      "Reliable, variegated foliage that tolerates shade and indoor air.",
    price: 2700,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1675802754634-3e0967bd3fab?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2hpbmVzZSUyMEV2ZXJncmVlbnxlbnwwfDF8fHwxNzU5MjQ0Mzk0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "low",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "anthurium-andraeanum",
    name: "Anthurium",
    description: "Glossy heart-shaped leaves and long-lasting waxy blooms.",
    price: 3800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1676654935634-a1439f460507?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QW50aHVyaXVtfGVufDB8MXx8fDE3NTkyNDQzOTZ8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "boston-fern",
    name: "Boston Fern",
    description:
      "Classic, lush fronds that appreciate humidity and consistent moisture.",
    price: 2500,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1694475168184-b3afc9ab6584?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Qm9zdG9uJTIwRmVybnxlbnwwfDF8fHwxNzU5MjQ0Mzk3fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "fern",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "maidenhair-fern",
    name: "Maidenhair Fern",
    description:
      "Delicate, airy fronds with fine texture; loves even moisture.",
    price: 2900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1664008628977-d8acf1fc2c58?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TWFpZGVuaGFpciUyMEZlcm58ZW58MHwxfHx8MTc1OTI0NDM5OHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "fern",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "aloe-vera",
    name: "Aloe Vera",
    description:
      "Sun-loving succulent with sculptural rosettes; minimal watering.",
    price: 2200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1688045553706-e2c642bfa410?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWxvZSUyMFZlcmF8ZW58MHwxfHx8MTc1OTI0NDM5OXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "jade-plant",
    name: "Jade Plant",
    description:
      "Thick, coin-like leaves and bonsai potential; a sun-loving classic.",
    price: 3000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1674645858890-06e51817c265?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SmFkZSUyMFBsYW50fGVufDB8MXx8fDE3NTkyNDQ0MDB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "haworthia-fasciata",
    name: "Haworthia Fasciata",
    description:
      "Zebra-striped succulent that stays compact and tidy on desks.",
    price: 1800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1754823340366-58325535aea5?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SGF3b3J0aGlhJTIwRmFzY2lhdGF8ZW58MHwxfHx8MTc1OTI0NDQwM3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: true,
    watering: "monthly",
  },
  {
    slug: "echeveria-elegans",
    name: "Echeveria Elegans",
    description:
      "Symmetrical rosettes with pastel tones; happiest in sunny windows.",
    price: 1700,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1719306280558-dd56c2de8959?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RWNoZXZlcmlhJTIwRWxlZ2Fuc3xlbnwwfDF8fHwxNzU5MjQ0NDA1fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: true,
    watering: "monthly",
  },
  {
    slug: "hoya-carnosa",
    name: "Hoya Carnosa",
    description:
      "Wax plant with vining growth and starry blooms under good light.",
    price: 3300,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1664635401818-a9dd7dc871d8?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8SG95YSUyMENhcm5vc2F8ZW58MHwxfHx8MTc1OTI0NDQwNnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "english-ivy",
    name: "English Ivy",
    description:
      "Classic trailing ivy for shelves and trellises; appreciates cooler rooms.",
    price: 2100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1665972706046-480d8472a49f?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RW5nbGlzaCUyMEl2eXxlbnwwfDF8fHwxNzU5MjQ0NDA4fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "pilea-peperomioides",
    name: "Chinese Money Plant",
    description:
      "Quirky, coin-shaped leaves on upright petioles; modern design favorite.",
    price: 2700,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1681291882655-b798cc0882bb?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2hpbmVzZSUyME1vbmV5JTIwUGxhbnR8ZW58MHwxfHx8MTc1OTI0NDQwOXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "peperomia-obtusifolia",
    name: "Peperomia Obtusifolia",
    description:
      "Compact, rubbery leaves and easy-going care for office spaces.",
    price: 2200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667239012831-c55686612b3b?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGVwZXJvbWlhJTIwT2J0dXNpZm9saWF8ZW58MHwxfHx8MTc1OTI0NDQzM3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "schefflera-arboricola",
    name: "Umbrella Tree",
    description:
      "Glossy leaflets radiate like umbrellas; takes well to bright rooms.",
    price: 3500,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1664910346493-e34247942295?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8VW1icmVsbGElMjBUcmVlfGVufDB8MXx8fDE3NTkyNDQ0MzR8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "dieffenbachia",
    name: "Dieffenbachia",
    description:
      "Bold, variegated leaves and upright habit; prefers stable conditions.",
    price: 2800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1723618819403-37bfe7b9fa80?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RGllZmZlbmJhY2hpYXxlbnwwfDF8fHwxNzU5MjQ0NDM1fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "watermelon-peperomia",
    name: "Watermelon Peperomia",
    description: "Striking silver and green striped leaves in a compact form.",
    price: 3000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1724256227284-0e987ccd3f5e?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8V2F0ZXJtZWxvbiUyMFBlcGVyb21pYXxlbnwwfDF8fHwxNzU5MjQ0NDM3fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "weeping-fig",
    name: "Weeping Fig",
    description:
      "Graceful tree-form ficus with small leaves and elegant silhouette.",
    price: 4900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1670006625877-c44709fb95c9?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8V2VlcGluZyUyMEZpZ3xlbnwwfDF8fHwxNzU5MjQ0NDM4fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "ficus-ginseng",
    name: "Ficus 'Ginseng'",
    description:
      "Bonsai-style roots with compact foliage; a sculptural desk tree.",
    price: 5200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1700028099559-b296b08c7d4a?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RmljdXMlMjAlMjdHaW5zZW5nJTI3fGVufDB8MXx8fDE3NTkyNDQ0NDB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "snake-plant-moonshine",
    name: "Snake Plant 'Moonshine'",
    description:
      "Silver-green leaves with a minimalist vibe; thrives in low light.",
    price: 3400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1740417220344-93eb64b072bd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U25ha2UlMjBQbGFudCUyMCUyN01vb25zaGluZSUyN3xlbnwwfDF8fHwxNzU5MjQ0NDQxfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "oxalis-triangularis",
    name: "Oxalis Triangularis",
    description: "Purple shamrock leaves that open and close with the light.",
    price: 2400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1674764005537-9b06018fec57?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8T3hhbGlzJTIwVHJpYW5ndWxhcmlzfGVufDB8MXx8fDE3NTkyNDQ0NDJ8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "african-violet",
    name: "African Violet",
    description:
      "Compact rosettes with velvet leaves and cheerful blooms indoors.",
    price: 2100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1678912442416-1653bba76ddd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWZyaWNhbiUyMFZpb2xldHxlbnwwfDF8fHwxNzU5MjQ0NDQ0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "zz-plant-raven",
    name: "ZZ Plant 'Raven'",
    description:
      "Glossy, near-black foliage with the same tough nature as classic ZZ.",
    price: 4200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1719842310808-3edadc76d406?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8WlolMjBQbGFudCUyMCUyN1JhdmVuJTI3fGVufDB8MXx8fDE3NTkyNDQ0NDV8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "agave-attenuata",
    name: "Agave Attenuata",
    description:
      "Sculptural rosette with smooth leaves; dramatic in bright light.",
    price: 3700,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1661405826098-7fddd5f4c06d?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWdhdmUlMjBBdHRlbnVhdGF8ZW58MHwxfHx8MTc1OTI0NDQ0N3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "kalanchoe-blossfeldiana",
    name: "Kalanchoe Blossfeldiana",
    description:
      "Colorful clusters of blooms over fleshy leaves; easy-care succulent.",
    price: 1900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1731914220445-3b06749a2caf?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8S2FsYW5jaG9lJTIwQmxvc3NmZWxkaWFuYXxlbnwwfDF8fHwxNzU5MjQ0NDQ5fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "philodendron-birkin",
    name: "Philodendron 'Birkin'",
    description:
      "Cream pinstripes on deep green; compact and stylish in medium light.",
    price: 3600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1666322759683-561407b73ef4?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGhpbG9kZW5kcm9uJTIwJTI3Qmlya2luJTI3fGVufDB8MXx8fDE3NTkyNDQ0NTB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "satin-pothos",
    name: "Satin Pothos",
    description:
      "Velvety, silver-speckled leaves on trailing vines; dim-light tolerant.",
    price: 2800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1754391063467-60f2be396742?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U2F0aW4lMjBQb3Rob3N8ZW58MHwxfHx8MTc1OTI0NDQ1MXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "arrowhead-plant",
    name: "Arrowhead Plant",
    description: "Shapely, arrow-like leaves that climb or trail with age.",
    price: 2400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1675864662842-6efc0ef31f67?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QXJyb3doZWFkJTIwUGxhbnR8ZW58MHwxfHx8MTc1OTI0NDQ1M3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "alocasia-polly",
    name: "Alocasia 'Polly'",
    description:
      "Striking, shield-shaped leaves with bold veins; loves bright, humid spots.",
    price: 3800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1673524889078-58dd63e18f86?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWxvY2FzaWElMjAlMjdQb2xseSUyN3xlbnwwfDF8fHwxNzU5MjQ0NDU0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "sago-palm",
    name: "Sago Palm",
    description: "Ancient cycad with symmetrical fronds; striking focal plant.",
    price: 5900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1680435083006-32b1a77b790f?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U2FnbyUyMFBhbG18ZW58MHwxfHx8MTc1OTI0NDQ1NXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "palm",
    light: "bright",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "metallica-palm",
    name: "Metallica Palm",
    description: "Compact palm with metallic sheen on leaves; shade tolerant.",
    price: 3300,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1750792815160-b9919759e32d?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TWV0YWxsaWNhJTIwUGFsbXxlbnwwfDF8fHwxNzU5MjQ0NDU2fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "palm",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "tradescantia-zebrina",
    name: "Tradescantia Zebrina",
    description:
      "Fast-growing trailing plant with purple and silver striped leaves.",
    price: 2000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1700315374384-e1b7b1135487?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8VHJhZGVzY2FudGlhJTIwWmVicmluYXxlbnwwfDF8fHwxNzU5MjQ0NDU4fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "fittonia-nerve-plant",
    name: "Fittonia (Nerve Plant)",
    description:
      "Veined leaves in striking patterns; perfect for terrariums and low light.",
    price: 1800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667238874176-069f371d6822?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Rml0dG9uaWElMjAlMjhOZXJ2ZSUyMFBsYW50JTI5fGVufDB8MXx8fDE3NTkyNDQ0NTl8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "asparagus-fern",
    name: "Asparagus Fern",
    description:
      "Fine, feathery foliage that appreciates humidity and bright shade.",
    price: 2100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1666666053961-dba347cf8ea6?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QXNwYXJhZ3VzJTIwRmVybnxlbnwwfDF8fHwxNzU5MjQ0NDYwfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "fern",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "tillandsia-ionantha",
    name: "Tillandsia Ionantha",
    description:
      "Air plant with no soil needed; mist regularly and give it bright light.",
    price: 1200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1700315374384-e1b7b1135487?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8VGlsbGFuZHNpYSUyMElvbmFudGhhfGVufDB8MXx8fDE3NTkyNDQ0NjF8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "air-plant",
    light: "bright",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "nepenthes-pitcher-plant",
    name: "Pitcher Plant (Nepenthes)",
    description:
      "Carnivorous vines that form pitchers; a conversation-starting specimen.",
    price: 4100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1740417220344-93eb64b072bd?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGl0Y2hlciUyMFBsYW50JTIwJTI4TmVwZW50aGVzJTI5fGVufDB8MXx8fDE3NTkyNDQ0NjN8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "carnivorous",
    light: "bright",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "golden-barrel-cactus",
    name: "Golden Barrel Cactus",
    description:
      "Sun-loving globe cactus with golden spines; dramatic in minimal spaces.",
    price: 2600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1679121588096-aa838524bbc3?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8R29sZGVuJTIwQmFycmVsJTIwQ2FjdHVzfGVufDB8MXx8fDE3NTkyNDQ0NjV8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: true,
    watering: "monthly",
  },
  {
    slug: "rattlesnake-calathea",
    name: "Rattlesnake Calathea",
    description:
      "Long, wavy leaves with dark markings; ideal for low to medium light.",
    price: 3000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1720701375185-6a6cf8b8c372?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UmF0dGxlc25ha2UlMjBDYWxhdGhlYXxlbnwwfDF8fHwxNzU5MjQ0NDY3fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "low",
    petSafe: true,
    watering: "weekly",
  },
  {
    slug: "aglaonema-silver-bay",
    name: "Aglaonema 'Silver Bay'",
    description:
      "Wide leaves splashed with silver; thrives in shade and stable temps.",
    price: 3100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1664112065801-390db87e2b82?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWdsYW9uZW1hJTIwJTI3U2lsdmVyJTIwQmF5JTI3fGVufDB8MXx8fDE3NTkyNDQ0Njh8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "low",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "spathiphyllum-domino",
    name: "Peace Lily 'Domino'",
    description:
      "Variegated peace lily with speckled leaves and elegant white blooms.",
    price: 3300,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1749743442347-7538bb49ebb2?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGVhY2UlMjBMaWx5JTIwJTI3RG9taW5vJTI3fGVufDB8MXx8fDE3NTkyNDQ0Njl8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "flowering",
    light: "low",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "strelitzia-reginae",
    name: "Bird of Paradise 'Reginae'",
    description:
      "Smaller Bird of Paradise with vivid orange and blue flowers in bright light.",
    price: 7800,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667239476831-6ecdd39cf6a3?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QmlyZCUyMG9mJTIwUGFyYWRpc2UlMjAlMjdSZWdpbmFlJTI3fGVufDB8MXx8fDE3NTkyNDQ0NzB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "rubber-plant-burgundy",
    name: "Rubber Plant 'Burgundy'",
    description: "Deep burgundy leaves on a resilient ficus; modern and moody.",
    price: 4600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1673399950296-76cb70f6de3b?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UnViYmVyJTIwUGxhbnQlMjAlMjdCdXJndW5keSUyN3xlbnwwfDF8fHwxNzU5MjQ0NDcxfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "philodendron-selloum",
    name: "Philodendron Selloum",
    description:
      "Deeply lobed leaves and a tropical vibe for medium to bright rooms.",
    price: 5400,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667239127299-d8e4b221b660?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGhpbG9kZW5kcm9uJTIwU2VsbG91bXxlbnwwfDF8fHwxNzU5MjQ0NDcyfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tropical",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "string-of-pearls",
    name: "String of Pearls",
    description:
      "Trailing succulent spheres that love sun and sparse watering.",
    price: 2900,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1671641737531-8959f76d4a43?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U3RyaW5nJTIwb2YlMjBQZWFybHN8ZW58MHwxfHx8MTc1OTI0NDQ3M3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "string-of-hearts",
    name: "String of Hearts",
    description:
      "Delicate vines with heart-shaped leaves; thrives in bright, indirect light.",
    price: 3100,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1661589554000-c6f34d86a7c3?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U3RyaW5nJTIwb2YlMjBIZWFydHN8ZW58MHwxfHx8MTc1OTI0NDQ3NXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "bright",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "cast-iron-plant",
    name: "Cast Iron Plant",
    description:
      "Nearly indestructible foliage plant that tolerates low light and neglect.",
    price: 3000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1733266921659-9e175144feda?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2FzdCUyMElyb24lMjBQbGFudHxlbnwwfDF8fHwxNzU5MjQ0NDc2fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "foliage",
    light: "low",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "pothos-njoy",
    name: "Pothos 'N'Joy'",
    description:
      "Compact variegated pothos with bright creamy patches; shelves' favorite.",
    price: 2600,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1686653830755-c455c730ad92?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UG90aG9zJTIwJTI3TiUyN0pveSUyN3xlbnwwfDF8fHwxNzU5MjQ0NDc3fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "sansevieria-hahnii",
    name: "Sansevieria 'Hahnii'",
    description:
      "Compact bird\u2019s nest snake plant; thrives with minimal care.",
    price: 2000,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1700315374384-e1b7b1135487?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U2Fuc2V2aWVyaWElMjAlMjdIYWhuaWklMjd8ZW58MHwxfHx8MTc1OTI0NDQ3OHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "succulent",
    light: "low",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "philodendron-micans",
    name: "Philodendron Micans",
    description:
      "Velvety, bronze-green trailing leaves that glow in soft light.",
    price: 3500,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1667238874176-069f371d6822?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UGhpbG9kZW5kcm9uJTIwTWljYW5zfGVufDB8MXx8fDE3NTkyNDQ0Nzl8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "trailing",
    light: "medium",
    petSafe: false,
    watering: "weekly",
  },
  {
    slug: "dracaena-janet-craig",
    name: "Dracaena 'Janet Craig'",
    description:
      "Glossy deep-green leaves; tolerant of offices and low light corners.",
    price: 3300,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1726170486699-187af19af9e9?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RHJhY2FlbmElMjAlMjdKYW5ldCUyMENyYWlnJTI3fGVufDB8MXx8fDE3NTkyNDQ0ODB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "low",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "schefflera-amate",
    name: "Schefflera 'Amate'",
    description: "Broad, glossy leaflets with a full, umbrella-like canopy.",
    price: 5200,
    currency: "usd",
    image:
      "https://plus.unsplash.com/premium_photo-1700315374384-e1b7b1135487?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8U2NoZWZmbGVyYSUyMCUyN0FtYXRlJTI3fGVufDB8MXx8fDE3NTkyNDQ0ODJ8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1200&q=80",
    category: "tree",
    light: "bright",
    petSafe: false,
    watering: "biweekly",
  },
];

const CARD_SEEDS: PlantSeed[] = [
  {
    slug: "golden-barrel-cactus",
    name: "Golden Barrel Cactus",
    description:
      "Sun-loving globe cactus with golden spines; bold and low maintenance.",
    price: 2600,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "saguaro-cactus",
    name: "Saguaro Cactus",
    description:
      "Iconic upright cactus silhouette that loves full sun and dry soil.",
    price: 7800,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "prickly-pear",
    name: "Prickly Pear",
    description:
      "Flat, paddle-shaped pads with seasonal blooms; a desert classic.",
    price: 3200,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "bunny-ears-cactus",
    name: "Bunny Ears Cactus",
    description: "Soft-looking pads with tiny spines; compact and playful.",
    price: 2400,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "red-spine-barrel",
    name: "Red Spine Barrel",
    description:
      "Ridged barrel cactus with vivid spines and slow, steady growth.",
    price: 2800,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "old-man-cactus",
    name: "Old Man Cactus",
    description:
      "Columnar cactus with fuzzy white hairs that soften the silhouette.",
    price: 3100,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "moon-cactus",
    name: "Moon Cactus",
    description:
      "Colorful grafted cactus that pops on desks and sunny shelves.",
    price: 2200,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "fishbone-cactus",
    name: "Fishbone Cactus",
    description:
      "Zigzag stems with a sculptural, trailing form and bright blooms.",
    price: 2900,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "medium",
    petSafe: false,
    watering: "biweekly",
  },
  {
    slug: "christmas-cactus",
    name: "Christmas Cactus",
    description:
      "Holiday bloomer with segmented stems and bright, dangling flowers.",
    price: 2700,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "medium",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "easter-cactus",
    name: "Easter Cactus",
    description: "Rounded segments and spring blooms with softer, lush growth.",
    price: 2700,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "medium",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "dragon-fruit-cactus",
    name: "Dragon Fruit Cactus",
    description:
      "Climbing cactus with dramatic stems and potential for exotic fruit.",
    price: 3600,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: true,
    watering: "biweekly",
  },
  {
    slug: "blue-myrtle-cactus",
    name: "Blue Myrtle Cactus",
    description: "Tall blue-green columns with a clean, modern desert look.",
    price: 4400,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "fairy-castle-cactus",
    name: "Fairy Castle Cactus",
    description: "Clustered spires that look like tiny towers; slow and hardy.",
    price: 3000,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "peanut-cactus",
    name: "Peanut Cactus",
    description:
      "Low, clumping cactus with finger-like stems and orange blooms.",
    price: 2100,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "hedgehog-cactus",
    name: "Hedgehog Cactus",
    description: "Compact and spiny with showy spring flowers in bright light.",
    price: 2400,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "organ-pipe-cactus",
    name: "Organ Pipe Cactus",
    description:
      "Multiple upright stems that branch from the base like organ pipes.",
    price: 6200,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "bishop-cap-cactus",
    name: "Bishop Cap Cactus",
    description:
      "Star-shaped ribs and a clean, geometric look for minimal setups.",
    price: 2300,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "golden-lace-cactus",
    name: "Golden Lace Cactus",
    description:
      "Dense golden spines on a small globe; great for sunny windows.",
    price: 1900,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "ladyfinger-cactus",
    name: "Ladyfinger Cactus",
    description: "Slender stems that cluster tightly; a tidy desktop cactus.",
    price: 2000,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
  },
  {
    slug: "claret-cup-cactus",
    name: "Claret Cup Cactus",
    description:
      "Compact pads with vivid red flowers when grown in bright light.",
    price: 2500,
    currency: "usd",
    image:
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    category: "cactus",
    light: "bright",
    petSafe: false,
    watering: "monthly",
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
    await stripe.prices
      .update(price.id, { active: false })
      .catch(() => undefined);
    price = null;
  }

  if (price && price.unit_amount !== seed.price) {
    await stripe.prices
      .update(price.id, { active: false })
      .catch(() => undefined);
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
  const seeds = [...PLANTS];
  const existingSlugs = new Set(seeds.map((seed) => seed.slug));

  for (const card of CARD_SEEDS) {
    if (!existingSlugs.has(card.slug)) {
      seeds.push(card);
      existingSlugs.add(card.slug);
    }
  }

  for (const plant of seeds) {
    const { product, price } = await upsertPlant(plant);
    results.push({
      name: plant.name,
      productId: product.id,
      priceId: price.id,
    });
  }

  console.log(`\nSeeded ${results.length} items:`);
  for (const entry of results) {
    console.log(
      `• ${entry.name} → product ${entry.productId}, price ${entry.priceId}`,
    );
  }

  console.log("\nDone. Refresh your Next.js catalog to see the new items.");
}

main().catch((error) => {
  console.error("Failed to seed Stripe:", error);
  process.exit(1);
});
