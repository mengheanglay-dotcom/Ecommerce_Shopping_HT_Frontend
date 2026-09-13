import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getShopWishlist,
  removeShopWishlist,
  addShopCart,
} from "../api/shopService";
import { getProductById } from "../api/productApi";
import { ToastContainer, useToast } from "../components/Toast";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selections, setSelections] = useState({});
  const [movingId, setMovingId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const load = async () => {
    try {
      const wishlist = await getShopWishlist();
      const detailed = await Promise.all(
        wishlist.map(async (item) => ({
          ...item,
          variants: item.variants?.length
            ? item.variants
            : (await getProductById(item.id)).variants,
        })),
      );
      setItems(detailed);
      setSelections(
        Object.fromEntries(
          detailed.map((item) => {
            const variant = item.variants?.[0];
            return [
              item.id,
              {
                size: variant?.size?.name || "",
                color: variant?.color?.name || "",
              },
            ];
          }),
        ),
      );
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    window.addEventListener("authchange", load);
    return () => window.removeEventListener("authchange", load);
  }, []);
  const remove = async (p) => {
    await removeShopWishlist(p);
    await load();
    window.dispatchEvent(new Event("storage"));
  };
  const selectedVariant = (product) => {
    const selection = selections[product.id] || {};
    return (
      product.variants?.find(
        (variant) =>
          variant.size?.name === selection.size &&
          variant.color?.name === selection.color,
      ) ||
      product.variants?.find(
        (variant) => variant.size?.name === selection.size,
      ) ||
      product.variants?.[0]
    );
  };
  const cart = async (p) => {
    setMovingId(p.id);
    const variant = selectedVariant(p);
    if (Number(variant?.stock) <= 0) {
      addToast(`${p.name} is out of stock for the selected size and color.`, "error");
      setMovingId(null);
      return;
    }
    try {
      await addShopCart(
        {
          ...p,
          variant_id: variant?.id,
          size: variant?.size?.name,
          color: variant?.color?.name,
        },
        1,
        variant?.size?.name,
      );
      await removeShopWishlist(p);
      await load();
      window.dispatchEvent(new Event("storage"));
      addToast(`${p.name} moved to cart.`, "success");
    } catch (e) {
      addToast(
        e.response?.data?.message ||
          e.message ||
          "Unable to move this item to cart.",
        "error",
      );
    } finally {
      setMovingId(null);
    }
  };
  if (loading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading wishlist...
      </div>
    );
  return (
    <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
        YOUR SAVED ITEMS
      </p>
      <h1 className="text-4xl md:text-5xl font-semibold mt-2">Wishlist</h1>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {!items.length ? (
        <div className="py-24 text-center text-neutral-500">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid gap-4 mt-10 md:grid-cols-2">
          {items.map((p) => (
            (() => {
              const variant = selectedVariant(p);
              const stock = Number(variant?.stock);
              const outOfStock = Number.isFinite(stock) && stock <= 0;
              return (
                <div
                  key={p.id}
                  className="flex gap-4 overflow-hidden rounded-2xl border bg-white p-3"
                >
                  <Link to={`/product/${p.id}`} className="shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-36 w-28 rounded-xl object-cover bg-neutral-100"
                    />
                  </Link>
                  <div className="min-w-0 flex-1 py-1">
                    <Link to={`/product/${p.id}`} className="block">
                      <h3 className="font-medium line-clamp-1 hover:underline">
                        {p.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        ${Number(p.price || p.base_price || 0).toFixed(2)}
                      </p>
                    </Link>
                {p.variants?.length > 0 && (
                  <div className="mt-4 space-y-3 grid grid-cols-2 gap-4">
                    <select
                      value={selections[p.id]?.size || ""}
                      onChange={(e) =>
                        setSelections((current) => ({
                          ...current,
                          [p.id]: {
                            ...current[p.id],
                            size: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-2 py-2 text-sm"
                    >
                      {[...new Set(p.variants.map((v) => v.size?.name).filter(Boolean))].map(
                        (size) => (
                          <option key={size}>{size}</option>
                        ),
                      )}
                    </select>
                    <select
                      value={selections[p.id]?.color || ""}
                      onChange={(e) =>
                        setSelections((current) => ({
                          ...current,
                          [p.id]: {
                            ...current[p.id],
                            color: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-2 py-2 text-sm"
                    >
                      {[...new Set(p.variants.map((v) => v.color?.name).filter(Boolean))].map(
                        (color) => (
                          <option key={color}>{color}</option>
                        ),
                      )}
                    </select>
                    {Number.isFinite(stock) && (
                      <p
                        className={`text-xs ${
                          outOfStock ? "text-red-600" : "text-neutral-500"
                        }`}
                      >
                        {outOfStock ? "Out of stock" : `${stock} available`}
                      </p>
                    )}
                  </div>
                )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => cart(p)}
                        disabled={outOfStock || movingId === p.id}
                        className="bg-black text-white rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        {outOfStock
                          ? "Out of stock"
                          : movingId === p.id
                            ? "Moving..."
                            : "Move to cart"}
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="border rounded-full px-4 py-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ))}
        </div>
      )}
    </main>
  );
}
