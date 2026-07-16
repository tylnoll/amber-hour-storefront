import fs from "node:fs/promises";
import path from "node:path";
import { getDataDir } from "@/lib/data-path";
import { Product, ProductCategory, ProductForDisplay, StoreData } from "@/lib/types";

const BANANA_BANSHEE_NOTE =
  "Part of the Banana Banshee batch. This product will not be available until August or September.";
const BANANA_BANSHEE_AVAILABLE_AFTER = "2026-08-01T00:00:00.000Z";
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function isPreRelease() {
  return Date.now() < new Date(BANANA_BANSHEE_AVAILABLE_AFTER).getTime();
}

function withBatchNotice(text: string) {
  if (text.includes("Banana Banshee batch")) {
    return text;
  }
  return `${text} ${BANANA_BANSHEE_NOTE}`.trim();
}

export const categories: Array<{ slug: ProductCategory; label: string; intro: string }> = [
  {
    slug: "honey",
    label: "Honey",
    intro:
      "Raw CBD honey for daily use. Stir into tea, spoon over toast, or take straight when evenings run long.",
  },
  {
    slug: "tea",
    label: "Tea",
    intro:
      "Small-batch THC/CBD tea blends with clear flavor notes and easy steep instructions.",
  },
  {
    slug: "candles",
    label: "Candles",
    intro:
      "Two-way candles: light for atmosphere, then use the warm oil blend on skin once safely cooled.",
  },
  {
    slug: "balms-roll-ons",
    label: "Balms & Roll-Ons",
    intro:
      "Pocket-sized formulas many customers use to unwind before bed.",
  },
];

const storeDataPath = path.join(getDataDir(), "store-data.json");

