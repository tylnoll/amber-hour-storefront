import fs from "node:fs/promises";
import path from "node:path";
import { Product, ProductCategory, ProductForDisplay, StoreData } from "@/lib/types";

export const categories: Array<{ slug: ProductCategory; label: string; intro: string }> = [
  {
    slug: "honey",
    label: "Honey",
    intro:
      "Raw CBD honey for the anytime ritual. Stir into tea, spoon over toast, or take straight when evenings run long.",
  },
  {
    slug: "tea",
    label: "Tea",
    intro:
      "Wind Down and Focus blends built around concrete flavor, not fluff. Slow steeping, soft landing.",
  },
  {
    slug: "candles",
    label: "Candles",
    intro:
      "Two-way candles for the 8pm moment: burn for atmosphere, then use the warm oil as massage oil.",
  },
  {
    slug: "balms-roll-ons",
    label: "Balms & Roll-Ons",
    intro:
      "Fastest entry point to the ritual. Pocket-sized formulas many customers use to unwind before bed.",
  },
  {
    slug: "bundles",
    label: "Bundles",
    intro: "Everything in one box, gift-ready.",
  },
];

const storeDataPath = path.join(process.cwd(), "data", "store-data.json");

const defaultStoreData: StoreData = {
  products: [
    {
      id: "prod_tea_wind_down",
      slug: "wind-down-tea",
      name: "Wind Down Tea",
      category: "tea",
      shortDescription: "Chamomile and lavender loose-leaf with clean-dissolving CBD.",
      description:
        "A floral evening steep designed for slower breathing and a gentler handoff into night. Many customers use this as their first ritual marker after work.",
      ingredients: ["Chamomile", "Lavender", "Lemon balm", "CBD isolate"],
      howToUse: "Steep 1 tablespoon for 5-7 minutes. Add honey if you like a warmer finish.",
      potencyMgCBD: 30,
      thcPercent: "0.09%",
      batchNumber: "AH-TEA-2407",
      coaPdfUrl: "/coas/AH-TEA-2407.pdf",
      recommended: true,
      basePrice: 24,
      imageAlt: "Amber Hour Wind Down Tea tin with loose leaves and chamomile blossoms",
      images: ["/images/tea-1.jpg", "/images/tea-2.jpg"],
      variants: [
        { id: "tea_20_bags", name: "20-bag tin" },
        { id: "tea_refill", name: "Refill pouch" },
      ],
    },
    {
      id: "prod_candle_two_way",
      slug: "two-way-candle",
      name: "Two-Way Candle",
      category: "candles",
      shortDescription: "Low-melt soy candle that doubles as warm massage oil.",
      description:
        "Burn for 15-20 minutes and blow it out. The pooled wax stays skin-safe and smooth for shoulder or hand massage.",
      ingredients: ["Soy wax", "Coconut oil", "Cedar and clove fragrance", "CBD distillate"],
      howToUse: "Burn until a wax pool forms, extinguish, then apply a small amount to skin.",
      potencyMgCBD: 50,
      thcPercent: "0.19%",
      batchNumber: "AH-CND-2412",
      coaPdfUrl: "/coas/AH-CND-2412.pdf",
      bestSeller: true,
      basePrice: 38,
      imageAlt: "Amber Hour Two-Way Candle in amber glass with cedar notes",
      images: ["/images/candle-1.jpg", "/images/candle-2.jpg"],
      variants: [
        { id: "candle_8oz", name: "8 oz" },
        { id: "candle_12oz", name: "12 oz" },
      ],
    },
    {
      id: "prod_roll_on_balm",
      slug: "roll-on-balm",
      name: "Roll-On Balm",
      category: "balms-roll-ons",
      shortDescription: "Pocket roll-on for neck and wrist in seconds.",
      description:
        "The quickest ritual in the line. Keep one in your bag and one on your nightstand.",
      ingredients: ["MCT oil", "Hemp extract", "Peppermint", "Lavender"],
      howToUse: "Apply three passes on wrists, temples, or neck whenever you need to reset.",
      potencyMgCBD: 25,
      thcPercent: "0.08%",
      batchNumber: "AH-RLB-2409",
      coaPdfUrl: "/coas/AH-RLB-2409.pdf",
      recommended: true,
      basePrice: 18,
      imageAlt: "Amber Hour Roll-On Balm bottle with matte black cap",
      images: ["/images/rollon-1.jpg", "/images/rollon-2.jpg"],
      variants: [{ id: "rollon_10ml", name: "10 ml" }],
    },
    {
      id: "prod_raw_honey",
      slug: "raw-cbd-honey",
      name: "Raw CBD Honey",
      category: "honey",
      shortDescription: "Never boiled, fully emulsified honey for tea or toast.",
      description:
        "Gently warmed so cannabinoids stay intact, then emulsified for an even spoon every time.",
      ingredients: ["Raw wildflower honey", "CBD distillate"],
      howToUse: "Use one teaspoon in tea, yogurt, or straight from the spoon.",
      potencyMgCBD: 35,
      thcPercent: "0.12%",
      batchNumber: "AH-HNY-2411",
      coaPdfUrl: "/coas/AH-HNY-2411.pdf",
      bestSeller: true,
      basePrice: 28,
      imageAlt: "Amber Hour Raw CBD Honey jar with wooden dipper",
      images: ["/images/honey-1.jpg", "/images/honey-2.jpg"],
      variants: [
        { id: "honey_4oz", name: "4 oz" },
        { id: "honey_8oz", name: "8 oz" },
      ],
    },
    {
      id: "prod_bundle_evening",
      slug: "evening-ritual-set",
      name: "Evening Ritual Set",
      category: "bundles",
      shortDescription: "All four rituals in one gift-ready set.",
      description: "The full evening arc in one box: tea, candle, roll-on, and honey.",
      ingredients: ["Mixed kit"],
      howToUse: "Start at any hour and stack rituals as needed.",
      potencyMgCBD: 140,
      thcPercent: "0.22%",
      batchNumber: "AH-BND-2413",
      coaPdfUrl: "/coas/AH-BND-2413.pdf",
      bestSeller: true,
      recommended: true,
      basePrice: 86,
      imageAlt: "Amber Hour Evening Ritual Set gift box with four products",
      images: ["/images/bundle-1.jpg", "/images/bundle-2.jpg"],
      variants: [{ id: "bundle_standard", name: "Standard set" }],
    },
  ],
  settings: {
    announcement: "",
    sale: {
      active: false,
      percentOff: 0,
      label: "",
    },
  },
  updatedAt: new Date().toISOString(),
};

