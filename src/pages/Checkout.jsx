import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderApi";
import { getShopCart, clearShopCart } from "../api/shopService";
import { isAuthenticated, getStoredUser } from "../api/authApi";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const user = getStoredUser();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "Phnom Penh",
    payment_method: "cash_on_delivery",
  });
  useEffect(() => {
    (async () => {
      try {
        setCart(await getShopCart());
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load cart.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, x) =>
          s +
          Number(x.price ?? x.base_price ?? x.product?.base_price ?? 0) *
            (x.qty || x.quantity || 1),
        0,
      ),
    [cart],
  );
  const total = subtotal + 11;
  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createOrder({
        shipping_name: form.name,
        email: form.email,
        shipping_phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        payment_method: form.payment_method,
        items: cart.map((x) => ({
          product_variant_id:
            x.variant_id ||
            x.product_variant_id ||
            x.product_variant?.id ||
            x.variant?.id,
          quantity: x.qty || x.quantity || 1,
          size: x.size || null,
        })),
        subtotal,
        shipping: 6,
        tax: 5,
        total,
      });
      await clearShopCart();
      window.dispatchEvent(new Event("storage"));
      navigate("/orders");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not place order. Please check the API response.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (loading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading checkout...
      </div>
    );
  if (!cart.length)
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-semibold">Your Cart is Empty 🛒</h1>
          <Link to="/" className="mt-4 inline-block underline">
            Go Shopping
          </Link>
        </div>
      </div>
    );
  return (
    <main className="max-w-6xl mx-auto px-5 py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
          CHECKOUT
        </p>
        <h1 className="text-4xl font-semibold mt-2">Complete your order</h1>
      </div>
      {!isAuthenticated() && (
        <div className="mb-6 rounded-xl bg-amber-50 text-amber-800 p-4 text-sm">
          Please log in before placing an order. Your cart will remain
          available.
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 text-red-600 p-4 text-sm">
          {error}
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-2xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Delivery information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["name", "Full name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium">
                  {label}
                  <input
                    required
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
                  />
                </label>
              ))}
            </div>
            <label className="block text-sm font-medium mt-4">
              Address
              <textarea
                required
                rows="4"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
              />
            </label>
          </div>
          <div className="rounded-2xl border p-6">
            <h2 className="font-semibold text-lg mb-5">Payment</h2>
            <select
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2.5"
            >
              <option value="cash_on_delivery">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="online">Online payment</option>
            </select>
          </div>
          <button
            disabled={submitting}
            className="w-full bg-black text-white rounded-xl py-4 font-semibold disabled:opacity-50"
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>
        <aside className="rounded-2xl bg-neutral-50 p-6 h-fit">
          <h2 className="font-semibold text-lg">Order summary</h2>
          <div className="mt-5 space-y-3">
            {cart.map((x) => (
              <div
                key={x.cart_id || x.id}
                className="flex justify-between gap-4 text-sm"
              >
                <span>
                  {x.name || x.product?.name} × {x.qty || x.quantity || 1}
                </span>
                <b>
                  $
                  {(
                    Number(
                      x.price ?? x.base_price ?? x.product?.base_price ?? 0,
                    ) * (x.qty || x.quantity || 1)
                  ).toFixed(2)}
                </b>
              </div>
            ))}
          </div>
          <div className="border-t mt-5 pt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$6.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-3 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
