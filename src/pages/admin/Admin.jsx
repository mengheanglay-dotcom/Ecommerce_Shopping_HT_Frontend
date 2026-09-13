import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiBox,
  FiCheck,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiLayers,
} from "react-icons/fi";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getAdminDashboard } from "../../api/adminApi";
import {
  isAuthenticated,
  getStoredUser,
  getCurrentUser,
  isAdminUser,
} from "../../api/authApi";
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
  getCatalogCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminBrands,
  getCatalogBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getAdminSizes,
  getCatalogSizes,
  getAdminColors,
  getCatalogColors,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminUsers,
  createSize,
  updateSize,
  deleteSize,
  createColor,
  updateColor,
  deleteColor,
  createProductVariant,
  updateProductVariant,
} from "../../api/adminApi";
import "./Admin.css";

const titles = {
  overview: "Store overview",
  products: "Product catalog",
  orders: "Orders",
  customers: "Customers",
  categories: "Categories",
  brands: "Brands",
  sizes: "Sizes",
  colors: "Colors",
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
  const [orders, setOrders] = useState([]);
  const [adminCounts, setAdminCounts] = useState({
    orders: 0,
    customers: 0,
    categories: 0,
    brands: 0,
    sizes: 0,
    colors: 0,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }
      try {
        const user = await getCurrentUser();
        if (!isAdminUser(user)) navigate("/login");
      } catch {
        navigate("/login");
      }
    };
    verifyAdmin();
  }, [navigate]);
  const load = async () => {
    try {
      const [p, d] = await Promise.all([
        getProducts(),
        getAdminDashboard().catch(() => ({})),
      ]);
      setProducts(p || []);
      setDashboard(d || {});
      const [orders, customers, categoriesData, brandsData, sizesData, colorsData] =
        await Promise.all([
          getAdminOrders().catch(() => []),
          getAdminUsers().catch(() => []),
          getCatalogCategories().catch(() => []),
          getCatalogBrands().catch(() => []),
          getCatalogSizes().catch(() => []),
          getCatalogColors().catch(() => []),
        ]);
      setAdminCounts({
        orders: orders.length,
        customers: customers.length,
        categories: categoriesData.length,
        brands: brandsData.length,
        sizes: sizesData.length,
        colors: colorsData.length,
      });
      setOrders(orders);
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
      value: `$${(
        Number(dashboard.total_revenue ?? dashboard.revenue ?? 0) ||
        orders
          .filter((order) => {
            const status = String(order.status || "").toLowerCase();
            const paymentStatus = String(order.payment_status || "").toLowerCase();
            return (
              ["delivered", "completed"].includes(status) ||
              ["paid", "completed"].includes(paymentStatus)
            );
          })
          .reduce(
            (total, order) =>
              total + Number(order.total ?? order.grand_total ?? 0),
            0,
          )
      ).toFixed(2)}`,
      change: dashboard.revenue_change ? `${dashboard.revenue_change}%` : "Delivered / paid",
      icon: FiBarChart2,
      tone: "blue",
    },
    {
      label: "Orders",
      value: dashboard.orders_count ?? dashboard.total_orders ?? adminCounts.orders,
      change: "Live",
      icon: FiShoppingBag,
      tone: "green",
    },
    {
      label: "Products",
      value: dashboard.products_count ?? products.length,
      change: "Live",
      icon: FiBox,
      tone: "orange",
    },
    {
      label: "Customers",
      value: dashboard.customers_count ?? dashboard.total_customers ?? adminCounts.customers,
      change: "Live",
      icon: FiUsers,
      tone: "purple",
    },
    {
      label: "Categories",
      value: adminCounts.categories,
      change: "Live",
      icon: FiLayers,
      tone: "blue",
    },
    {
      label: "Brands",
      value: adminCounts.brands,
      change: "Live",
      icon: FiTag,
      tone: "green",
    },
  ];
  const updateOverviewOrderStatus = async (orderId, status) => {
    const normalizedStatus = status.toLowerCase().replace(/ /g, "_");
    const order = orders.find(
      (item) => String(item.order_number || item.id) === String(orderId),
    );
    try {
      await updateAdminOrderStatus(order?.id || orderId, normalizedStatus);
      setOrders((current) =>
        current.map((item) =>
          String(item.order_number || item.id) === String(orderId)
            ? { ...item, status: normalizedStatus }
            : item,
        ),
      );
    } catch (error) {
      showNotice(
        error.response?.data?.message || "Unable to update order status",
      );
    }
  };
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
      const { variants, ...productData } = p;
      let saved = editingProduct?.id
        ? await updateProduct(editingProduct.id, productData)
        : await createProduct(productData);
      const generatedCode = productData.code;
      const actualCode =
        !editingProduct?.id && saved.id && generatedCode
          ? generatedCode.replace(/-\d{3}$/, `-${String(saved.id).padStart(3, "0")}`)
          : generatedCode;
      if (actualCode && actualCode !== generatedCode) {
        saved = await updateProduct(saved.id, {
          ...productData,
          code: actualCode,
        });
      }
      await Promise.all(
        variants.map((variant) => {
          const variantPayload = {
            ...variant,
            product_id: saved.id,
            sku:
              actualCode && generatedCode
                ? variant.sku.replace(`${generatedCode}-`, `${actualCode}-`)
                : variant.sku,
          };
          return variant.id
            ? updateProductVariant(variant.id, variantPayload)
            : createProductVariant(variantPayload);
        }),
      );
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
        orderCount={adminCounts.orders}
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
            orders={orders}
            onOrderStatusUpdate={updateOverviewOrderStatus}
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
            load={getCatalogCategories}
            create={createCategory}
            update={updateCategory}
            remove={deleteCategory}
          />
        )}{" "}
        {section === "brands" && (
          <EntitySection
            title="Brands"
            eyebrow="CATALOG"
            load={getCatalogBrands}
            create={createBrand}
            update={updateBrand}
            remove={deleteBrand}
            imageField="logo"
            imageLabel="Logo URL"
          />
        )}{" "}
        {section === "sizes" && (
          <EntitySection
            title="Sizes"
            eyebrow="CATALOG"
            load={getCatalogSizes}
            create={createSize}
            update={updateSize}
            remove={deleteSize}
          />
        )}{" "}
        {section === "colors" && (
          <EntitySection
            title="Colors"
            eyebrow="CATALOG"
            load={getCatalogColors}
            create={createColor}
            update={updateColor}
            remove={deleteColor}
            secondaryField="hex_code"
            secondaryLabel="#000000"
            colorField="hex_code"
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
