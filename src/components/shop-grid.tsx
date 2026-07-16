"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductForDisplay } from "@/lib/types";

type SortKey = "recommended" | "best-sellers" | "price-low" | "price-high" | "potency";

export function ShopGrid({
  products,
  heading,
  intro,
}: {
  products: ProductForDisplay[];
  heading: string;
  intro: string;
}) {
  const [sort, setSort] = useState<SortKey>("recommended");

  const sorted = useMemo(() => {
    const copy = [...products];

    if (sort === "price-low") return copy.sort((a, b) => a.sortPrice - b.sortPrice);
    if (sort === "price-high") return copy.sort((a, b) => b.sortPrice - a.sortPrice);
    if (sort === "potency") return copy.sort((a, b) => b.potencyMgCBD - a.potencyMgCBD);
    if (sort === "best-sellers") return copy.sort((a, b) => Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller)));

    return copy.sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)));
  }, [products, sort]);

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1200px,100%)]">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-2 text-6xl">{heading}</h1>
        <p className="mt-4 max-w-2xl text-[var(--cream-dim)]">{intro}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label htmlFor="sort" className="text-sm text-[var(--cream-dim)]">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="focus-ring rounded-full border border-[var(--line)] bg-[var(--night)] px-4 py-2 text-sm"
          >
            <option value="recommended">Most recommended</option>
            <option value="best-sellers">Best sellers</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="potency">Potency</option>
          </select>
          <p className="text-xs text-[var(--cream-dim)]">Prices and sales are managed in the admin dashboard.</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
