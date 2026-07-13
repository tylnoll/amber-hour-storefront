"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

export default function CartPage() {
  const { lines, updateQuantity, removeLine } = useCart();

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1000px,100%)]">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-2 text-6xl">Your Ritual Cart</h1>
        <div className="mt-8 space-y-3">
          {lines.length === 0 && <p className="text-[var(--cream-dim)]">Cart is currently empty.</p>}
          {lines.map((line) => (
            <article key={`${line.productId}-${line.variantId}`} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl">{line.productName}</p>
                <p className="text-sm text-[var(--cream-dim)]">{line.unitPriceDisplay}</p>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) =>
                    updateQuantity(line.productId, line.variantId, Number(event.target.value))
                  }
                  className="focus-ring w-20 rounded-lg border border-[var(--line)] bg-transparent px-2 py-1"
                />
                <button
                  type="button"
                  className="focus-ring btn-ghost ml-auto px-3 py-2 text-sm"
                  onClick={() => removeLine(line.productId, line.variantId)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <Link href="/checkout" className="focus-ring btn-primary mt-8 inline-block px-6 py-3">
          Proceed to checkout
        </Link>
      </div>
    </section>
  );
}
