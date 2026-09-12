import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getShopWishlist,
  removeShopWishlist,
  addShopCart,
} from "../api/shopService";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setItems(await getShopWishlist());
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
  const cart = async (p) => {
    await addShopCart(p);
    window.dispatchEvent(new Event("storage"));
  };
  if (loading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading wishlist...
      </div>
    );
  return (
    <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
          {items.map((p) => (
            <div key={p.id} className="border rounded-2xl overflow-hidden">
              <Link to={`/product/${p.id}`}>
                <img
                  src={p.image}
                  className="w-full aspect-[4/5] object-cover bg-neutral-100"
                />
              </Link>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{p.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  ${Number(p.price || p.base_price || 0).toFixed(2)}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => cart(p)}
                    className="flex-1 bg-black text-white rounded-full py-2 text-sm"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="border rounded-full px-4 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
