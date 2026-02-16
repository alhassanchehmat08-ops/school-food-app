import { ShopPage } from "@/components/shop-page";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <ShopPage products={products.map((p) => ({ ...p, price: p.price.toString() }))} />;
}
