import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { getAllProducts, getProductBySlug } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getAllProducts();

  const crossSell = allProducts
    .filter((entry) => entry.id !== product.id && entry.category !== "bundles")
    .slice(0, 3);

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto grid w-[min(1200px,100%)] gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          {product.images.map((image, index) => (
            <div
              key={image}
              className="aspect-[4/3] rounded-2xl border border-[var(--line)] bg-[radial-gradient(circle_at_20%_20%,rgba(232,165,75,0.3),rgba(74,42,69,0.4)_60%,rgba(22,17,31,0.95))] p-4"
            >
              <p className="text-xs text-[var(--cream-dim)]">{product.imageAlt} {index + 1}</p>
            </div>
          ))}
        </div>

        <ProductPurchasePanel product={product} />
      </div>

      <div className="mx-auto mt-12 w-[min(1200px,100%)] space-y-8">
        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Description</h2>
          <p className="mt-3 text-[var(--cream-dim)]">{product.description}</p>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Ingredients</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--cream-dim)]">
            {product.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">How to use</h2>
          <p className="mt-3 text-[var(--cream-dim)]">{product.howToUse}</p>
        </section>
      </div>

      <section className="mx-auto mt-14 w-[min(1200px,100%)]">
        <h2 className="text-4xl">Complete your ritual</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {crossSell.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="focus-ring rounded-2xl border border-[var(--line)] p-5 hover:bg-white/5"
            >
              <h3 className="text-2xl">{item.name}</h3>
              <p className="mt-2 text-sm text-[var(--cream-dim)]">{item.shortDescription}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
