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
  if (isAuthenticated())
    return apiAddCart({ product_id: product.id, quantity: qty, size });
  const cart = read("cart");
  const index = cart.findIndex((x) => x.id === product.id && x.size === size);
  if (index >= 0)
    cart[index] = { ...cart[index], qty: (cart[index].qty || 1) + qty };
  else cart.push({ ...product, qty, size });
  save("cart", cart);
  return cart;
};
export const updateShopCart = async (item, qty) => {
  if (isAuthenticated())
    return apiUpdateCart(item.id || item.cart_id, {
      quantity: qty,
      size: item.size,
    });
  const cart = read("cart").map((x) =>
    x.id === item.id && x.size === item.size ? { ...x, qty } : x,
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
  if (isAuthenticated()) {
    if (exists) await apiRemoveWish(product.id);
    else await apiAddWish(product.id);
    return getShopWishlist();
  }
  const current = read("wishlist");
  const next = exists
    ? current.filter((x) => x.id !== product.id)
    : [...current, product];
  save("wishlist", next);
  return next;
};
export const removeShopWishlist = async (product) => {
  if (isAuthenticated()) {
    await apiRemoveWish(product.id);
    return getShopWishlist();
  }
  const next = read("wishlist").filter((x) => x.id !== product.id);
  save("wishlist", next);
  return next;
};
