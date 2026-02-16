"use client";

import { useMemo, useState } from "react";
import type { Order, OrderItem } from "@prisma/client";

const VALID_STATUSES = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

type AdminOrder = Omit<Order, "status"> & { status: OrderStatus; items: OrderItem[] };

const statusOptions: OrderStatus[] = [...VALID_STATUSES];

const actionMap: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const labelMap: Record<OrderStatus, string> = {
  PENDING: "Preparing",
  PREPARING: "Ready",
  READY: "Completed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function AdminDashboard({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("PENDING");

  const filtered = useMemo(
    () => orders.filter((order) => order.status === activeStatus).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [activeStatus, orders],
  );

  async function updateStatus(orderId: number, status: OrderStatus) {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
  }

  return (
    <div className="container" style={{ display: "grid", gap: "1rem", paddingBottom: "2rem" }}>
      <header className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage orders from newest to oldest.</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="btn-secondary">
            Logout
          </button>
        </form>
      </header>

      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {statusOptions.map((status) => (
          <button
            key={status}
            type="button"
            className={activeStatus === status ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveStatus(status)}
          >
            {labelMap[status]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">No orders in this status.</div>
      ) : (
        filtered.map((order) => {
          const total = order.items.reduce((sum, item) => sum + Number(item.priceSnapshot) * item.quantity, 0);
          return (
            <article key={order.id} className="card" style={{ display: "grid", gap: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                <div>
                  <h2>{order.orderNumber}</h2>
                  <p>
                    {order.customerName} ({order.customerClass})
                  </p>
                  <p>
                    {order.orderType === "TABLE" ? `Table ${order.tableNumber ?? "-"}` : "Pickup"} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <strong>AED {total.toFixed(2)}</strong>
              </div>

              {order.status === "READY" && (
                <div style={{ border: "2px dashed #16a34a", borderRadius: "10px", padding: "0.8rem", fontSize: "1.4rem", fontWeight: 700 }}>
                  {order.orderNumber}, {order.customerName}
                </div>
              )}

              <ul style={{ margin: 0, paddingLeft: "1rem", display: "grid", gap: "0.3rem" }}>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.nameSnapshot} x {item.quantity} (AED {Number(item.priceSnapshot).toFixed(2)} each)
                  </li>
                ))}
              </ul>

              {order.notes && <p>Notes: {order.notes}</p>}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {actionMap[order.status].map((nextStatus) => (
                  <button key={nextStatus} type="button" className="btn-secondary" onClick={() => updateStatus(order.id, nextStatus)}>
                    Mark {labelMap[nextStatus]}
                  </button>
                ))}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
