import api, { unwrap } from "./axios";

const list = (payload, keys = []) => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
};

export const getAdminDashboard = async () =>
  unwrap(await api.get("/admin/dashboard"));
export const getAdminOrders = async () =>
  list(unwrap(await api.get("/admin/orders")), ["orders"]);
export const getAdminOrderById = async (id) =>
  unwrap(await api.get(`/admin/orders/${id}`));
export const updateAdminOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return unwrap(response);
};
export const getCustomers = async () =>
  list(unwrap(await api.get("/admin/customers")), ["customers", "users"]);
export const getCustomerById = async (id) =>
  unwrap(await api.get(`/admin/customers/${id}`));
export const deleteCustomer = async (id) =>
  api.delete(`/admin/customers/${id}`);

export const getAdminCategories = async () =>
  list(unwrap(await api.get("/categories")), ["categories"]);
export const createCategory = async (data) =>
  unwrap(await api.post("/categories", data));
export const updateCategory = async (id, data) =>
  unwrap(await api.put(`/categories/${id}`, data));
export const deleteCategory = async (id) => api.delete(`/categories/${id}`);

export const getAdminBrands = async () =>
  list(unwrap(await api.get("/brands")), ["brands"]);
export const createBrand = async (data) =>
  unwrap(await api.post("/brands", data));
export const updateBrand = async (id, data) =>
  unwrap(await api.put(`/brands/${id}`, data));
export const deleteBrand = async (id) => api.delete(`/brands/${id}`);
