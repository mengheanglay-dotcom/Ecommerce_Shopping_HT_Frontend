import api, { unwrap } from "./axios";

const list = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  if (payload.data) return list(payload.data, keys);
  return [];
};

export const getAdminDashboard = async () =>
  unwrap(await api.get("/admin/dashboard"));
export const getAdminOrders = async () =>
  list(unwrap(await api.get("/admin/orders")), ["orders"]);
export const getAdminOrderById = async (id) =>
  unwrap(await api.get(`/admin/orders/${id}`));
export const updateAdminOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status });
  return unwrap(response);
};
export const updateAdminPaymentStatus = async (id, payment_status) => {
  const response = await api.put(`/admin/orders/${id}/payment-status`, {
    payment_status,
  });
  return unwrap(response);
};
export const getAdminUsers = async () =>
  list(unwrap(await api.get("/admin/users")), ["users", "customers"]);
export const createAdminUser = async (data) =>
  unwrap(await api.post("/admin/users", data));
export const updateAdminUser = async (id, data) =>
  unwrap(await api.put(`/admin/users/${id}`, data));
export const deleteAdminUser = async (id) =>
  api.delete(`/admin/users/${id}`);
export const getCustomers = getAdminUsers;

export const getCatalogCategories = async () =>
  list(unwrap(await api.get("/categories")), ["categories"]).flatMap(
    (category) => {
      const flatten = (item, parentName = "") => [
        { ...item, parentName },
        ...(item.children || []).flatMap((child) =>
          flatten(child, item.name),
        ),
      ];
      return flatten(category);
    },
  );
export const getAdminCategories = getCatalogCategories;
export const createCategory = async (data) =>
  unwrap(await api.post("/admin/categories", data));
export const updateCategory = async (id, data) =>
  unwrap(await api.put(`/admin/categories/${id}`, data));
export const deleteCategory = async (id) =>
  api.delete(`/admin/categories/${id}`);

export const getCatalogBrands = async () =>
  list(unwrap(await api.get("/brands")), ["brands"]);
export const getAdminBrands = getCatalogBrands;
export const getBrands = getCatalogBrands;
export const createBrand = async (data) =>
  unwrap(await api.post("/admin/brands", data));
export const updateBrand = async (id, data) =>
  unwrap(await api.put(`/admin/brands/${id}`, data));
export const deleteBrand = async (id) => api.delete(`/admin/brands/${id}`);

export const getSizes = async () =>
  list(unwrap(await api.get("/sizes")), ["sizes"]);
export const getColors = async () =>
  list(unwrap(await api.get("/colors")), ["colors"]);
export const getCatalogSizes = async () =>
  list(unwrap(await api.get("/sizes")), ["sizes"]);
export const getCatalogColors = async () =>
  list(unwrap(await api.get("/colors")), ["colors"]);
export const getAdminSizes = getCatalogSizes;
export const getAdminColors = getCatalogColors;
export const createSize = async (data) =>
  unwrap(await api.post("/admin/sizes", data));
export const updateSize = async (id, data) =>
  unwrap(await api.put(`/admin/sizes/${id}`, data));
export const deleteSize = async (id) => api.delete(`/admin/sizes/${id}`);
export const createColor = async (data) =>
  unwrap(await api.post("/admin/colors", data));
export const updateColor = async (id, data) =>
  unwrap(await api.put(`/admin/colors/${id}`, data));
export const deleteColor = async (id) => api.delete(`/admin/colors/${id}`);
export const createProductVariant = async (data) =>
  unwrap(await api.post("/admin/product-variants", data));
export const updateProductVariant = async (id, data) =>
  unwrap(await api.put(`/admin/product-variants/${id}`, data));
export const deleteProductVariant = async (id) =>
  api.delete(`/admin/product-variants/${id}`);
