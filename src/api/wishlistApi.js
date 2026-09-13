import api from "./axios";
import { normalizeProduct } from "./productApi";

export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  const payload = response.data?.data ?? response.data;
  const items = Array.isArray(payload)
    ? payload
    : payload?.products || payload?.items || payload?.wishlist || [];
  return items
    .map((item) => item.product || item)
    .map(normalizeProduct)
    .filter((item) => item?.id);
};

export const addToWishlist = async (productId) => {
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("A valid product is required to add it to the wishlist.");
  }
  return api.post(`/wishlist/${id}`, { product_id: id });
};
export const removeFromWishlist = async (productId) =>
  api.delete(`/wishlist/${productId}`);