const defaultStoreData: StoreData = {
  products: [
    {
      id: "prod_tea_wind_down",
      slug: "wind-down-tea",
      name: "Wind Down Tea",
      category: "tea",
      shortDescription: "Chamomile and lavender loose-leaf with clean-dissolving CBD.",
      description:
        "A floral tea blend with chamomile, lavender, and lemon balm. This batch is designed for a smooth wind-down without heavy sweetness or artificial flavoring.",
      ingredients: ["Chamomile", "Lavender", "Lemon balm", "CBD isolate"],
      howToUse:
        "Use 1 tablespoon per cup. Steep 5-7 minutes in hot water, strain, then add honey if desired. Start with one cup and adjust based on your routine.",
      potencyMgCBD: 30,
      thcPercent: "0.09%",
      batchNumber: "AH-TEA-2407",
      coaPdfUrl: "/coas/AH-TEA-2407.pdf",
      recommended: true,
      basePrice: 24,
      inventoryQuantity: 24,
      imageAlt: "Amber Hour Wind Down Tea tin with loose leaves and chamomile blossoms",
      images: ["/images/tea-1.svg", "/images/tea-2.svg"],
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
        "A low-melt soy and coconut candle made for both scent and skin use. After burning, the top layer melts into a warm oil blend that can be used for shoulder, neck, or hand massage.",
      ingredients: ["Soy wax", "Coconut oil", "Cedar and clove fragrance", "CBD distillate"],
      howToUse:
        "Burn 10-20 minutes until a wax pool forms. Blow out the flame, wait briefly, test temperature, then apply a small amount to skin. Never apply while too hot.",
      potencyMgCBD: 50,
      thcPercent: "0.19%",
      batchNumber: "AH-CND-2412",
      coaPdfUrl: "/coas/AH-CND-2412.pdf",
      bestSeller: true,
      basePrice: 38,
      inventoryQuantity: 18,
      imageAlt: "Amber Hour Two-Way Candle in amber glass with cedar notes",
      images: ["/images/candle-1.svg", "/images/candle-2.svg"],
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
        "A pocket roll-on blend for quick topical use on wrists, neck, and temples. Designed for simple daily carry with a clean, non-greasy finish.",
      ingredients: ["MCT oil", "Hemp extract", "Peppermint", "Lavender"],
      howToUse:
        "Apply 2-3 passes to wrists, neck, or temples. Let it absorb for 1-2 minutes before reapplying. For external use only.",
      potencyMgCBD: 25,
      thcPercent: "0.08%",
      batchNumber: "AH-RLB-2409",
      coaPdfUrl: "/coas/AH-RLB-2409.pdf",
      recommended: true,
      basePrice: 18,
      inventoryQuantity: 10,
      imageAlt: "Amber Hour Roll-On Balm bottle with silver roller ball",
      images: ["/images/rollon-1.svg", "/images/rollon-2.svg"],
      variants: [{ id: "rollon_10ml", name: "10 ml" }],
    },
    {
      id: "prod_raw_honey",
      slug: "raw-cbd-honey",
      name: "Raw CBD Honey",
      category: "honey",
      shortDescription: "Never boiled, fully emulsified honey for tea or toast.",
      description:
        "Small-batch infused honey made for even consistency and easy dosing in everyday foods and drinks.",
      ingredients: ["Raw wildflower honey", "CBD distillate"],
      howToUse:
        "Start with 1 teaspoon in tea, yogurt, or on toast. Wait and gauge effect before increasing to a larger serving.",
      potencyMgCBD: 35,
      thcPercent: "0.12%",
      batchNumber: "AH-HNY-2411",
      coaPdfUrl: "/coas/AH-HNY-2411.pdf",
      bestSeller: true,
      basePrice: 40,
      inventoryQuantity: 8,
      imageAlt: "Amber Hour Raw CBD Honey jar with wooden dipper",
      images: ["/images/honey-1.svg", "/images/honey-2.svg"],
      variants: [
        { id: "honey_4oz", name: "4 oz", price: 40 },
        { id: "honey_8oz", name: "8 oz", price: 70 },
      ],
    },
  ],
  settings: {
    announcement: "",
    lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
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
  const parsed = JSON.parse(raw) as StoreData;
  const lowStockThreshold = Math.max(
    1,
    Math.floor(Number(parsed.settings?.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD),
  );

  return {
    ...parsed,
    settings: {
      announcement: parsed.settings?.announcement ?? "",
      sale: {
        active: Boolean(parsed.settings?.sale?.active),
        percentOff: Number(parsed.settings?.sale?.percentOff) || 0,
        label: parsed.settings?.sale?.label ?? "",
      },
      lowStockThreshold,
    },
    products: (parsed.products ?? []).map((product) => ({
      ...product,
      inventoryQuantity: Math.max(0, Math.floor(Number(product.inventoryQuantity) || 0)),
      variants: (product.variants ?? []).map((variant) => ({
        ...variant,
        price: variant.price === undefined ? undefined : Number(variant.price) || 0,
      })),
    })),
  };
}

export async function writeStoreData(data: StoreData) {
  await ensureStoreDataFile();
  const lowStockThreshold = Math.max(
    1,
    Math.floor(Number(data.settings?.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD),
  );
  const next: StoreData = {
    ...data,
    settings: {
      ...data.settings,
      lowStockThreshold,
    },
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(storeDataPath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function applySale(product: Product, settings: StoreData["settings"]): ProductForDisplay {
  const sale = settings.sale;
  const quantity = Number(product.inventoryQuantity) || 0;
  const lowStockThreshold = Math.max(
    1,
    Math.floor(Number(settings.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD),
  );
  const soldOut = isPreRelease() || quantity <= 0;
  const lowStock = quantity > 0 && quantity <= lowStockThreshold;
  const withNotice: Product = {
    ...product,
    inventoryQuantity: quantity,
    shortDescription: withBatchNotice(product.shortDescription),
    description: withBatchNotice(product.description),
  };

  if (!sale.active || sale.percentOff <= 0) {
    return {
      ...withNotice,
      displayPrice: formatPrice(withNotice.basePrice),
      sortPrice: withNotice.basePrice,
      saleApplied: false,
      availabilityNote: BANANA_BANSHEE_NOTE,
      isSoldOut: soldOut,
      isLowStock: lowStock,
    };
  }

  const discounted = Number((withNotice.basePrice * (1 - sale.percentOff / 100)).toFixed(2));

  return {
    ...withNotice,
    displayPrice: formatPrice(discounted),
    originalPrice: formatPrice(withNotice.basePrice),
    sortPrice: discounted,
    saleApplied: true,
    availabilityNote: BANANA_BANSHEE_NOTE,
    isSoldOut: soldOut,
    isLowStock: lowStock,
  };
}

export async function getAllProductsForDisplay() {
  const data = await readStoreData();
  return data.products.map((product) => applySale(product, data.settings));
}

export async function getProductForDisplayBySlug(slug: string) {
  const data = await readStoreData();
  const product = data.products.find((entry) => entry.slug === slug);
  if (!product) return null;
  return applySale(product, data.settings);
}

export async function getProductForDisplayById(id: string) {
  const data = await readStoreData();
  const product = data.products.find((entry) => entry.id === id);
  if (!product) return null;
  return applySale(product, data.settings);
}

export async function getProductsByCategoryForDisplay(category: ProductCategory) {
  const data = await readStoreData();
  return data.products
    .filter((product) => product.category === category)
    .map((product) => applySale(product, data.settings));
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
