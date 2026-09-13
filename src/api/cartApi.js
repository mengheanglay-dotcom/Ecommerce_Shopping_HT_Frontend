import api, { unwrap } from "./axios";

const itemsFrom = (payload) => {
  const value = payload?.data ?? payload;
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of ["items", "cart_items", "cart", "products", "data"]) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      const items = itemsFrom(nested);
      if (items.length > 0) return items;
    }
  }

  return [];
};

const normalizeCartItem = (item) => {
  const variant = item?.product_variant || item?.variant || {};
  const product = item?.product || variant.product || {};
  return {
    ...product,
    ...item,
    cart_id: item?.id || item?.cart_id,
    id: product.id || item?.product_id || item?.id,
    product_id: item?.product_id || product.id,
    variant_id:
      item?.variant_id || item?.product_variant_id || variant.id,
    image: item?.image || variant.image || product.image,
    name: item?.name || product.name,
    price:
      item?.price ??
      item?.unit_price ??
      variant.price ??
      product.price ??
      product.base_price,
    base_price: item?.base_price ?? product.base_price,
    category:
      item?.category?.name ||
      item?.category ||
      product.category?.name ||
      product.category,
    size: item?.size || variant.size?.name || variant.size,
    color: item?.color || variant.color?.name || variant.color,
    qty: item?.qty ?? item?.quantity ?? 1,
    quantity: item?.quantity ?? item?.qty ?? 1,
  };
};

export const getCart = async () =>
  itemsFrom(unwrap(await api.get("/cart"))).map(normalizeCartItem);

export const addToCart = async ({
  product_id,
  quantity = 1,
  qty,
  size = null,
  color = null,
  variant_id,
  product_variant_id,
}) => {
  const productId = Number(product_id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("A valid product is required to add it to the cart.");
  }
  const variantId = Number(product_variant_id ?? variant_id);
  const response = await api.post("/cart/items", {
    product_id: productId,
    quantity: qty || quantity,
    qty: qty || quantity,
    size,
    color,
    variant_id: Number.isInteger(variantId) && variantId > 0 ? variantId : null,
    product_variant_id:
      Number.isInteger(variantId) && variantId > 0 ? variantId : null,
  });
  return unwrap(response);
};

export const updateCartItem = async (id, {
  quantity,
  qty,
  size,
  color,
  variant_id,
  product_variant_id,
}) => {
  const variantId = Number(product_variant_id ?? variant_id);
  const response = await api.put(`/cart/items/${id}`, {
    quantity: qty || quantity,
    qty: qty || quantity,
    size,
    color,
    variant_id: Number.isInteger(variantId) && variantId > 0 ? variantId : null,
    product_variant_id:
      Number.isInteger(variantId) && variantId > 0 ? variantId : null,
  });
  return unwrap(response);
};

export const removeCartItem = async (id) => api.delete(`/cart/items/${id}`);
export const clearCart = async () => api.delete("/cart");
