import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiBox,
  FiCheck,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getAdminDashboard } from "../../api/adminApi";
import { isAuthenticated, getStoredUser } from "../../api/authApi";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import ProductModal from "./components/ProductModal";
import CustomersSection from "./sections/CustomersSection";
import OrdersSection from "./sections/OrdersSection";
import OverviewSection from "./sections/OverviewSection";
import ProductsSection from "./sections/ProductsSection";
import SettingsSection from "./sections/SettingsSection";
import EntitySection from "./sections/EntitySection";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../api/adminApi";
import "./Admin.css";

const titles = {
  overview: "Store overview",
  products: "Product catalog",
  orders: "Orders",
  customers: "Customers",
  categories: "Categories",
  brands: "Brands",
  settings: "Settings",
};
export default function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersRefresh, setOrdersRefresh] = useState(0);
  const [dashboard, setDashboard] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const u = getStoredUser();
    if (!isAuthenticated() || !(u?.is_admin || u?.role === "admin")) {
      navigate("/login");
    }
  }, [navigate]);
  const load = async () => {
    try {
      const [p, d] = await Promise.all([
        getProducts(),
        getAdminDashboard().catch(() => ({})),
      ]);
      setProducts(p || []);
      setDashboard(d || {});
    } catch (e) {
      console.error(e);
      showNotice("Unable to load admin API");
    } finally {
      setProductsLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );
  const filtered = products.filter(
    (p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "All" || p.category === category),
  );
  const stats = [
    {
      label: "Total revenue",
      value: `$${Number(dashboard.total_revenue ?? dashboard.revenue ?? 0).toFixed(2)}`,
      change: dashboard.revenue_change ? `${dashboard.revenue_change}%` : "API",
      icon: FiBarChart2,
      tone: "blue",
    },
    {
      label: "Orders",
      value: dashboard.orders_count ?? dashboard.total_orders ?? "—",
      change: "API",
      icon: FiShoppingBag,
      tone: "green",
    },
    {
      label: "Active products",
      value: dashboard.products_count ?? products.length,
      change: "API",
      icon: FiBox,
      tone: "orange",
    },
    {
      label: "Customers",
      value: dashboard.customers_count ?? dashboard.total_customers ?? "—",
      change: "API",
      icon: FiUsers,
      tone: "purple",
    },
  ];
  function showNotice(m) {
    setNotice(m);
    setTimeout(() => setNotice(""), 2400);
  }
  function select(s) {
    setSection(s);
    setSidebarOpen(false);
  }
  const remove = async (p) => {
    try {
      await deleteProduct(p.id);
      setProducts((x) => x.filter((y) => y.id !== p.id));
      showNotice("Product removed");
    } catch (e) {
      showNotice(e.response?.data?.message || "Unable to remove product");
    }
  };
  const save = async (p) => {
    try {
      const saved = editingProduct?.id
        ? await updateProduct(editingProduct.id, p)
        : await createProduct(p);
      setProducts((x) =>
        editingProduct?.id
          ? x.map((y) => (y.id === editingProduct.id ? saved : y))
          : [saved, ...x],
      );
      setEditingProduct(null);
      showNotice(editingProduct?.id ? "Product updated" : "Product added");
    } catch (e) {
      showNotice(e.response?.data?.message || "Unable to save product");
    }
  };
  return (
    <div className="admin-shell">
      <AdminSidebar
        section={section}
        open={sidebarOpen}
        onSelect={select}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="admin-main">
        <AdminTopbar
          section={section}
          title={titles[section]}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        {section === "overview" && (
          <OverviewSection
            products={products}
            stats={stats}
            dashboard={dashboard}
            onNavigate={select}
          />
        )}{" "}
        {section === "products" && (
          <ProductsSection
            products={filtered}
            loading={productsLoading}
            categories={categories}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            onAdd={() => setEditingProduct({})}
            onEdit={setEditingProduct}
            onRemove={remove}
          />
        )}{" "}
        {section === "orders" && (
          <OrdersSection
            key={ordersRefresh}
            onChanged={() => setOrdersRefresh((x) => x + 1)}
          />
        )}{" "}
        {section === "customers" && <CustomersSection />}{" "}
        {section === "categories" && (
          <EntitySection
            title="Categories"
            eyebrow="CATALOG"
            load={getAdminCategories}
            create={createCategory}
            update={updateCategory}
            remove={deleteCategory}
          />
        )}{" "}
        {section === "brands" && (
          <EntitySection
            title="Brands"
            eyebrow="CATALOG"
            load={getAdminBrands}
            create={createBrand}
            update={updateBrand}
            remove={deleteBrand}
          />
        )}{" "}
        {section === "settings" && <SettingsSection />}
      </main>
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={save}
        />
      )}{" "}
      {notice && (
        <div className="admin-toast">
          <FiCheck /> {notice}
        </div>
      )}
    </div>
  );
}
