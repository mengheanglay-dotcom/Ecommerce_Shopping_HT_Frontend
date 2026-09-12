import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  getShopCart,
  updateShopCart,
  removeShopCart,
} from "../api/shopService";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      setCart(await getShopCart());
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
  const update = async (item, delta) => {
    const qty = Math.max(1, Number(item.qty || item.quantity || 1) + delta);
    await updateShopCart(item, qty);
    await load();
    window.dispatchEvent(new Event("storage"));
  };
  const remove = async (item) => {
    await removeShopCart(item);
    await load();
    window.dispatchEvent(new Event("storage"));
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
            className="inline-flex mt-7 bg-black text-white rounded-full px-6 py-3 text-sm font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  return (
    <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-neutral-500"
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
              <div
                key={`${item.cart_id || item.id}-${item.size || ""}`}
                className="py-6 flex gap-4 md:gap-6"
              >
                <img
                  src={item.image || item.product?.image}
                  className="w-24 h-28 md:w-32 md:h-36 object-cover rounded-2xl bg-neutral-100"
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-medium">
                        {item.name || item.product?.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-2">
                        {item.category ||
                          item.product?.category?.name ||
                          "Product"}{" "}
                        · Size {item.size || "N/A"}
                      </p>
                    </div>
                    <p className="font-semibold">
                      $
                      {(
                        Number(
                          item.price ??
                            item.base_price ??
                            item.product?.base_price ??
                            0,
                        ) * (item.qty || item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center border rounded-full">
                      <button
                        onClick={() => update(item, -1)}
                        className="p-2.5"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm">
                        {item.qty || item.quantity || 1}
                      </span>
                      <button onClick={() => update(item, 1)} className="p-2.5">
                        <FiPlus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item)}
                      className="text-neutral-400 hover:text-red-500 p-2"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
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
          <Link
            to="/checkout"
            className="mt-7 flex justify-center bg-black text-white rounded-full py-4 text-sm font-semibold"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