async function ensureStoreDataFile() {
  try {
    await fs.access(storeDataPath);
  } catch {
    await fs.mkdir(path.dirname(storeDataPath), { recursive: true });
    await fs.writeFile(storeDataPath, JSON.stringify(defaultStoreData, null, 2), "utf8");
  }
}

export async function readStoreData(): Promise<StoreData> {
  await ensureStoreDataFile();
  const raw = await fs.readFile(storeDataPath, "utf8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStoreData(data: StoreData) {
  await ensureStoreDataFile();
  const next: StoreData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(storeDataPath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function applySale(product: Product, sale: StoreData["settings"]["sale"]): ProductForDisplay {
  if (!sale.active || sale.percentOff <= 0) {
    return {
      ...product,
      displayPrice: formatPrice(product.basePrice),
      sortPrice: product.basePrice,
      saleApplied: false,
    };
  }

  const discounted = Number((product.basePrice * (1 - sale.percentOff / 100)).toFixed(2));

  return {
    ...product,
    displayPrice: formatPrice(discounted),
    originalPrice: formatPrice(product.basePrice),
    sortPrice: discounted,
    saleApplied: true,
  };
}

export async function getAllProductsForDisplay() {
  const data = await readStoreData();
  return data.products.map((product) => applySale(product, data.settings.sale));
}

export async function getProductForDisplayBySlug(slug: string) {
  const data = await readStoreData();
  const product = data.products.find((entry) => entry.slug === slug);
  if (!product) return null;
  return applySale(product, data.settings.sale);
}

export async function getProductForDisplayById(id: string) {
  const data = await readStoreData();
  const product = data.products.find((entry) => entry.id === id);
  if (!product) return null;
  return applySale(product, data.settings.sale);
}

export async function getProductsByCategoryForDisplay(category: ProductCategory) {
  const data = await readStoreData();
  return data.products
    .filter((product) => product.category === category)
    .map((product) => applySale(product, data.settings.sale));
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
