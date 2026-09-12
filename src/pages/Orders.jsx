import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";
import { isAuthenticated } from "../api/authApi";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        setOrders(await getMyOrders());
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading orders...
      </div>
    );
  return (
    <main className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
        ACCOUNT
      </p>
      <h1 className="text-4xl font-semibold mt-2">My orders</h1>
      {error && <p className="text-red-600 mt-5">{error}</p>}
      {!orders.length && !error ? (
        <div className="py-20 text-center text-neutral-500">
          You have no orders yet.
          <br />
          <Link to="/" className="underline inline-block mt-3">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o, i) => (
            <div
              key={o.id || i}
              className="border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <strong>#{o.order_number || o.code || o.id}</strong>
                <p className="text-sm text-neutral-500 mt-1">
                  {o.created_at
                    ? new Date(o.created_at).toLocaleString()
                    : "Order"}
                </p>
              </div>
              <div className="text-sm">
                <span className="px-3 py-1 rounded-full bg-neutral-100">
                  {o.status || "Pending"}
                </span>
              </div>
              <strong>
                ${Number(o.total || o.grand_total || 0).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
