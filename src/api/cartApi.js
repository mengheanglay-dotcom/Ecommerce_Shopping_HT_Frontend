import api, { unwrap } from "./axios";

const itemsFrom = (payload) => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) return value;
  return (
    value?.items || value?.cart_items || value?.cart || value?.products || []
  );
};

export const getCart = async () => itemsFrom(unwrap(await api.get("/cart")));

export const addToCart = async ({
  product_id,
  quantity = 1,
  qty,
  size = null,
  color = null,
}) => {
  const productId = Number(product_id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("A valid product is required to add it to the cart.");
  }
  const response = await api.post("/cart/items", {
    product_id: productId,
    quantity: qty || quantity,
    qty: qty || quantity,
    size,
    color,
  });
  return unwrap(response);
};

export const updateCartItem = async (id, { quantity, qty, size, color }) => {
  const response = await api.put(`/cart/items/${id}`, {
    quantity: qty || quantity,
    qty: qty || quantity,
    size,
    color,
  });
  return unwrap(response);
};

export const removeCartItem = async (id) => api.delete(`/cart/items/${id}`);
export const clearCart = async () => api.delete("/cart");
