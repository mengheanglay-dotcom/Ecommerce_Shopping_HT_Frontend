import { FiPlus } from "react-icons/fi";
import OrderTable from "../components/OrderTable";
import SectionHeading from "../components/SectionHeading";
export default function OverviewSection({
  products,
  stats,
  dashboard,
  orders = [],
  onOrderStatusUpdate,
  onNavigate,
}) {
  const sourceOrders = orders.length ? orders : dashboard.recent_orders || [];
  const recent = [...sourceOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.placed_at || 0) -
        new Date(a.created_at || a.placed_at || 0),
    )
    .slice(0, 5)
    .map((o) => ({
    id: o.order_number || o.id,
    customer: o.customer?.name || o.user?.name || o.customer_name || "Customer",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
    total: Number(o.total || 0),
    status: String(o.status || "Processing")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    }));
  const dashboardRevenue =
    dashboard.daily_revenue ||
    dashboard.revenue_by_day ||
    dashboard.sales_overview ||
    dashboard.chart;
  const isRevenueOrder = (order) => {
    const status = String(order.status || "").toLowerCase();
    const paymentStatus = String(order.payment_status || "").toLowerCase();
    return (
      ["delivered", "completed"].includes(status) ||
      ["paid", "completed"].includes(paymentStatus)
    );
  };
  const getOrderDate = (order) => order.created_at || order.placed_at;
  const derivedRevenuePoints = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      value: orders
        .filter((order) => {
          const orderDate = getOrderDate(order);
          return (
            isRevenueOrder(order) &&
            orderDate &&
            orderDate.slice(0, 10) === key
          );
        })
        .reduce((total, order) => total + Number(order.total || 0), 0),
    };
  });
  const apiRevenuePoints = Array.isArray(dashboardRevenue)
    ? dashboardRevenue.map((point) => ({
        label: point.label || point.date || "—",
        value: Number(point.value ?? point.total ?? point.revenue ?? 0),
      }))
    : [];
  const revenuePoints =
    apiRevenuePoints.some((point) => point.value > 0)
      ? apiRevenuePoints
      : derivedRevenuePoints;
  const maxRevenue = Math.max(...revenuePoints.map((point) => point.value), 1);
  const totalPeriodRevenue = revenuePoints.reduce(
    (total, point) => total + point.value,
    0,
  );
  return (
    <div className="admin-content">
      <div className="admin-welcome">
        <div>
          <span className="admin-eyebrow">STORE PERFORMANCE</span>
          <h2>Your store at a glance.</h2>
          <p>Live numbers from the Laravel admin API.</p>
        </div>
        <button
          className="admin-primary"
          onClick={() => onNavigate("products")}
        >
          <FiPlus /> Add product
        </button>
      </div>
      <div className="admin-stat-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="admin-stat" key={s.label}>
              <div className={`admin-stat-icon ${s.tone}`}>
                <Icon />
              </div>
              <div>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
                <small className="positive">{s.change}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="admin-dashboard-grid">
        <div className="admin-panel admin-chart-panel">
          <SectionHeading
            eyebrow="Revenue · Last 7 days"
            title="Sales overview"
          />
          <div className="admin-revenue-total">
            <strong>${totalPeriodRevenue.toFixed(2)}</strong>
            <span>total sales in selected period</span>
          </div>
          <div className="admin-revenue-bars" aria-label="Revenue by day">
            {revenuePoints.map((point) => (
              <div className="admin-revenue-bar-item" key={point.label}>
                <span>${point.value.toFixed(0)}</span>
                <div className="admin-revenue-bar-track">
                  <i
                    style={{
                      height: `${Math.max(4, (point.value / maxRevenue) * 100)}%`,
                    }}
                  />
                </div>
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-panel admin-best-panel">
          <SectionHeading
            eyebrow="Top products"
            title="Catalog"
            action={
              <button
                className="admin-text-button"
                onClick={() => onNavigate("products")}
              >
                View all
              </button>
            }
          />
          {products.slice(0, 5).map((p, i) => (
            <div className="best-product" key={p.id}>
              <span className="best-rank">0{i + 1}</span>
              <img src={p.image} alt="" />
              <div>
                <strong>{p.name}</strong>
                <span>{p.category}</span>
              </div>
              <b>${Number(p.price || 0).toFixed(2)}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-panel admin-orders-panel">
        <SectionHeading
          eyebrow="Recent activity"
          title="Latest orders"
          action={
            <button
              className="admin-text-button"
              onClick={() => onNavigate("orders")}
            >
              See all orders
            </button>
          }
        />
        {recent.length ? (
          <OrderTable
            orders={recent}
            onUpdate={onOrderStatusUpdate}
          />
        ) : (
          <div className="admin-empty">
            No orders have been returned by the admin orders API yet.
          </div>
        )}
      </div>
    </div>
  );
}
