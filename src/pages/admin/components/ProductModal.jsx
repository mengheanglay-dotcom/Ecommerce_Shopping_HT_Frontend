import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { getCategories } from "../../../api/categoryApi";
import {
  getCatalogBrands,
  getCatalogSizes,
  getCatalogColors,
} from "../../../api/adminApi";

export default function ProductModal({ product, onClose, onSave }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const existingVariants = product.variants || [];
  const existingVariant = existingVariants[0] || {};
  const existingStock = existingVariants.reduce(
    (total, item) => total + Number(item.stock || 0),
    0,
  );
  const [form, setForm] = useState({
    code: product.code || "",
    name: product.name || "",
    description: product.description || "",
    category: product.category?.name || product.category || "",
    category_id: product.category_id || product.category?.id || "",
    brand_id: product.brand_id || product.brand?.id || "",
    price: product.price || existingVariant.price || "",
    image:
      product.image ||
      "",
    status: product.status || (existingStock > 0 ? "active" : "inactive"),
    gender: product.gender?.toLowerCase() || "",
  });
  const [variants, setVariants] = useState(
    existingVariants.length
      ? existingVariants.map((item) => ({
          id: item.id || "",
          size_id: item.size_id || item.size?.id || "",
          color_id: item.color_id || item.color?.id || "",
          price: item.price || product.price || "",
          stock: item.stock ?? "",
          images: Array.isArray(item.images)
            ? item.images
            : item.image
              ? [item.image]
              : [""],
        }))
      : [
          {
            id: "",
            size_id: "",
            color_id: "",
            price: product.price || "",
            stock: "",
            images: [""],
          },
        ],
  );
  const categoryOptions = useMemo(
    () =>
      categories.filter(
        (item) => !form.gender || item.gender === form.gender,
      ),
    [categories, form.gender],
  );
  useEffect(() => {
    Promise.all([
      getCategories(),
      getCatalogBrands().catch(() => []),
      getCatalogSizes().catch(() => []),
      getCatalogColors().catch(() => []),
    ])
      .then(([categoryItems, brandItems, sizeItems, colorItems]) => {
        setBrands(brandItems || []);
        setSizes(sizeItems || []);
        setColors(colorItems || []);
        const roots = (categoryItems || []).filter((item) => !item.parent_id);
        const options = roots.flatMap((root) =>
          (root.children || []).map((item) => ({
            ...item,
            gender: root.name.toLowerCase(),
          })),
        );
        setCategories(options);
        const selected = options.find(
          (item) => String(item.id) === String(form.category_id),
        );
        setForm((current) => ({
          ...current,
          gender: selected?.gender || current.gender || roots[0]?.name.toLowerCase() || "",
          category_id: selected?.id || current.category_id || options[0]?.id || "",
          category: selected?.name || current.category || options[0]?.name || "",
        }));
      })
      .catch((error) => console.error("Unable to load categories:", error));
  }, []);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const imagesForColor = (colorId, currentIndex) => {
    if (!colorId) return [""];
    const matchingVariant = variants.find(
      (item, index) =>
        index !== currentIndex &&
        String(item.color_id) === String(colorId) &&
        item.images?.some(Boolean),
    );
    return matchingVariant ? [...matchingVariant.images] : [""];
  };
  const updateVariant = (index, key, value) =>
    setVariants((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  const updateVariantImage = (variantIndex, imageIndex, value) =>
    setVariants((current) =>
      current.map((item, index) =>
        index === variantIndex
          ? {
              ...item,
              images: item.images.map((image, index) =>
                index === imageIndex ? value : image,
              ),
            }
          : item,
      ),
    );
  const addVariantImage = (index) =>
    setVariants((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, images: [...item.images, ""] }
          : item,
      ),
    );
  const removeVariantImage = (variantIndex, imageIndex) =>
    setVariants((current) =>
      current.map((item, index) =>
        index === variantIndex && item.images.length > 1
          ? {
              ...item,
              images: item.images.filter(
                (_, currentIndex) => currentIndex !== imageIndex,
              ),
            }
          : item,
      ),
    );
  const removeVariant = (index) =>
    setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const addVariant = () =>
    setVariants((current) => [
      ...current,
      {
        id: "",
        size_id: "",
        color_id: current[0]?.color_id || "",
        price: form.price || "",
        stock: "",
        images: current[0]?.images?.length ? [...current[0].images] : [""],
      },
    ]);
  const codePart = (value, fallback) => {
    const normalized = String(value || "")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toUpperCase();
    if (!normalized) return fallback;
    const words = normalized.split(/\s+/);
    return words.length > 1
      ? words.map((word) => word[0]).join("").slice(0, 3)
      : normalized.slice(0, 3);
  };
  const selectedBrand = brands.find(
    (item) => String(item.id) === String(form.brand_id),
  );
  const selectedCategory = categoryOptions.find(
    (item) => String(item.id) === String(form.category_id),
  );
  const generatedCode = `${codePart(selectedBrand?.code || selectedBrand?.name, "BRD")}-${codePart(selectedCategory?.code || selectedCategory?.name || form.name, "PRD")}-${String(product.id || 1).padStart(3, "0")}`;
  const generatedSku = (item) => {
    const color = colors.find((entry) => String(entry.id) === String(item.color_id));
    const size = sizes.find((entry) => String(entry.id) === String(item.size_id));
    return `${generatedCode}-${codePart(color?.code || color?.name, "CLR")}-${codePart(size?.code || size?.name, "SZ")}`;
  };
  const selectGender = (gender) => {
    const firstCategory = categories.find((item) => item.gender === gender);
    setForm((current) => ({
      ...current,
      gender,
      category_id: firstCategory?.id || "",
      category: firstCategory?.name || "",
    }));
  };
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
          Product code
          <input
            value={form.code || generatedCode}
            readOnly
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            rows="3"
          />
        </label>
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
            Status
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <small className="admin-field-help">
              Set inactive when the product has a problem or should not be sold.
            </small>
          </label>
          <label>
            Department
            <select
              value={form.gender}
              onChange={(event) => selectGender(event.target.value)}
            >
              <option value="">Select department</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={form.category_id}
              onChange={(event) => {
                const selected = categoryOptions.find(
                  (item) => String(item.id) === event.target.value,
                );
                update("category_id", selected?.id || "");
                update("category", selected?.name || "");
              }}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
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
        <h3 className="admin-modal-section-title">Product variants</h3>
        <p className="admin-modal-help">
          A variant is one purchasable size/color/SKU combination.
        </p>
        {variants.map((variant, index) => (
          <div className="admin-variant-card" key={variant.id || index}>
            <div className="admin-variant-card-header">
              <strong>Variant {index + 1}</strong>
              {variants.length > 1 && (
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={() => removeVariant(index)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="admin-form-grid">
          <label>
            Size
            <select
              required
              value={variant.size_id}
              onChange={(event) =>
                updateVariant(index, "size_id", event.target.value)
              }
            >
              <option value="">Select size</option>
              {sizes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Color
            <select
              required
              value={variant.color_id}
              onChange={(event) => {
                const colorId = event.target.value;
                setVariants((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index
                      ? {
                          ...item,
                          color_id: colorId,
                          images: imagesForColor(colorId, index),
                        }
                      : item,
                  ),
                );
              }}
            >
              <option value="">Select color</option>
              {colors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Variant price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={variant.price}
              onChange={(event) => updateVariant(index, "price", event.target.value)}
            />
          </label>
          <label>
            Stock
            <input
              required
              type="number"
              min="0"
              step="1"
              value={variant.stock}
              onChange={(event) => updateVariant(index, "stock", event.target.value)}
            />
          </label>
          <label>
            Gallery images
            <small className="admin-field-help">
              Images are shared automatically by variants with the same color.
              Add them once for the first size.
            </small>
            {variant.images.map((image, imageIndex) => (
              <div className="admin-variant-image-row" key={imageIndex}>
                <input
                  value={image}
                  placeholder="products/tshirt/beige/front.jpg"
                  onChange={(event) =>
                    updateVariantImage(index, imageIndex, event.target.value)
                  }
                />
                {variant.images.length > 1 && (
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={() => removeVariantImage(index, imageIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="admin-secondary"
              onClick={() => addVariantImage(index)}
            >
              + Add image
            </button>
            <div className="admin-variant-image-preview">
              {variant.images.filter(Boolean).length > 0 ? (
                variant.images.filter(Boolean).map((image, imageIndex) => (
                  <div className="admin-variant-image-preview-item" key={image}>
                    <img
                      src={image}
                      alt={`Variant ${index + 1} preview ${imageIndex + 1}`}
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  </div>
                ))
              ) : (
                <span>No variant images added</span>
              )}
            </div>
          </label>
            </div>
            <label>
              SKU (auto-generated)
              <input value={generatedSku(variant)} readOnly />
            </label>
          </div>
        ))}
        <button type="button" className="admin-secondary" onClick={addVariant}>
          + Add another variant
        </button>
        <label>
          Image URL
          <input
            value={form.image}
            onChange={(event) => update("image", event.target.value)}
          />
        </label>
        <div className="admin-product-preview">
          {form.image ? (
            <img
              src={form.image}
              alt="Product preview"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          ) : (
            <span>Image preview will appear here</span>
          )}
        </div>
        <div className="admin-modal-actions">
          <button className="admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-primary"
            disabled={
              !form.name ||
              !form.category_id ||
              !form.price ||
              !variants.length ||
              variants.some(
                (item) =>
                  !item.size_id ||
                  !item.color_id ||
                  item.price === "" ||
                  item.stock === "",
              )
            }
            onClick={() =>
              onSave({
                ...form,
                price: Number(form.price),
                code: form.code || generatedCode,
                variants: variants.map((item) => ({
                  ...item,
                  sku: generatedSku(item),
                  size_id: Number(item.size_id),
                  color_id: Number(item.color_id),
                  price: Number(item.price),
                  stock: Number(item.stock),
                  images: item.images.filter(Boolean),
                })),
              })
            }
          >
            <FiCheck /> Save product
          </button>
        </div>
      </div>
    </div>
  );
}
