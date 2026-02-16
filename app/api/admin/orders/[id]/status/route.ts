import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

const VALID_STATUSES = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const authCookie = cookies().get(ADMIN_COOKIE_NAME);

  if (authCookie?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

 const body = (await request.json()) as { status?: string };
const status = body.status as OrderStatus | undefined;

if (!status || !VALID_STATUSES.includes(status)) {
  return NextResponse.json({ error: "Invalid status" }, { status: 400 });
}

  const orderId = Number(params.id);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return NextResponse.json({ ok: true });
}
