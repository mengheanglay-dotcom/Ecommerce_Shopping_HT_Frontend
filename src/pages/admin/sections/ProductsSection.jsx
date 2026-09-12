import { FiSearch, FiSettings, FiStar, FiTrash2, FiPlus } from "react-icons/fi";
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
              <span>Category</span>
              <span>Price</span>
              <span>Rating</span>
              <span>Actions</span>
            </div>
            {products.map((product) => (
              <div className="admin-table-row" key={product.id}>
                <div className="admin-product-cell">
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>SKU-{String(product.id).padStart(4, "0")}</span>
                  </div>
                </div>
                <span className="admin-muted">{product.category}</span>
                <strong>${Number(product.price).toFixed(2)}</strong>
                <span className="admin-rating">
                  <FiStar /> {product.rating?.rate || "New"}
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
