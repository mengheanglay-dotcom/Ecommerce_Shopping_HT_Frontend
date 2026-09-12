import { useEffect, useState } from "react";
import { FiArchive } from "react-icons/fi";
import OrderTable from "../components/OrderTable";
import SectionHeading from "../components/SectionHeading";
import { getAdminOrders, updateAdminOrderStatus } from "../../../api/adminApi";

const normalize = (o) => ({
  id: o.order_number || o.code || `#${o.id}`,
  rawId: o.id,
  customer:
    o.customer?.name ||
    o.user?.name ||
    o.customer_name ||
    o.user?.email ||
    "Customer",
  date: o.created_at
    ? new Date(o.created_at).toLocaleDateString()
    : o.date || "—",
  items: o.items_count || o.items?.length || 0,
  total: Number(o.total || o.grand_total || 0),
  status: String(o.status || "Processing")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (x) => x.toUpperCase()),
});
export default function OrdersSection({ onChanged }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setOrders((await getAdminOrders()).map(normalize));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load admin orders.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const update = async (id, status) => {
    const order = orders.find((x) => x.id === id);
    try {
      await updateAdminOrderStatus(
        order?.rawId || id,
        status.toLowerCase().replace(/ /g, "_"),
      );
      await load();
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update order");
    }
  };
  const processing = orders.filter(
    (x) => x.status.toLowerCase() === "processing",
  ).length;
  const shipped = orders.filter(
    (x) => x.status.toLowerCase() === "shipped",
  ).length;
  const completed = orders.filter((x) =>
    ["delivered", "completed"].includes(x.status.toLowerCase()),
  ).length;
  return (
    <div className="admin-content">
      <SectionHeading
        eyebrow="FULFILLMENT"
        title="Order management"
        action={
          <button className="admin-filter-button">
            <FiArchive /> Export orders
          </button>
        }
      />
      {error && (
        <div className="admin-empty" style={{ color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div className="admin-order-summary">
        <div>
          <span>Needs attention</span>
          <strong>{processing}</strong>
          <small>Processing</small>
        </div>
        <div>
          <span>In transit</span>
          <strong>{shipped}</strong>
          <small>Shipped</small>
        </div>
        <div>
          <span>Completed</span>
          <strong>{completed}</strong>
          <small>Delivered / completed</small>
        </div>
      </div>
      <div className="admin-panel admin-orders-panel">
        {loading ? (
          <div className="admin-empty">Loading orders...</div>
        ) : (
          <OrderTable orders={orders} onUpdate={update} />
        )}
      </div>
    </div>
  );
}
