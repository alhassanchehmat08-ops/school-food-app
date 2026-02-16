import { prisma } from "@/lib/prisma";
import { ORDER_PREFIX } from "@/lib/constants";

export async function getNextOrderNumber() {
  const latestOrder = await prisma.order.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  const nextId = (latestOrder?.id ?? 0) + 1;
  return `${ORDER_PREFIX}${String(nextId).padStart(6, "0")}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
}
