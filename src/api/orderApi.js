import api, { unwrap } from "./axios";

const listFrom = (payload) => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) return value;
  return value?.orders || value?.data || [];
};

export const createOrder = async (order) =>
  unwrap(await api.post("/checkout", order));
export const getMyOrders = async () =>
  listFrom(unwrap(await api.get("/orders")));
export const getOrderById = async (id) =>
  unwrap(await api.get(`/orders/${id}`));
