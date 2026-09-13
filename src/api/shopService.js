import {
  addToCart as apiAddCart,
  getCart as apiGetCart,
  updateCartItem as apiUpdateCart,
  removeCartItem as apiRemoveCart,
  clearCart as apiClearCart,
} from "./cartApi";
import {
  addToWishlist as apiAddWish,
  getWishlist as apiGetWish,
  removeFromWishlist as apiRemoveWish,
} from "./wishlistApi";
import { isAuthenticated } from "./authApi";
import { getProductId, getProductById } from "./productApi";

const read = (key) => {
  try {
    const x = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
};
const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("storage"));
};

export const getShopCart = async () =>
  isAuthenticated() ? apiGetCart() : read("cart");
export const addShopCart = async (product, qty = 1, size = null) => {
  const productId = getProductId(product);
  let source = product;
  let variantId = Number(
    source.variant_id ??
      source.product_variant_id ??
      source.variant?.id ??
      source.variants?.[0]?.id ??
      source.product_variants?.[0]?.id,
  );
  if (isAuthenticated() && (!Number.isInteger(variantId) || variantId <= 0)) {
    source = await getProductById(productId);
    variantId = Number(source.variants?.[0]?.id);
  }
  const variant = source.variants?.find(
    (item) => Number(item.id) === variantId,
  );
  const defaultSize = size || source.size || variant?.size?.name || null;
  const defaultColor =
    source.color || variant?.color?.name || variant?.color || null;

  if (!isAuthenticated()) {
    const cart = read("cart");
    const index = cart.findIndex(
      (x) => getProductId(x) === productId && x.size === defaultSize,
    );
    if (index >= 0)
      cart[index] = { ...cart[index], qty: (cart[index].qty || 1) + qty };
    else
      cart.push({
        ...product,
        qty,
        quantity: qty,
        size: defaultSize,
        color: defaultColor,
        variant_id: variantId,
      });
    save("cart", cart);
    return cart;
  }

  if (!Number.isInteger(variantId) || variantId <= 0) {
    throw new Error("This product has no purchasable variant.");
  }

  return apiAddCart({
    product_id: productId,
    quantity: qty,
    size: defaultSize,
    color: defaultColor,
    variant_id: variantId,
    product_variant_id: variantId,
  });
};
export const updateShopCart = async (item, qty, variant = null) => {
  if (isAuthenticated())
    return apiUpdateCart(item.cart_id || item.id, {
      quantity: qty,
      size: variant?.size?.name || item.size,
      color: variant?.color?.name || item.color,
      variant_id: variant?.id || item.variant_id,
      product_variant_id: variant?.id || item.variant_id,
    });
  const cart = read("cart").map((x) =>
    x.id === item.id && x.size === item.size
      ? {
          ...x,
          qty,
          quantity: qty,
          size: variant?.size?.name || x.size,
          color: variant?.color?.name || x.color,
          variant_id: variant?.id || x.variant_id,
        }
      : x,
  );
  save("cart", cart);
  return cart;
};
export const removeShopCart = async (item) => {
  if (isAuthenticated()) return apiRemoveCart(item.cart_id || item.id);
  save(
    "cart",
    read("cart").filter((x) => !(x.id === item.id && x.size === item.size)),
  );
};
export const clearShopCart = async () => {
  if (isAuthenticated()) return apiClearCart();
  save("cart", []);
};

export const getShopWishlist = async () =>
  isAuthenticated() ? apiGetWish() : read("wishlist");
export const toggleShopWishlist = async (product, exists) => {
  const productId = getProductId(product);
  if (isAuthenticated()) {
    if (exists) await apiRemoveWish(productId);
    else await apiAddWish(productId);
    return getShopWishlist();
  }
  const current = read("wishlist");
  const next = exists
    ? current.filter((x) => getProductId(x) !== productId)
    : [...current, product];
  save("wishlist", next);
  return next;
};
export const removeShopWishlist = async (product) => {
  const productId = getProductId(product);
  if (isAuthenticated()) {
    await apiRemoveWish(productId);
    return getShopWishlist();
  }
  const next = read("wishlist").filter((x) => getProductId(x) !== productId);
  save("wishlist", next);
  return next;
};
