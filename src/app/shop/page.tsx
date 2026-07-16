import { ShopGrid } from "@/components/shop-grid";
import { getAllProducts } from "@/lib/products";

export default async function ShopPage() {
  const allProducts = await getAllProducts();

  return (
    <ShopGrid
      products={allProducts.filter((product) => product.category !== "bundles")}
      heading="All products"
      intro="Small-batch homemade THC/CBD products for everyday use."
    />
  );
}
