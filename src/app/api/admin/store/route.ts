import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { Product, ProductCategory, StoreData } from "@/lib/types";
import { readStoreData, writeStoreData } from "@/lib/store-data";

export async function GET() {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const data = await readStoreData();
  return NextResponse.json({ ok: true, data });
}

type ActionBody =
  | { action: "updateSettings"; settings: StoreData["settings"] }
  | { action: "createProduct"; product: Product }
  | { action: "updateProduct"; product: Product }
  | { action: "deleteProduct"; productId: string };

function normalize(product: Product): Product {
  const safeCategory: ProductCategory = ["honey", "tea", "candles", "balms-roll-ons"].includes(
    product.category,
  )
    ? product.category
    : "tea";

  return {
    ...product,
    category: safeCategory,
    basePrice: Number(product.basePrice) || 0,
    inventoryQuantity: Math.max(0, Math.floor(Number(product.inventoryQuantity) || 0)),
    potencyMgCBD: Number(product.potencyMgCBD) || 0,
    ingredients: product.ingredients.filter(Boolean),
    images: product.images.filter(Boolean),
    variants: product.variants
      .filter((variant) => variant.id && variant.name)
      .map((variant) => ({
        ...variant,
        price: variant.price === undefined ? undefined : Number(variant.price) || 0,
      })),
  };
}

export async function POST(request: Request) {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json()) as ActionBody;
  const current = await readStoreData();

  if (body.action === "updateSettings") {
    const nextSettings: StoreData["settings"] = {
      announcement: body.settings.announcement ?? "",
      sale: {
        active: Boolean(body.settings.sale?.active),
        percentOff: Number(body.settings.sale?.percentOff) || 0,
        label: body.settings.sale?.label ?? "",
      },
      lowStockThreshold: Math.max(1, Math.floor(Number(body.settings.lowStockThreshold) || 5)),
    };
    const next = await writeStoreData({ ...current, settings: nextSettings });
    return NextResponse.json({ ok: true, data: next });
  }

  if (body.action === "createProduct") {
    const product = normalize(body.product);
    if (!product.id) {
      return NextResponse.json({ ok: false, error: "Product ID is required." }, { status: 400 });
    }
    if (current.products.some((entry) => entry.id === product.id)) {
      return NextResponse.json({ ok: false, error: `Product ID "${product.id}" already exists.` }, { status: 400 });
    }
    if (current.products.some((entry) => entry.slug === product.slug)) {
      return NextResponse.json({ ok: false, error: `Product slug "${product.slug}" is already in use.` }, { status: 400 });
    }
    const next = await writeStoreData({ ...current, products: [...current.products, product] });
    return NextResponse.json({ ok: true, data: next });
  }

  if (body.action === "updateProduct") {
    const product = normalize(body.product);
    const next = await writeStoreData({
      ...current,
      products: current.products.map((entry) => (entry.id === product.id ? product : entry)),
    });
    return NextResponse.json({ ok: true, data: next });
  }

  if (body.action === "deleteProduct") {
    const next = await writeStoreData({
      ...current,
      products: current.products.filter((entry) => entry.id !== body.productId),
    });
    return NextResponse.json({ ok: true, data: next });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
