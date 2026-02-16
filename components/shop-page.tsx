"use client";

import { useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { useRouter } from "next/navigation";
type ProductCategory = "NOODLES" | "SNACKS" | "DRINKS" | "OTHER";
type ProductWithPrice = Omit<Product, "price" | "category"> & {
  price: string;
  category: ProductCategory;
};

type CartState = Record<number, { product: ProductWithPrice; quantity: number }>;

const categoryLabels: Record<ProductCategory, string> = {
  NOODLES: "Noodles",
  SNACKS: "Snacks",
  DRINKS: "Drinks",
  OTHER: "Other",
};

export function ShopPage({ products }: { products: ProductWithPrice[] }) {
  function toCategory(value: string): ProductCategory {
  if (value === "NOODLES" || value === "SNACKS" || value === "DRINKS") {
    return value;
  }
  return "OTHER";
}
  const [cart, setCart] = useState<CartState>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<"PICKUP" | "TABLE">("PICKUP");
  const router = useRouter();

  const groupedProducts = useMemo(() => {
    return products.reduce<Record<string, ProductWithPrice[]>>((acc, product) => {
      const key = toCategory(product.category);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    }, {});
  }, [products]);

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const addToCart = (product: ProductWithPrice) => {
    setCart((current) => {
      const existing = current[product.id];
      return {
        ...current,
        [product.id]: {
          product,
          quantity: (existing?.quantity ?? 0) + 1,
        },
      };
    });
  };

  const updateQty = (productId: number, nextQty: number) => {
    setCart((current) => {
      if (nextQty <= 0) {
        const clone = { ...current };
        delete clone[productId];
        return clone;
      }

      return {
        ...current,
        [productId]: {
          ...current[productId],
          quantity: nextQty,
        },
      };
    });
  };

  const removeItem = (productId: number) => {
    setCart((current) => {
      const clone = { ...current };
      delete clone[productId];
      return clone;
    });
  };

  const checkout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      customerClass: String(formData.get("customerClass") ?? "").trim(),
      orderType,
      tableNumber: String(formData.get("tableNumber") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to place order");
      }

      const data = (await response.json()) as { orderNumber: string };
      router.push(`/order/${data.orderNumber}`);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "2rem" }}>
      <header className="card" style={{ marginBottom: "1rem", display: "grid", gap: "0.4rem" }}>
        <h1>SEA Snack Stop</h1>
        <p>Fresh Southeast Asian favorites for break time. Order now, pay at counter!</p>
      </header>

      <div className="shop-layout">
        <section className="grid">
          {Object.entries(groupedProducts).map(([category, items]) => (
            <div key={category} className="card grid">
              <h2>{categoryLabels[category as ProductCategory]}</h2>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.8rem", display: "grid", gap: "0.5rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <strong>{item.name}</strong>
                    <span>AED {Number(item.price).toFixed(2)}</span>
                  </div>
                  <p style={{ color: "#334155" }}>{item.description}</p>
                  <button className="btn-secondary" onClick={() => addToCart(item)}>
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          ))}
        </section>

        <aside className="card" style={{ display: "grid", gap: "0.8rem", position: "sticky", top: "1rem" }}>
          <h2>Your Cart</h2>
          {cartItems.length === 0 ? (
            <p>No items yet.</p>
          ) : (
            <div className="grid">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.7rem" }}>
                  <strong>{product.name}</strong>
                  <p>AED {Number(product.price).toFixed(2)}</p>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <button className="btn-secondary" type="button" onClick={() => updateQty(product.id, quantity - 1)}>
                      -
                    </button>
                    <span>{quantity}</span>
                    <button className="btn-secondary" type="button" onClick={() => updateQty(product.id, quantity + 1)}>
                      +
                    </button>
                    <button type="button" onClick={() => removeItem(product.id)} style={{ marginLeft: "auto" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <strong>Total: AED {total.toFixed(2)}</strong>

          <form className="grid" onSubmit={checkout}>
            <h3>Checkout</h3>
            <input name="customerName" placeholder="Full name" required />
            <input name="customerClass" placeholder="Class / Section" required />
            <label>
              Order type
              <select name="orderType" value={orderType} onChange={(event) => setOrderType(event.target.value as "PICKUP" | "TABLE")}>
                <option value="PICKUP">Pickup</option>
                <option value="TABLE">Table</option>
              </select>
            </label>
            {orderType === "TABLE" && <input name="tableNumber" placeholder="Table number" required />}
            <textarea name="notes" placeholder="Notes (optional)" rows={3} />
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            <button className="btn-primary" disabled={submitting}>
              {submitting ? "Placing order..." : "Place order (Pay at counter)"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
