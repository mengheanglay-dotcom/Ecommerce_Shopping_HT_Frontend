import { useEffect, useState } from "react";
import SectionHeading from "../components/SectionHeading";

export default function EntitySection({
  title,
  eyebrow,
  load,
  create,
  update,
  remove,
  nameField = "name",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const refresh = async () => {
    try {
      setLoading(true);
      setItems(await load());
    } catch (e) {
      setError(
        e.response?.data?.message || `Unable to load ${title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const save = async () => {
    if (!name.trim()) return;
    try {
      if (editing?.id) await update(editing.id, { [nameField]: name });
      else await create({ [nameField]: name });
      setEditing(null);
      setName("");
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    }
  };
  const edit = (x) => {
    setEditing(x);
    setName(x[nameField] || x.name || "");
  };
  const del = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await remove(id);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };
  return (
    <div className="admin-content">
      <SectionHeading eyebrow={eyebrow} title={title} />
      {error && (
        <div className="admin-empty" style={{ color: "#b91c1c" }}>
          {error}
        </div>
      )}
      <div className="admin-panel" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${editing ? "Edit" : "New"} ${title.slice(0, -1).toLowerCase()}`}
            className="admin-select"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="admin-primary" onClick={save}>
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              className="admin-secondary"
              onClick={() => {
                setEditing(null);
                setName("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="admin-panel admin-product-table">
        {loading ? (
          <div className="admin-empty">Loading...</div>
        ) : (
          items.map((item) => (
            <div className="admin-table-row" key={item.id}>
              <strong>{item.id}</strong>
              <span>{item[nameField] || item.name}</span>
              <div className="admin-actions" style={{ marginLeft: "auto" }}>
                <button onClick={() => edit(item)}>Edit</button>
                <button onClick={() => del(item.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
        {!loading && !items.length && (
          <div className="admin-empty">No {title.toLowerCase()} found.</div>
        )}
      </div>
    </div>
  );
}
