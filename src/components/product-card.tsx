"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProductForDisplay } from "@/lib/types";
import { useCart } from "@/components/cart-context";
import { formatPrice, getUnitPriceForVariant } from "@/lib/pricing";

export function ProductCard({ product }: { product: ProductForDisplay }) {
  const { addLine } = useCart();
  const reduced = useReducedMotion();
  const defaultVariant = product.variants[0];
  const defaultVariantId = defaultVariant?.id ?? "default";
  const unitPriceDisplay = formatPrice(getUnitPriceForVariant(product, defaultVariantId));
  const originalPriceDisplay =
    defaultVariant?.price !== undefined ? formatPrice(defaultVariant.price) : product.originalPrice;

  return (
    <motion.article
      className="rounded-2xl border border-[var(--line)] bg-[rgba(251,241,225,0.03)] p-5"
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--line)]">
        <Image
          src={product.images[0] || "/images/tea-1.svg"}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
          className="object-cover"
        />
      </div>
      <p className="eyebrow mb-2">{product.category.replace("-", " ")}</p>
      <h3 className="text-2xl text-[var(--cream)]">{product.name}</h3>
      <p className="mt-2 min-h-14 text-sm leading-6 text-[var(--cream-dim)]">{product.shortDescription}</p>
      {product.isLowStock && (
        <p className="mt-2 inline-block rounded-full border border-red-300/40 bg-red-500/20 px-3 py-1 text-xs text-red-100">
          Low stock order soon
        </p>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--cream-dim)]">{unitPriceDisplay}</p>
          {product.saleApplied && originalPriceDisplay && (
            <p className="text-xs text-[var(--gold)] line-through">{originalPriceDisplay}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/products/${product.slug}`} className="focus-ring btn-ghost px-3 py-2 text-sm">
            View
          </Link>
          {product.isSoldOut ? (
            <button
              type="button"
              disabled
              className="rounded-xl border border-slate-400/30 bg-slate-500/30 px-3 py-2 text-sm text-slate-200"
              title={product.availabilityNote}
            >
              Sold out
            </button>
          ) : (
            <button
              type="button"
              className="focus-ring btn-primary px-3 py-2 text-sm"
              onClick={() =>
                addLine({
                  productId: product.id,
                  variantId: defaultVariantId,
                  productName: product.name,
                  unitPriceDisplay,
                  quantity: 1,
                })
              }
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
