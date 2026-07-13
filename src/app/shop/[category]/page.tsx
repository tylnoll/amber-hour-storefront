import { notFound } from "next/navigation";
import { ShopGrid } from "@/components/shop-grid";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/products";
import { ProductCategory } from "@/lib/types";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const currentCategory = getCategoryBySlug(category);

  if (!currentCategory) notFound();

  const products = await getProductsByCategory(currentCategory.slug as ProductCategory);

  return (
    <ShopGrid
      products={products}
      heading={currentCategory.label}
      intro={currentCategory.intro}
    />
  );
}
