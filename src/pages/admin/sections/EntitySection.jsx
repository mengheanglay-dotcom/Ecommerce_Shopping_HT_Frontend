import { useEffect, useState } from "react";
import { FiSettings, FiTrash2 } from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";

export default function EntitySection({
  title,
  eyebrow,
  load,
  create,
  update,
  remove,
  nameField = "name",
  secondaryField,
  secondaryLabel,
  parentOptions = [],
  imageField,
  imageLabel = "Image URL",
  colorField,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [secondary, setSecondary] = useState("");
  const [parentId, setParentId] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const availableParents =
    parentOptions.length > 0
      ? parentOptions
      : title === "Categories"
        ? items.filter((item) => !item.parent_id)
        : [];
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
      const payload = {
        [nameField]: name,
        ...(secondaryField ? { [secondaryField]: secondary } : {}),
        ...(imageField ? { [imageField]: image || null } : {}),
        ...(parentOptions.length
          ? { parent_id: parentId ? Number(parentId) : null }
          : {}),
      };
      if (editing?.id) await update(editing.id, payload);
      else await create(payload);
      setEditing(null);
      setName("");
      setSecondary("");
      setParentId("");
      setImage("");
      await refresh();
    } catch (e) {
      setError(
        e.response?.status === 403
          ? e.response?.data?.message ||
            "The API rejected this admin request. Sign out, sign in again with the admin account, then retry."
          : e.response?.data?.message || "Save failed",
      );
    }
  };
  const edit = (x) => {
    setEditing(x);
    setName(x[nameField] || x.name || "");
    setSecondary(x[secondaryField] || "");
    setParentId(x.parent_id || "");
    setImage(x[imageField] || "");
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
          {secondaryField && (
            <input
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              placeholder={secondaryLabel || secondaryField}
              className="admin-select"
              style={{ flex: 1, minWidth: 160 }}
            />
          )}
          {availableParents.length > 0 && (
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="admin-select"
              style={{ flex: 1, minWidth: 180 }}
            >
              <option value="">Top-level category</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  Under {parent.name}
                </option>
              ))}
            </select>
          )}
          {imageField && (
            <div className="admin-entity-image-editor">
              <input
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder={imageLabel}
                className="admin-select"
              />
              {image && (
                <img
                  src={image}
                  alt={`${title} preview`}
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              )}
              {colorField && (
                <div className="admin-entity-color-editor">
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(secondary) ? secondary : "#000000"}
                    onChange={(event) => setSecondary(event.target.value.toUpperCase())}
                    aria-label="Choose color"
                  />
                  <span>{secondary || "#000000"}</span>
                </div>
              )}
            </div>
          )}
          <button className="admin-primary" onClick={save}>
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              className="admin-secondary"
              onClick={() => {
                setEditing(null);
                setName("");
                setSecondary("");
                setParentId("");
                setImage("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div
        className={`admin-panel admin-product-table ${
          colorField ? "admin-color-table" : ""
        }`}
      >
        <div className="admin-table-head admin-entity-table-head">
          <span>ID</span>
          <span>{title.slice(0, -1)}</span>
          {imageField && <span>Preview</span>}
          {secondaryField && <span>{secondaryLabel || secondaryField}</span>}
          {colorField && <span>Preview</span>}
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="admin-empty">Loading...</div>
        ) : (
          items.map((item) => (
            <div className="admin-table-row admin-entity-table-row" key={item.id}>
              <strong>{item.id}</strong>
              <span>
                {item.parentName && <small>{item.parentName} / </small>}
                {item[nameField] || item.name}
              </span>
              {imageField && (
                <span className="admin-entity-image-cell">
                  {item[imageField] ? (
                    <img src={item[imageField]} alt="" loading="lazy" />
                  ) : (
                    "—"
                  )}
                </span>
              )}
              {secondaryField && <span>{item[secondaryField] || "—"}</span>}
              {colorField && (
                <span className="admin-entity-color-cell">
                  <i
                    style={{
                      backgroundColor: item[colorField] || "#d4d4d4",
                    }}
                  />
                  {item[colorField] || "—"}
                </span>
              )}
              <div className="admin-actions" style={{ marginLeft: "auto" }}>
                <button onClick={() => edit(item)} title={`Edit ${title.slice(0, -1).toLowerCase()}`}>
                  <FiSettings />
                </button>
                <button onClick={() => del(item.id)} title={`Delete ${title.slice(0, -1).toLowerCase()}`}>
                  <FiTrash2 />
                </button>
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
