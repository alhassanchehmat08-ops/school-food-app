import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextOrderNumber } from "@/lib/orders";

type OrderPayload = {
  customerName?: string;
  customerClass?: string;
  orderType?: "PICKUP" | "TABLE";
  tableNumber?: string;
  notes?: string;
  items?: Array<{ productId: number; quantity: number }>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderPayload;

  if (!body.customerName || !body.customerClass || !body.orderType || !body.items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (body.orderType === "TABLE" && !body.tableNumber) {
    return NextResponse.json({ error: "Table number is required for table orders" }, { status: 400 });
  }

  const productIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Some products are not available" }, { status: 400 });
  }

  const productMap = new Map<number, (typeof products)[number]>();
for (const p of products) {
  productMap.set(p.id, p);
}
  const orderNumber = await getNextOrderNumber();

  const createdOrder = await prisma.order.create({
    data: {
      orderNumber,
      customerName: body.customerName,
      customerClass: body.customerClass,
      orderType: body.orderType,
      status: "PENDING",
      tableNumber: body.orderType === "TABLE" ? body.tableNumber : null,
      notes: body.notes || null,
      items: {
        create: body.items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new Error("Product not found");
          }

          return {
            productId: product.id,
            nameSnapshot: product.name,
            priceSnapshot: product.price,
            quantity: item.quantity,
          };
        }),
      },
    },
  });

  return NextResponse.json({ orderNumber: createdOrder.orderNumber });
}
