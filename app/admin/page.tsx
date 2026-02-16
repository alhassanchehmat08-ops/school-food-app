import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin-dashboard";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export default async function AdminPage() {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (adminCookie?.value !== "authenticated") {
    return (
      <div className="container" style={{ maxWidth: "480px", paddingTop: "2rem" }}>
        <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
          <h1>Admin Login</h1>
          <p>Enter admin password to view orders.</p>
          <form method="post" action="/api/admin/login" className="grid">
            <input name="password" type="password" placeholder="Password" required />
            <input type="hidden" name="redirectTo" value="/admin" />
            <button className="btn-primary" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
const VALID_STATUSES = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

function toOrderStatus(status: string): OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(status) ? (status as OrderStatus) : "PENDING";
}

const normalizedOrders = orders.map((o) => ({
  ...o,
  status: toOrderStatus(o.status),
}));
 return <AdminDashboard initialOrders={normalizedOrders} />;
}
