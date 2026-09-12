import { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";
import { getCustomers, deleteCustomer } from "../../../api/adminApi";

export default function CustomersSection() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setCustomers(await getCustomers());
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete customer");
    }
  };
  return (
    <div className="admin-content">
      <SectionHeading
        eyebrow="RELATIONSHIPS"
        title="Customers"
        action={
          <button className="admin-filter-button">
            <FiUsers /> {customers.length} customers
          </button>
        }
      />
      {error && (
        <div className="admin-empty" style={{ color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div className="admin-panel admin-product-table">
        {loading ? (
          <div className="admin-empty">Loading customers...</div>
        ) : (
          customers.map((c) => (
            <div className="admin-table-row" key={c.id}>
              <div className="admin-product-cell">
                <div className="customer-mini-avatar">
                  {String(c.name || c.email || "U")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <strong>{c.name || "Unnamed"}</strong>
                  <span>{c.email || "No email"}</span>
                </div>
              </div>
              <span>{c.phone || "—"}</span>
              <span>{c.orders_count ?? c.orders?.length ?? 0} orders</span>
              <strong>${Number(c.total_spent || 0).toFixed(2)}</strong>
              <div className="admin-actions">
                <button onClick={() => remove(c.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
        {!loading && !customers.length && (
          <div className="admin-empty">No customers found.</div>
        )}
      </div>
    </div>
  );
}
