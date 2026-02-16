import { ShopPage } from "@/components/shop-page";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const VALID_CATEGORIES = ["NOODLES", "SNACKS", "DRINKS", "OTHER"] as const;
type ProductCategory = (typeof VALID_CATEGORIES)[number];

function toCategory(value: string): ProductCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value) ? (value as ProductCategory) : "OTHER";
}

return (
  <ShopPage
    products={products.map((p) => ({
      ...p,
      price: p.price.toString(),
      category: toCategory(p.category),
    }))}
  />
);
}