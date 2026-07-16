import { ProductForDisplay } from "@/lib/types";

export function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function getSaleFactor(product: Pick<ProductForDisplay, "basePrice" | "sortPrice" | "saleApplied">) {
  if (!product.saleApplied || product.basePrice <= 0) {
    return 1;
  }

  return product.sortPrice / product.basePrice;
}

export function getUnitPriceForVariant(product: ProductForDisplay, variantId: string) {
  const variant = product.variants.find((entry) => entry.id === variantId);
  const base = variant?.price ?? product.basePrice;
  return Number((base * getSaleFactor(product)).toFixed(2));
}
