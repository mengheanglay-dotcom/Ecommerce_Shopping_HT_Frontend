import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  getShopCart,
  updateShopCart,
  removeShopCart,
  getShopWishlist,
  toggleShopWishlist,
} from "../api/shopService";
import { getProductById } from "../api/productApi";
import { ToastContainer, useToast } from "../components/Toast";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const { toasts, addToast, removeToast } = useToast();
  const load = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const items = await getShopCart();
      const detailed = await Promise.all(
        items.map(async (item) => ({
          ...item,
          variants: item.variants?.length
            ? item.variants
            : (await getProductById(item.product_id || item.id)).variants,
        })),
      );
      const groups = new Map();
      detailed.forEach((item) => {
        const key = String(
          `${item.product_id || item.id}:${String(item.size || "").toLowerCase()}:${String(item.color || "").toLowerCase()}`,
        );
        const group = groups.get(key) || [];
        group.push(item);
        groups.set(key, group);
      });
      const merged = [];
      for (const group of groups.values()) {
        const [primary, ...duplicates] = group;
        if (duplicates.length) {
          const quantity =
            Number(primary.qty || primary.quantity || 1) +
            duplicates.reduce(
              (total, item) =>
                total + Number(item.qty || item.quantity || 1),
              0,
            );
          let didMerge = false;
          try {
            const stock = Number(
              primary.variants?.find(
                (variant) =>
                  String(variant.size?.name || "").toLowerCase() ===
                    String(primary.size || "").toLowerCase() &&
                  String(variant.color?.name || "").toLowerCase() ===
                    String(primary.color || "").toLowerCase(),
              )?.stock,
            );
            if (Number.isFinite(stock) && quantity > stock) {
              throw new Error(
                `Cannot merge duplicate items: combined quantity ${quantity} exceeds stock ${stock}.`,
              );
            }
            await updateShopCart(primary, quantity);
            for (const duplicate of duplicates) {
              await removeShopCart(duplicate);
            }
            didMerge = true;
            addToast(
              `${primary.name || "Duplicate product"} was already in your cart. Quantities were merged.`,
              "info",
            );
          } catch (mergeError) {
            addToast(
              mergeError.response?.data?.message ||
                "Duplicate cart items could not be merged because the stock limit was reached.",
              "error",
            );
          }
          if (didMerge) merged.push({ ...primary, qty: quantity, quantity });
          else merged.push(...group);
        } else {
          merged.push(primary);
        }
      }
      setCart(merged);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    window.addEventListener("authchange", load);
    return () => window.removeEventListener("authchange", load);
  }, []);
  const variantKey = (item, selected) =>
    String(
      `${item.product_id || item.id}:${String(selected?.size?.name || item.size || "").toLowerCase()}:${String(selected?.color?.name || item.color || "").toLowerCase()}`,
    );
  const selectedForItem = (item) => {
    const itemId = item.cart_id || item.id;
    return (
      selectedVariants[itemId] ||
      item.variants?.find(
        (variant) => Number(variant.id) === Number(item.variant_id),
      ) ||
      item.variants?.find(
        (variant) =>
          variant.size?.name === item.size &&
          variant.color?.name === item.color,
      )
    );
  };
  const cartVariantCounts = cart.reduce((counts, item) => {
    const key = variantKey(item, selectedForItem(item));
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const hasDuplicateItems = Object.values(cartVariantCounts).some(
    (count) => count > 1,
  );
  const hasStockConflict = cart.some((item) => {
    const selected = selectedForItem(item);
    const stock = Number(selected?.stock);
    if (!Number.isFinite(stock) || stock <= 0) return false;
    const key = variantKey(item, selected);
    const total = cart.reduce(
      (sum, current) =>
        variantKey(current, selectedForItem(current)) === key
          ? sum + Number(current.qty || current.quantity || 1)
          : sum,
      0,
    );
    return total > stock;
  });
  const canCheckout = !error && !hasDuplicateItems && !hasStockConflict;
  const update = async (item, delta, variant = null) => {
    const itemId = item.cart_id || item.id;
    try {
      setUpdatingId(itemId);
      const selected = variant || selectedVariants[itemId];
      const stock = Number(selected?.stock);
      const variantId = variantKey(item, selected);
      const otherQuantity = cart.reduce((total, current) => {
        const currentId = current.cart_id || current.id;
        const currentVariantId = variantKey(
          current,
          selectedVariants[currentId],
        );
        return currentId !== itemId && currentVariantId === variantId
          ? total + Number(current.qty || current.quantity || 1)
          : total;
      }, 0);
      const maximum =
        Number.isFinite(stock) && stock > 0
          ? Math.max(1, stock - otherQuantity)
          : Infinity;
      const qty = Math.min(
        maximum,
        Math.max(1, Number(item.qty || item.quantity || 1) + delta),
      );
      if (delta > 0 && qty === Number(item.qty || item.quantity || 1)) {
        setError("You have reached the available stock for this variant.");
        return;
      }
      if (selected) {
        setSelectedVariants((current) => ({ ...current, [itemId]: selected }));
      }
      await updateShopCart(item, qty, variant);
      await load(false);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update your cart.");
    } finally {
      setUpdatingId(null);
    }
  };
  const remove = async (item) => {
    try {
      await removeShopCart(item);
      await load(false);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to remove this item.");
    }
  };
  const moveToWishlist = async (item, selected) => {
    const itemId = item.cart_id || item.id;
    try {
      setMovingId(itemId);
      const product = {
        ...item,
        id: item.product_id || item.id,
        variant_id: selected?.id || item.variant_id,
        size: selected?.size?.name || item.size,
        color: selected?.color?.name || item.color,
      };
      const wishlist = await getShopWishlist();
      const exists = wishlist.some((saved) => saved.id === product.id);
      if (!exists) await toggleShopWishlist(product, false);
      await removeShopCart(item);
      await load(false);
      window.dispatchEvent(new Event("storage"));
      addToast(`${product.name} moved to wishlist.`, "success");
    } catch (e) {
      addToast(
        e.response?.data?.message ||
          e.message ||
          "Unable to move this item to your wishlist.",
        "error",
      );
    } finally {
      setMovingId(null);
    }
  };
  const subtotal = cart.reduce(
    (s, x) =>
      s +
      Number(x.price ?? x.base_price ?? x.product?.base_price ?? 0) *
        (x.qty || x.quantity || 1),
    0,
  );
  if (loading)
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        Loading cart...
      </div>
    );
  if (error)
    return (
      <div className="min-h-[65vh] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  if (!cart.length)
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-5xl mb-5">🛍️</div>
          <h1 className="text-3xl font-semibold">Your bag is empty</h1>
          <p className="text-neutral-500 mt-2">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/"
            className="inline-flex mt-7  bg-black rounded-full px-6 py-3 text-sm font-semibold"
          >
            <span className="text-white">Continue shopping</span>
          </Link>
        </div>
      </div>
    );
  return (
    <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Link
        to="/"
        className="inline-flex text-light items-center gap-2 text-sm text-neutral-500"
      >
        <FiArrowLeft /> Continue shopping
      </Link>
      <div className="mt-8 flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="flex items-end justify-between border-b pb-5">
            <div>
              <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
                YOUR SELECTION
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-2">
                Shopping bag
              </h1>
            </div>
            <span className="text-sm text-neutral-500">
              {cart.length} items
            </span>
          </div>
          <div className="divide-y">
            {cart.map((item) => (
              (() => {
                const itemId = item.cart_id || item.id;
                const selected =
                  selectedVariants[itemId] ||
                  item.variants?.find(
                    (variant) => Number(variant.id) === Number(item.variant_id),
                  ) ||
                  item.variants?.find(
                    (variant) =>
                      variant.size?.name === item.size &&
                      variant.color?.name === item.color,
                  );
                const stock = Number(selected?.stock);
                const variantId = variantKey(item, selected);
                const totalQuantity = cart.reduce((total, current) => {
                  const currentId = current.cart_id || current.id;
                  const currentVariantId = variantKey(
                    current,
                    selectedVariants[currentId],
                  );
                  return currentVariantId === variantId
                    ? total + Number(current.qty || current.quantity || 1)
                    : total;
                }, 0);
                const exceedsStock =
                  Number.isFinite(stock) &&
                  stock > 0 &&
                  totalQuantity > stock;
                const price = Number(
                  selected?.price ??
                    item.price ??
                    item.base_price ??
                    item.product?.base_price ??
                    0,
                );
                return (
              <div
                key={`${itemId}-${selected?.id || item.size || ""}`}
                className="py-6 flex gap-4 md:gap-6"
              >
                <Link to={`/product/${item.product_id || item.id}`}>
                  <img
                    src={item.image || item.product?.image}
                    className="w-24 h-28 md:w-32 md:h-36 object-cover rounded-2xl bg-neutral-100"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.product_id || item.id}`}>
                        <h3 className="font-medium hover:underline">
                          {item.name || item.product?.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-2">
                          {item.category ||
                            item.product?.category?.name ||
                            "Product"}{" "}
                          · Size {selected?.size?.name || item.size || "N/A"} ·{" "}
                          {selected?.color?.name || item.color || "N/A"}
                        </p>
                      </Link>
                    </div>
                    <p className="font-semibold">
                      $
                      {(price * (item.qty || item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    {item.variants?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={selected?.size?.name || item.size || ""}
                          onChange={(event) => {
                            const next = item.variants.find(
                              (variant) =>
                                variant.size?.name === event.target.value &&
                                variant.color?.name ===
                                  (selected?.color?.name || item.color),
                            ) || item.variants.find(
                              (variant) =>
                                variant.size?.name === event.target.value,
                            );
                            setSelectedVariants((current) => ({
                              ...current,
                              [itemId]: next,
                            }));
                            update(item, 0, next);
                          }}
                          disabled={updatingId === (item.cart_id || item.id)}
                          className="border rounded-lg px-2 py-1 text-xs"
                        >
                          {[...new Set(item.variants.map((v) => v.size?.name).filter(Boolean))].map(
                            (size) => <option key={size}>{size}</option>,
                          )}
                        </select>
                        <select
                          value={selected?.color?.name || item.color || ""}
                          onChange={(event) => {
                            const next = item.variants.find(
                              (variant) =>
                                variant.color?.name === event.target.value &&
                                variant.size?.name ===
                                  (selected?.size?.name || item.size),
                            ) || item.variants.find(
                              (variant) =>
                                variant.color?.name === event.target.value,
                            );
                            setSelectedVariants((current) => ({
                              ...current,
                              [itemId]: next,
                            }));
                            update(item, 0, next);
                          }}
                          disabled={updatingId === (item.cart_id || item.id)}
                          className="border rounded-lg px-2 py-1 text-xs"
                        >
                          {[...new Set(item.variants.map((v) => v.color?.name).filter(Boolean))].map(
                            (color) => <option key={color}>{color}</option>,
                          )}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center border rounded-full">
                      <button
                        onClick={() => update(item, -1, selected)}
                        disabled={updatingId === (item.cart_id || item.id)}
                        className="p-2.5 disabled:opacity-40"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm">
                        {item.qty || item.quantity || 1}
                      </span>
                      {Number.isFinite(stock) && stock > 0 && (
                        <span className="mx-2 text-xs text-neutral-400">
                          {exceedsStock
                            ? `${item.qty || item.quantity || 1}/${stock} in stock`
                            : `${totalQuantity}/${stock} in stock`}
                        </span>
                      )}
                      {exceedsStock && (
                        <span className="ml-2 text-xs text-red-600">
                          Duplicate quantity exceeds stock
                        </span>
                      )}
                      <button
                        onClick={() => update(item, 1, selected)}
                        disabled={
                          updatingId === itemId ||
                          (Number.isFinite(stock) &&
                            stock > 0 &&
                            totalQuantity >= stock)
                        }
                        className="p-2.5 disabled:opacity-40"
                      >
                        <FiPlus size={13} />
                      </button>
                      {                      updatingId === itemId && (
                        <span className="ml-2 text-xs text-neutral-400">
                          Updating...
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => remove(item)}
                      className="text-neutral-400 hover:text-red-500 p-2"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <button
                    onClick={() => moveToWishlist(item, selected)}
                    disabled={
                      movingId === itemId || updatingId === itemId
                    }
                    className="mt-3 text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
                  >
                    {movingId === itemId
                      ? "Moving..."
                      : "Move to wishlist"}
                  </button>
                </div>
              </div>
                );
              })()
            ))}
          </div>
        </div>
        <aside className="lg:w-95 h-fit rounded-3xl bg-white border border-black/5 p-7 shadow-sm">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-7 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span>$6.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tax</span>
              <span>$5.00</span>
            </div>
            <div className="border-t pt-5 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>${(subtotal + 11).toFixed(2)}</span>
            </div>
          </div>
          {canCheckout && (
            <Link
              to="/checkout"
              className="mt-7 flex justify-center bg-black rounded-full py-4 text-sm font-semibold"
            >
              <span className="text-white">Proceed to checkout</span>
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
