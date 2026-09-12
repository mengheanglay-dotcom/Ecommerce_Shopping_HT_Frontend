import { FiPlus } from "react-icons/fi";
import OrderTable from "../components/OrderTable";
import SectionHeading from "../components/SectionHeading";
export default function OverviewSection({
  products,
  stats,
  dashboard,
  onNavigate,
}) {
  const recent = (dashboard.recent_orders || []).map((o) => ({
    id: o.order_number || o.id,
    customer: o.customer?.name || o.user?.name || o.customer_name || "Customer",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
    total: Number(o.total || 0),
    status: String(o.status || "Processing").replace(/_/g, " "),
  }));
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
          <SectionHeading eyebrow="Revenue" title="Sales overview" />
          <div className="admin-empty">
            Connect <code>/admin/dashboard</code> with daily revenue data to
            render the chart.
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
          <OrderTable orders={recent} onUpdate={() => {}} />
        ) : (
          <div className="admin-empty">
            Recent orders will appear here from the dashboard API.
          </div>
        )}
      </div>
    </div>
  );
}
