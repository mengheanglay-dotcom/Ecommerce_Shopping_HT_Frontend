import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingBag } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { ToastContainer, useToast } from "./Toast";

export default function ProductCard({
  products = [],
  showWishlist = true,
  showCart = true,
  showView = true,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
  layout = "grid",
}) {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [addingId, setAddingId] = useState(null);
  const add = async (p) => {
    setAddingId(p.id);
    try {
      await onAddToCart?.(p);
      navigate("/cart");
    } catch (error) {
      addToast(
        error.response?.data?.message || "Unable to add this product to your bag.",
        "error",
      );
    } finally {
      setAddingId(null);
    }
  };
  const toggle = async (p) => {
    const yes = wishlist.some((x) => x.id === p.id);
    try {
      await onToggleWishlist?.(p);
      addToast(
        yes ? `${p.name} removed from wishlist` : `${p.name} added to wishlist`,
        "success",
      );
    } catch (error) {
      addToast(
        error.response?.data?.message || "Unable to update your wishlist.",
        "error",
      );
    }
  };
  const getColors = (p) =>
    [...new Map((p.variants || []).map((variant) => [variant.color?.id, variant.color])).values()].filter(Boolean);
  const card = (p) => (
    <article key={p.id} className="group min-w-0">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-100">
        <Link to={`/product/${p.id}`} className="block w-full h-full">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-semibold uppercase tracking-widest">
          {p.category}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => toggle(p)}
            className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-sm hover:scale-105 transition"
          >
            {wishlist.some((x) => x.id === p.id) ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
          </button>
        </div>
        {/* <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-16 group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => add(p)}
            disabled={addingId === p.id}
            className="flex-1 bg-black text-white rounded-full py-3 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <FaShoppingBag /> {addingId === p.id ? "Adding..." : "Add to bag"}
          </button>
          {showView && (
            <Link
              to={`/product/${p.id}`}
              className="w-12 rounded-full bg-white flex items-center justify-center"
            >
              <FiEye />
            </Link>
          )}
        </div> */}
      </div>
      <div className="pt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[.16em] text-neutral-400">
          <span>{p.brand?.name || "SHOP EDIT"}</span>
          {p.variants?.length > 0 && <span>{p.variants.length} sizes</span>}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-sm md:text-[15px] leading-snug line-clamp-2">
            {p.name}
          </h3>
          <p className="font-semibold text-sm shrink-0">
            ${Number(p.price).toFixed(2)}
          </p>
        </div>
        {getColors(p).length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-neutral-400">Colors</span>
            {getColors(p).slice(0, 5).map((color) => (
              <span
                key={color.id}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full border border-black/15"
                style={{ backgroundColor: color.hex_code || "#d4d4d4" }}
              />
            ))}
          </div>
        )}
        {/* <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={
                n <= Math.round(p.rating?.rate || 0)
                  ? "text-black"
                  : "text-neutral-300"
              }
            >
              ★
            </span>
          ))}
          <span className="ml-1">{p.rating?.rate || 0}</span>
        </div> */}
      </div>
    </article>
  );
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {layout === "horizontal" ? (
        <div className="overflow-x-auto no-scrollbar px-5 md:px-10 pb-4">
          <div className="flex gap-5 min-w-max">
            {products.map((p) => (
              <div className="w-60 md:w-72.5" key={p.id}>
                {card(p)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 px-5 md:px-10">
          {products.map(card)}
        </div>
      )}
    </>
  );
}
