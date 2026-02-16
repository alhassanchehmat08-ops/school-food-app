import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function OrderConfirmation({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container" style={{ maxWidth: "680px", paddingTop: "2rem" }}>
      <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
        <h1>Order Confirmed 🎉</h1>
        <p>
          Your order number is <strong>{order.orderNumber}</strong>.
        </p>
        <p>Please pay at the counter to start preparation.</p>
        <p>Keep your order number ready when your name is called.</p>
        <Link href="/">Back to menu</Link>
      </div>
    </div>
  );
}
