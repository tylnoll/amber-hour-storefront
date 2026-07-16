"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatPrice, getUnitPriceForVariant } from "@/lib/pricing";
import { ProductForDisplay } from "@/lib/types";

export function ProductPurchasePanel({ product }: { product: ProductForDisplay }) {
  const { addLine } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = product.variants.find((variant) => variant.id === variantId);
  const unitPrice = getUnitPriceForVariant(product, variantId);
  const unitPriceDisplay = formatPrice(unitPrice);
  const originalPriceDisplay =
    selectedVariant?.price !== undefined ? formatPrice(selectedVariant.price) : product.originalPrice;

  return (
    <aside className="h-fit rounded-2xl border border-[var(--line)] bg-[rgba(22,17,31,0.72)] p-6 lg:sticky lg:top-24">
      <p className="eyebrow">{product.category.replace("-", " ")}</p>
      <h1 className="mt-2 text-5xl">{product.name}</h1>
      <p className="mt-3 text-[var(--cream-dim)]">{unitPriceDisplay}</p>
      {product.saleApplied && originalPriceDisplay && (
        <p className="text-sm text-[var(--gold)] line-through">{originalPriceDisplay}</p>
      )}
      <p className="mt-4 text-[var(--cream-dim)]">{product.shortDescription}</p>
      <p className="mt-3 rounded-xl border border-[var(--line)] bg-[rgba(251,241,225,0.03)] px-4 py-3 text-sm text-[var(--cream-dim)]">
        {product.availabilityNote}
      </p>
      {product.isLowStock && (
        <p className="mt-3 inline-block rounded-full border border-red-300/40 bg-red-500/20 px-3 py-1 text-xs text-red-100">
          Low stock order soon
        </p>
      )}

      <label htmlFor="variant" className="mt-6 block text-sm text-[var(--cream-dim)]">
        Variant
      </label>
      <select
        id="variant"
        value={variantId}
        onChange={(event) => setVariantId(event.target.value)}
        className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
      >
        {product.variants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.name}
          </option>
        ))}
      </select>

      <label htmlFor="qty" className="mt-4 block text-sm text-[var(--cream-dim)]">
        Quantity
      </label>
      <input
        id="qty"
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
        className="focus-ring mt-2 w-32 rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
      />

      {product.isSoldOut ? (
        <button
          type="button"
          disabled
          className="mt-6 w-full rounded-xl border border-slate-400/30 bg-slate-500/30 px-6 py-3 text-slate-200"
          title={product.availabilityNote}
        >
          Sold out
        </button>
      ) : (
        <button
          type="button"
          className="focus-ring btn-primary mt-6 w-full px-6 py-3"
          onClick={() =>
            addLine({
              productId: product.id,
              variantId,
              productName: product.name,
              unitPriceDisplay,
              quantity,
            })
          }
        >
          Add to cart
        </button>
      )}

      <div className="mt-8 rounded-xl border border-[var(--line)] p-4 text-sm text-[var(--cream-dim)]">
        <p>THC: {product.thcPercent}</p>
        <p>Batch/Lot: {product.batchNumber}</p>
        <Link href={product.coaPdfUrl} target="_blank" className="focus-ring mt-2 inline-block text-[var(--gold)]">
          View COA PDF
        </Link>
      </div>
    </aside>
  );
}
