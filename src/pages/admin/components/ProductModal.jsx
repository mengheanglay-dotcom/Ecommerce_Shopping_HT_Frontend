import { useEffect, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { getCategories } from "../../../api/categoryApi";
import { getAdminBrands } from "../../../api/adminApi";

export default function ProductModal({ product, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({
    name: product.name || "",
    category: product.category?.name || product.category || "",
    category_id: product.category_id || product.category?.id || "",
    brand_id: product.brand_id || product.brand?.id || "",
    price: product.price || "",
    image:
      product.image ||
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
    type: product.type || "Unisex",
    gender: product.gender || "unisex",
    sizes: product.sizes || ["S", "M", "L", "XL"],
  });
  useEffect(() => {
    Promise.all([getCategories(), getAdminBrands().catch(() => [])])
      .then(([categoryItems, brandItems]) => {
        setBrands(brandItems || []);
        const options = (categoryItems || []).flatMap((item) => [
          item,
          ...(item.children || []),
        ]);
        setCategories(options);
        if (!form.category_id && options[0]) {
          update("category_id", options[0].id);
          update("category", options[0].name);
        }
      })
      .catch((error) => console.error("Unable to load categories:", error));
  }, []);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <span className="admin-eyebrow">CATALOG</span>
            <h2>{product.id ? "Edit product" : "Add product"}</h2>
          </div>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        <label>
          Product name
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoFocus
          />
        </label>
        <div className="admin-form-grid">
          <label>
            Category
            <select
              value={form.category_id}
              onChange={(event) => {
                const selected = categories.find(
                  (item) => String(item.id) === event.target.value,
                );
                update("category_id", selected?.id || "");
                update("category", selected?.name || "");
              }}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <select
              value={form.brand_id}
              onChange={(event) => update("brand_id", event.target.value)}
            >
              <option value="">Select brand</option>
              {brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => update("price", Number(event.target.value))}
            />
          </label>
        </div>
        <label>
          Image URL
          <input
            value={form.image}
            onChange={(event) => update("image", event.target.value)}
          />
        </label>
        <div className="admin-modal-actions">
          <button className="admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-primary"
            disabled={!form.name || !form.price}
            onClick={() => onSave({ ...form, price: Number(form.price) })}
          >
            <FiCheck /> Save product
          </button>
        </div>
      </div>
    </div>
  );
}
