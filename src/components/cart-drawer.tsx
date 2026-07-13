"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

export function CartDrawer() {
  const { isOpen, closeCart, lines, removeLine, updateQuantity } = useCart();

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close cart"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-[var(--line)] bg-[var(--night-deep)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl">Your cart</h2>
          <button type="button" className="focus-ring btn-ghost px-3 py-2 text-sm" onClick={closeCart}>
            Close
          </button>
        </div>

        <div className="space-y-4">
          {lines.length === 0 && (
            <p className="text-sm text-[var(--cream-dim)]">Your cart is empty.</p>
          )}

          {lines.map((line) => (
            <article key={`${line.productId}-${line.variantId}`} className="rounded-xl border border-[var(--line)] p-4">
              <p className="text-lg">{line.productName}</p>
              <p className="text-sm text-[var(--cream-dim)]">{line.unitPriceDisplay}</p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-sm" htmlFor={`qty-${line.productId}-${line.variantId}`}>
                  Qty
                </label>
                <input
                  id={`qty-${line.productId}-${line.variantId}`}
                  className="focus-ring w-16 rounded-md border border-[var(--line)] bg-transparent px-2 py-1"
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) =>
                    updateQuantity(line.productId, line.variantId, Number(event.target.value))
                  }
                />
                <button
                  type="button"
                  className="focus-ring btn-ghost ml-auto px-3 py-1 text-sm"
                  onClick={() => removeLine(line.productId, line.variantId)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/cart" className="focus-ring btn-ghost block px-4 py-3 text-center" onClick={closeCart}>
            View cart page
          </Link>
          <Link href="/checkout" className="focus-ring btn-primary block px-4 py-3 text-center" onClick={closeCart}>
            Continue to checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
