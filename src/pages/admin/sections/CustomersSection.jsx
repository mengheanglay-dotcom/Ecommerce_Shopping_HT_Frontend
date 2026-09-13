import { useEffect, useState } from "react";
import { FiSettings, FiTrash2, FiUsers } from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "../../../api/adminApi";

export default function CustomersSection() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const load = async () => {
    try {
      setCustomers(await getAdminUsers());
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
      await deleteAdminUser(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete customer");
    }
  };
  const edit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
  };
  const save = async (event) => {
    event.preventDefault();
    try {
      await updateAdminUser(editing.id, form);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update customer");
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
      {editing && (
        <form className="admin-panel admin-customer-edit" onSubmit={save}>
          <div className="admin-form-grid">
            {["name", "email", "phone"].map((field) => (
              <label key={field}>
                {field[0].toUpperCase() + field.slice(1)}
                <input
                  value={form[field]}
                  onChange={(event) =>
                    setForm({ ...form, [field]: event.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button type="submit" className="admin-primary">
              Save customer
            </button>
          </div>
        </form>
      )}
      <div className="admin-panel admin-product-table admin-customer-table">
        <div className="admin-table-head admin-customer-table-head">
          <span>Customer</span>
          <span>Phone</span>
          <span>Orders</span>
          <span>Total spent</span>
          <span>Actions</span>
        </div>
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
                <button onClick={() => edit(c)} title="Edit customer">
                  <FiSettings />
                </button>
                <button onClick={() => remove(c.id)} title="Delete customer">
                  <FiTrash2 />
                </button>
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
