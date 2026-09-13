import { FiSearch, FiSettings, FiTrash2, FiPlus } from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";

export default function ProductsSection({
  products,
  categories,
  search,
  setSearch,
  category,
  setCategory,
  onAdd,
  onEdit,
  onRemove,
  loading,
}) {
  return (
    <div className="admin-content">
      <SectionHeading
        eyebrow="CATALOG MANAGEMENT"
        title="All products"
        action={
          <button className="admin-primary" onClick={onAdd}>
            <FiPlus /> Add product
          </button>
        }
      />
      <div className="admin-toolbar">
        <label>
          <FiSearch />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="admin-select"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <span className="admin-result-count">{products.length} products</span>
      </div>
      <div className="admin-panel admin-product-table">
        {loading && (
          <div className="admin-empty">Loading products from API...</div>
        )}
        {!loading && (
          <>
            <div className="admin-table-head">
              <span>Product</span>
              <span>Catalog</span>
              <span>Inventory</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {products.map((product) => (
              <div className="admin-table-row admin-product-row" key={product.id}>
                {(() => {
                  const totalStock = (product.variants || []).reduce(
                    (total, variant) => total + Number(variant.stock || 0),
                    0,
                  );
                  const isActive = product.status === "active" && totalStock > 0;
                  return (
                    <>
                <div className="admin-product-cell">
                  <img src={product.image} alt="" loading="lazy" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.code || `Product #${product.id}`}</span>
                    <small>{product.brand?.name || "No brand"}</small>
                  </div>
                </div>
                <div className="admin-product-catalog">
                  <strong>{product.category || "Uncategorized"}</strong>
                  <span>
                    {product.gender ||
                      product.category?.parent?.name}
                  </span>
                </div>
                <div className="admin-product-inventory">
                  <strong>{product.variants?.length || 0} variants</strong>
                  <span>
                    {product.variants?.reduce(
                      (total, variant) => total + Number(variant.stock || 0),
                      0,
                    ) || 0}{" "}
                    units
                  </span>
                </div>
                <div className="admin-product-price">
                  <strong>${Number(product.price || 0).toFixed(2)}</strong>
                  {product.variants?.length > 1 && (
                    <span>from variant prices</span>
                  )}
                </div>
                <span
                  className={`admin-product-status ${isActive ? "active" : "inactive"}`}
                >
                  {isActive ? "active" : "inactive"}
                </span>
                <div className="admin-actions">
                  <button onClick={() => onEdit(product)} title="Edit product">
                    <FiSettings />
                  </button>
                  <button
                    onClick={() => onRemove(product)}
                    title="Delete product"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
            {products.length === 0 && (
              <div className="admin-empty">No products match your search.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
