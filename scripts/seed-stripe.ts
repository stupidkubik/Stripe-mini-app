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
    "slug": "monstera-deliciosa",
    "name": "Monstera Deliciosa",
    "description": "A statement climber with iconic split leaves that thrives in bright, indirect light.",
    "price": 5200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1526376110933-3929d3b822f3?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "fiddle-leaf-fig",
    "name": "Fiddle Leaf Fig",
    "description": "Tall and dramatic foliage that instantly elevates any living space.",
    "price": 6800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "snake-plant-laurentii",
    "name": "Snake Plant 'Laurentii'",
    "description": "Legendary low-maintenance plant with upright, variegated blades that tolerate low light.",
    "price": 3200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1605100804763-5f0f4f30f8e8?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "low",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "zz-plant",
    "name": "ZZ Plant",
    "description": "Glossy, architectural foliage that thrives on neglect and low light.",
    "price": 3600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1614594852330-0d9a6e3f5e2b?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "low",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "golden-pothos",
    "name": "Golden Pothos",
    "description": "Trailing classic with heart-shaped leaves, perfect for shelves and hanging planters.",
    "price": 2400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1605649487215-83b0049c81a5?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "heartleaf-philodendron",
    "name": "Heartleaf Philodendron",
    "description": "Easy trailing philodendron with lush, heart-shaped leaves for cozy corners.",
    "price": 2600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1614595475241-e1b973a43c50?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "spider-plant",
    "name": "Spider Plant",
    "description": "Airy arching foliage with baby plantlets that root easily; great for beginners.",
    "price": 2300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1600334129128-685c5582fd5f?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "peace-lily",
    "name": "Peace Lily",
    "description": "Elegant white bracts and deep green leaves; a forgiving indoor flowering plant.",
    "price": 2900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1545249390-6a7f07f3f0ea?auto=format&fit=crop&w=1200&q=80",
    "category": "flowering",
    "light": "low",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "rubber-plant",
    "name": "Rubber Plant",
    "description": "Thick, glossy leaves on a sturdy tree-form that loves bright rooms.",
    "price": 4200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1604697963437-9b2b3c3bbb04?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "dracaena-marginata",
    "name": "Dracaena Marginata",
    "description": "Slim, sculptural canes with fine, spiky leaves; tolerant of varied light.",
    "price": 3400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1617184072615-3e7e7c6d7b4c?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "medium",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "areca-palm",
    "name": "Areca Palm",
    "description": "Feathery fronds create a soft, tropical vibe; a classic living room palm.",
    "price": 4500,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1596803244618-8d09a5fcf2f8?auto=format&fit=crop&w=1200&q=80",
    "category": "palm",
    "light": "bright",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "parlor-palm",
    "name": "Parlor Palm",
    "description": "Compact, shade-friendly palm that purifies air and thrives in apartments.",
    "price": 2800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1593696954577-ab3e6bdaf6d4?auto=format&fit=crop&w=1200&q=80",
    "category": "palm",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "bird-of-paradise",
    "name": "Bird of Paradise",
    "description": "Bold, banana-like leaves and tropical stature for sun-drenched interiors.",
    "price": 7200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1543326727-cf6c39c16632?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "calathea-orbifolia",
    "name": "Calathea Orbifolia",
    "description": "Striped, oversized leaves with a satiny sheen; loves humidity and gentle light.",
    "price": 3900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1598899134739-24b8f8f63a5b?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "medium",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "prayer-plant",
    "name": "Prayer Plant",
    "description": "Foliage that folds at night; vibrant veining and compact growth.",
    "price": 3100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1615485737560-3ce0db1f784e?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "chinese-evergreen",
    "name": "Chinese Evergreen",
    "description": "Reliable, variegated foliage that tolerates shade and indoor air.",
    "price": 2700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1598899144738-89d0f9652a33?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "low",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "anthurium-andraeanum",
    "name": "Anthurium",
    "description": "Glossy heart-shaped leaves and long-lasting waxy blooms.",
    "price": 3800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1545249390-0c6a7d67034b?auto=format&fit=crop&w=1200&q=80",
    "category": "flowering",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "boston-fern",
    "name": "Boston Fern",
    "description": "Classic, lush fronds that appreciate humidity and consistent moisture.",
    "price": 2500,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&w=1200&q=80",
    "category": "fern",
    "light": "medium",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "maidenhair-fern",
    "name": "Maidenhair Fern",
    "description": "Delicate, airy fronds with fine texture; loves even moisture.",
    "price": 2900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1592592101258-f81a30f23fab?auto=format&fit=crop&w=1200&q=80",
    "category": "fern",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "aloe-vera",
    "name": "Aloe Vera",
    "description": "Sun-loving succulent with sculptural rosettes; minimal watering.",
    "price": 2200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1563170423-18f482d82e9c?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "jade-plant",
    "name": "Jade Plant",
    "description": "Thick, coin-like leaves and bonsai potential; a sun-loving classic.",
    "price": 3000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1553532435-93d57d3731cd?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "haworthia-fasciata",
    "name": "Haworthia Fasciata",
    "description": "Zebra-striped succulent that stays compact and tidy on desks.",
    "price": 1800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": true,
    "watering": "monthly"
  },
  {
    "slug": "echeveria-elegans",
    "name": "Echeveria Elegans",
    "description": "Symmetrical rosettes with pastel tones; happiest in sunny windows.",
    "price": 1700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1545249390-03db8dd4f0d7?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": true,
    "watering": "monthly"
  },
  {
    "slug": "hoya-carnosa",
    "name": "Hoya Carnosa",
    "description": "Wax plant with vining growth and starry blooms under good light.",
    "price": 3300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1615485737323-f8a19a58afd5?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "english-ivy",
    "name": "English Ivy",
    "description": "Classic trailing ivy for shelves and trellises; appreciates cooler rooms.",
    "price": 2100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1521175776577-2b7730eb1c8b?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "pilea-peperomioides",
    "name": "Chinese Money Plant",
    "description": "Quirky, coin-shaped leaves on upright petioles; modern design favorite.",
    "price": 2700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "peperomia-obtusifolia",
    "name": "Peperomia Obtusifolia",
    "description": "Compact, rubbery leaves and easy-going care for office spaces.",
    "price": 2200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1582582429419-a9a6a2b1d93e?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "schefflera-arboricola",
    "name": "Umbrella Tree",
    "description": "Glossy leaflets radiate like umbrellas; takes well to bright rooms.",
    "price": 3500,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1598899139070-1fd5b9a2e9b6?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "dieffenbachia",
    "name": "Dieffenbachia",
    "description": "Bold, variegated leaves and upright habit; prefers stable conditions.",
    "price": 2800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1615485737442-8e4b50e7a2a6?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "watermelon-peperomia",
    "name": "Watermelon Peperomia",
    "description": "Striking silver and green striped leaves in a compact form.",
    "price": 3000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1615485737199-2f6a9e1d3e8c?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "weeping-fig",
    "name": "Weeping Fig",
    "description": "Graceful tree-form ficus with small leaves and elegant silhouette.",
    "price": 4900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1604697962407-9a3bed5a0d24?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "ficus-ginseng",
    "name": "Ficus 'Ginseng'",
    "description": "Bonsai-style roots with compact foliage; a sculptural desk tree.",
    "price": 5200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1563898061164-0d1f3e53a0e7?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "snake-plant-moonshine",
    "name": "Snake Plant 'Moonshine'",
    "description": "Silver-green leaves with a minimalist vibe; thrives in low light.",
    "price": 3400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1586719952961-3f3d3cd4e00f?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "low",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "oxalis-triangularis",
    "name": "Oxalis Triangularis",
    "description": "Purple shamrock leaves that open and close with the light.",
    "price": 2400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1603133872878-684b185fad53?auto=format&fit=crop&w=1200&q=80",
    "category": "flowering",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "african-violet",
    "name": "African Violet",
    "description": "Compact rosettes with velvet leaves and cheerful blooms indoors.",
    "price": 2100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1589820296156-c0a7b9ab96e6?auto=format&fit=crop&w=1200&q=80",
    "category": "flowering",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "zz-plant-raven",
    "name": "ZZ Plant 'Raven'",
    "description": "Glossy, near-black foliage with the same tough nature as classic ZZ.",
    "price": 4200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1614595474926-0b6a676a2a6a?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "low",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "agave-attenuata",
    "name": "Agave Attenuata",
    "description": "Sculptural rosette with smooth leaves; dramatic in bright light.",
    "price": 3700,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1582034985068-837b25577f03?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "kalanchoe-blossfeldiana",
    "name": "Kalanchoe Blossfeldiana",
    "description": "Colorful clusters of blooms over fleshy leaves; easy-care succulent.",
    "price": 1900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "philodendron-birkin",
    "name": "Philodendron 'Birkin'",
    "description": "Cream pinstripes on deep green; compact and stylish in medium light.",
    "price": 3600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1606761568499-6f3a2aad91fb?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "satin-pothos",
    "name": "Satin Pothos",
    "description": "Velvety, silver-speckled leaves on trailing vines; dim-light tolerant.",
    "price": 2800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1614594852899-6c1a0e1a6e9a?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "arrowhead-plant",
    "name": "Arrowhead Plant",
    "description": "Shapely, arrow-like leaves that climb or trail with age.",
    "price": 2400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1598899137028-300aa8e3bba8?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "alocasia-polly",
    "name": "Alocasia 'Polly'",
    "description": "Striking, shield-shaped leaves with bold veins; loves bright, humid spots.",
    "price": 3800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1615485737027-88c5d9bca85b?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "sago-palm",
    "name": "Sago Palm",
    "description": "Ancient cycad with symmetrical fronds; striking focal plant.",
    "price": 5900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1589367920962-394ed5e9f64d?auto=format&fit=crop&w=1200&q=80",
    "category": "palm",
    "light": "bright",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "metallica-palm",
    "name": "Metallica Palm",
    "description": "Compact palm with metallic sheen on leaves; shade tolerant.",
    "price": 3300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1526312426976-593c2b999f57?auto=format&fit=crop&w=1200&q=80",
    "category": "palm",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "tradescantia-zebrina",
    "name": "Tradescantia Zebrina",
    "description": "Fast-growing trailing plant with purple and silver striped leaves.",
    "price": 2000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1602978721518-828a53ea50b2?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "fittonia-nerve-plant",
    "name": "Fittonia (Nerve Plant)",
    "description": "Veined leaves in striking patterns; perfect for terrariums and low light.",
    "price": 1800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1581888227599-779811939f5d?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "asparagus-fern",
    "name": "Asparagus Fern",
    "description": "Fine, feathery foliage that appreciates humidity and bright shade.",
    "price": 2100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1604697962027-0a853ee1f3fb?auto=format&fit=crop&w=1200&q=80",
    "category": "fern",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "tillandsia-ionantha",
    "name": "Tillandsia Ionantha",
    "description": "Air plant with no soil needed; mist regularly and give it bright light.",
    "price": 1200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "category": "air-plant",
    "light": "bright",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "nepenthes-pitcher-plant",
    "name": "Pitcher Plant (Nepenthes)",
    "description": "Carnivorous vines that form pitchers; a conversation-starting specimen.",
    "price": 4100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1601560893710-8a46d8a286ec?auto=format&fit=crop&w=1200&q=80",
    "category": "carnivorous",
    "light": "bright",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "golden-barrel-cactus",
    "name": "Golden Barrel Cactus",
    "description": "Sun-loving globe cactus with golden spines; dramatic in minimal spaces.",
    "price": 2600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1536548665027-5a69c2eb0a95?auto=format&fit=crop&w=1200&q=80",
    "category": "cactus",
    "light": "bright",
    "petSafe": true,
    "watering": "monthly"
  },
  {
    "slug": "rattlesnake-calathea",
    "name": "Rattlesnake Calathea",
    "description": "Long, wavy leaves with dark markings; ideal for low to medium light.",
    "price": 3000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1629058452268-bb6a7f4b3a82?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "low",
    "petSafe": true,
    "watering": "weekly"
  },
  {
    "slug": "aglaonema-silver-bay",
    "name": "Aglaonema 'Silver Bay'",
    "description": "Wide leaves splashed with silver; thrives in shade and stable temps.",
    "price": 3100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1604697963316-2209cb34a8e9?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "low",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "spathiphyllum-domino",
    "name": "Peace Lily 'Domino'",
    "description": "Variegated peace lily with speckled leaves and elegant white blooms.",
    "price": 3300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1545249390-6a7f07f3f0ea?auto=format&fit=crop&w=1200&q=80",
    "category": "flowering",
    "light": "low",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "strelitzia-reginae",
    "name": "Bird of Paradise 'Reginae'",
    "description": "Smaller Bird of Paradise with vivid orange and blue flowers in bright light.",
    "price": 7800,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1504731239163-7f3f640e25b3?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "rubber-plant-burgundy",
    "name": "Rubber Plant 'Burgundy'",
    "description": "Deep burgundy leaves on a resilient ficus; modern and moody.",
    "price": 4600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1599340375552-3c229f1bfe63?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "philodendron-selloum",
    "name": "Philodendron Selloum",
    "description": "Deeply lobed leaves and a tropical vibe for medium to bright rooms.",
    "price": 5400,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1587735514366-2b5c43451716?auto=format&fit=crop&w=1200&q=80",
    "category": "tropical",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "string-of-pearls",
    "name": "String of Pearls",
    "description": "Trailing succulent spheres that love sun and sparse watering.",
    "price": 2900,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1600294037681-9f50c97b5b59?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "bright",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "string-of-hearts",
    "name": "String of Hearts",
    "description": "Delicate vines with heart-shaped leaves; thrives in bright, indirect light.",
    "price": 3100,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1563132330-0b41fb8e1dcd?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "bright",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "cast-iron-plant",
    "name": "Cast Iron Plant",
    "description": "Nearly indestructible foliage plant that tolerates low light and neglect.",
    "price": 3000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1574607383364-49a9c9b3d831?auto=format&fit=crop&w=1200&q=80",
    "category": "foliage",
    "light": "low",
    "petSafe": true,
    "watering": "biweekly"
  },
  {
    "slug": "pothos-njoy",
    "name": "Pothos 'N'Joy'",
    "description": "Compact variegated pothos with bright creamy patches; shelves' favorite.",
    "price": 2600,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1614595475405-4b0f96e65e0d?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "sansevieria-hahnii",
    "name": "Sansevieria 'Hahnii'",
    "description": "Compact bird’s nest snake plant; thrives with minimal care.",
    "price": 2000,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1605100804763-5f0f4f30f8e8?auto=format&fit=crop&w=1200&q=80",
    "category": "succulent",
    "light": "low",
    "petSafe": false,
    "watering": "monthly"
  },
  {
    "slug": "philodendron-micans",
    "name": "Philodendron Micans",
    "description": "Velvety, bronze-green trailing leaves that glow in soft light.",
    "price": 3500,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1605649487215-83b0049c81a5?auto=format&fit=crop&w=1200&q=80",
    "category": "trailing",
    "light": "medium",
    "petSafe": false,
    "watering": "weekly"
  },
  {
    "slug": "dracaena-janet-craig",
    "name": "Dracaena 'Janet Craig'",
    "description": "Glossy deep-green leaves; tolerant of offices and low light corners.",
    "price": 3300,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1598899144738-89d0f9652a33?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "low",
    "petSafe": false,
    "watering": "biweekly"
  },
  {
    "slug": "schefflera-amate",
    "name": "Schefflera 'Amate'",
    "description": "Broad, glossy leaflets with a full, umbrella-like canopy.",
    "price": 5200,
    "currency": "usd",
    "image": "https://images.unsplash.com/photo-1604697963437-9b2b3c3bbb04?auto=format&fit=crop&w=1200&q=80",
    "category": "tree",
    "light": "bright",
    "petSafe": false,
    "watering": "biweekly"
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
