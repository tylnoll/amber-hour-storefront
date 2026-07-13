"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProductForDisplay } from "@/lib/types";
import { useCart } from "@/components/cart-context";

export function ProductCard({ product }: { product: ProductForDisplay }) {
  const { addLine } = useCart();
  const reduced = useReducedMotion();

  return (
    <motion.article
      className="rounded-2xl border border-[var(--line)] bg-[rgba(251,241,225,0.03)] p-5"
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-4 aspect-[4/3] rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(232,165,75,0.3),rgba(74,42,69,0.4)_60%,rgba(22,17,31,0.95))]" aria-label={product.imageAlt} />
      <p className="eyebrow mb-2">{product.category.replace("-", " ")}</p>
      <h3 className="text-2xl text-[var(--cream)]">{product.name}</h3>
      <p className="mt-2 min-h-14 text-sm leading-6 text-[var(--cream-dim)]">{product.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--cream-dim)]">{product.displayPrice}</p>
          {product.saleApplied && product.originalPrice && (
            <p className="text-xs text-[var(--gold)] line-through">{product.originalPrice}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/products/${product.slug}`} className="focus-ring btn-ghost px-3 py-2 text-sm">
            View
          </Link>
          <button
            type="button"
            className="focus-ring btn-primary px-3 py-2 text-sm"
            onClick={() =>
              addLine({
                productId: product.id,
                variantId: product.variants[0]?.id ?? "default",
                productName: product.name,
                unitPriceDisplay: product.displayPrice,
                quantity: 1,
              })
            }
          >
            Add to cart
          </button>
        </div>
      </div>
    </motion.article>
  );
}
