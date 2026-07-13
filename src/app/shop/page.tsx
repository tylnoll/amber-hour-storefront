import { ShopGrid } from "@/components/shop-grid";
import { getAllProducts } from "@/lib/products";

export default async function ShopPage() {
  const allProducts = await getAllProducts();

  return (
    <ShopGrid
      products={allProducts.filter((product) => product.category !== "bundles")}
      heading="All products"
      intro="Four rituals. One calm arc from evening to rest."
    />
  );
}
