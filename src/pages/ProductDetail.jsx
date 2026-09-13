import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, getProducts } from "../api/productApi";
import {
  getShopWishlist,
  toggleShopWishlist,
  addShopCart,
} from "../api/shopService";
import { FaHeart, FaRegHeart, FaShippingFast } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";
import { ToastContainer, useToast } from "../components/Toast";
import ProductCard from "../components/ProductCard";

// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Men_Product } from "../data/men_product";
// import { Women_Product } from "../data/women_product";
// import { Link } from "react-router-dom";
// import { FaHeart, FaRegHeart, FaShippingFast } from "react-icons/fa";
// import { MdOutlinePayment } from "react-icons/md";
// import { ToastContainer, useToast } from "../components/Toast";

// function ProductDetail() {
//   const [wishlist, setWishlist] = useState(
//     JSON.parse(localStorage.getItem("wishlist")) || [],
//   );
//   const { toasts, addToast, removeToast } = useToast();

//   const toggleWishlist = (product) => {
//     let updated;
//     const exists = wishlist.find((item) => item.id === product.id);

//     if (exists) {
//       updated = wishlist.filter((item) => item.id !== product.id);
//       addToast(`${product.name} removed from wishlist!`, "success");
//     } else {
//       updated = [...wishlist, product];
//       addToast(`${product.name} added to wishlist! ❤️`, "success");
//     }

//     setWishlist(updated);
//     localStorage.setItem("wishlist", JSON.stringify(updated));
//   };

//   const addToCart = (product, qty, size) => {
//     let cart = JSON.parse(localStorage.getItem("cart")) || [];

//     const existing = cart.find(
//       (item) => item.id === product.id && item.size === size,
//     );

//     if (existing) {
//       existing.qty += qty;
//     } else {
//       cart.push({
//         ...product,
//         qty,
//         size,
//       });
//     }

//     localStorage.setItem("cart", JSON.stringify(cart));
//   };

//   const { id } = useParams();

//   const allProducts = [...Men_Product, ...Women_Product];
//   const product = allProducts.find((p) => p.id === parseInt(id));

//   const [selectedSize, setSelectedSize] = useState("M");
//   const [qty, setQty] = useState(1);
//   const [mainImage, setMainImage] = useState(product?.image);

//   if (!product) return <h1 className="text-center mt-20">Product not found</h1>;

//   // similar items (same category, not same id)
//   const similar = allProducts
//     .filter(
//       (item) => item.category === product.category && item.id !== product.id,
//     )
//     .sort(() => 0.5 - Math.random())
//     .slice(0, 4);

//   useEffect(() => {
//     setMainImage(product.image);
//   }, [product]);

//   return (
//     <>
//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//       <div className="max-w-7xl mx-auto px-6 py-10 mt-20">
//         {/* MAIN */}
//         <div className="grid md:grid-cols-2 gap-10">
//           {/* LEFT - IMAGE */}
//           <div className="flex gap-4">
//             {/* Thumbnails */}
//             <div className="flex flex-col gap-3">
//               {[product.image, product.image, product.image].map((img, i) => (
//                 <img
//                   key={i}
//                   src={img}
//                   onClick={() => setMainImage(img)}
//                   className={`w-16 h-16 object-cover border cursor-pointer
//                                     ${mainImage === img ? "border-black" : ""}`}
//                 />
//               ))}
//             </div>

//             {/* Main Image with Zoom */}
//             <div className="flex-1 overflow-hidden rounded-lg">
//               <img
//                 src={mainImage}
//                 className="w-full transition-transform duration-300 hover:scale-125 cursor-zoom-in"
//               />
//             </div>
//           </div>

//           {/* RIGHT - INFO */}
//           <div>
//             <h1 className="text-2xl font-semibold">{product.name}</h1>
//             <p className="text-gray-500 mt-2">{product.category}</p>
//             <p className="text-xl font-bold mt-4">${product.price}</p>

//             {/* SIZE */}
//             <div className="mt-6">
//               <h3 className="font-medium mb-2">Size</h3>
//               <div className="flex gap-3">
//                 {["S", "M", "L", "XL"].map((size) => (
//                   <button
//                     key={size}
//                     onClick={() => setSelectedSize(size)}
//                     className={`px-4 py-2 border rounded
//                                         ${selectedSize === size ? "bg-black text-white" : ""}`}
//                   >
//                     {size}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* QUANTITY */}
//             <div className="mt-6">
//               <h3 className="font-medium mb-2">Quantity</h3>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
//                   className="px-3 py-1 border"
//                 >
//                   −
//                 </button>
//                 <span>{qty}</span>
//                 <button
//                   onClick={() => setQty(qty + 1)}
//                   className="px-3 py-1 border"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             {/* ADD TO CART */}
//             <div className="flex gap-2">
//               <button
//                 onClick={() => {
//                   addToCart(product, qty, selectedSize);
//                   addToast(
//                     `${product.name} (Size: ${selectedSize}, Qty: ${qty}) added to bag! 🛒`,
//                     "success",
//                   );
//                 }}
//                 className="mt-6 w-full bg-black text-white py-3 rounded-lg"
//               >
//                 Add to bag
//               </button>
//               <button
//                 onClick={() => toggleWishlist(product)}
//                 className="mt-6 px-4 py-2 text-2xl border rounded-lg"
//               >
//                 {wishlist.find((item) => item.id === product.id) ? (
//                   <FaHeart className="text-red-500" />
//                 ) : (
//                   <FaRegHeart />
//                 )}
//               </button>
//             </div>

//             {/* EXTRA INFO */}
//             <div className="mt-6 text-lg text-gray-600 space-y-2">
//               <p className="flex items-center gap-2">
//                 <FaShippingFast /> Fast delivery (1–3 days)
//               </p>
//               <p className="flex items-center gap-2">
//                 <MdOutlinePayment /> Easy payment
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* SIMILAR ITEMS */}
//         <div className="mt-16">
//           <h2 className="text-xl font-semibold mb-6">SIMILAR ITEMS</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {similar.map((item) => (
//               <Link key={item.id} to={`/product/${item.id}`} className="group">
//                 <div className="bg-gray-100 rounded-lg overflow-hidden">
//                   <img
//                     src={item.image}
//                     className="w-full h-[250px] object-cover group-hover:scale-105 transition"
//                   />
//                 </div>
//                 <div className="mt-2">
//                   <h3 className="text-sm font-medium">{item.name}</h3>
//                   <p className="text-gray-500 text-sm">${item.price}</p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    getShopWishlist().then(setWishlist).catch(console.error);
  }, []);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const { toasts, addToast, removeToast } = useToast();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load this product.");
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.variants?.length) {
      const firstVariant = product.variants[0];
      setSelectedSize(firstVariant.size?.name || "M");
      setSelectedColor(firstVariant.color?.name || "");
    }
  }, [product]);

  useEffect(() => {
    if (!product) return undefined;
    let active = true;
    getProducts()
      .then((products) => {
        const related = products
          .filter((item) => item.id !== product.id)
          .map((item) => ({
            item,
            score:
              (item.category_id === product.category_id ? 2 : 0) +
              (item.brand_id === product.brand_id ? 1 : 0),
          }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(({ item }) => item);
        if (active) setRelatedProducts(related);
      })
      .catch((error) =>
        console.error("Unable to load related products:", error),
      );
    return () => {
      active = false;
    };
  }, [product]);

  const toggleWishlist = async (productToToggle = product) => {
    try {
      const exists = wishlist.some((item) => item.id === productToToggle.id);
      const next = await toggleShopWishlist(productToToggle, exists);
      setWishlist(next || []);
      addToast(
        exists ? "Removed from wishlist" : "Added to wishlist",
        "success",
      );
    } catch (error) {
      addToast(
        error.response?.data?.message || error.message || "Unable to update wishlist.",
        "error",
      );
    }
  };

  const addRelatedToCart = async (relatedProduct) => {
    await addShopCart(relatedProduct);
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = async () => {
    try {
      const cartItem = {
        ...product,
        price: Number(selectedVariant?.price ?? product.price ?? 0),
        category,
        size: selectedVariant?.size?.name || selectedSize,
        color: selectedVariant?.color?.name || selectedColor,
        sku: selectedVariant?.sku,
        variant_id: selectedVariant?.id,
        stock: selectedVariant?.stock,
        image: selectedVariant?.image || product.image,
      };
      await addShopCart(cartItem, quantity, cartItem.size);
      window.dispatchEvent(new Event("storage"));
      navigate("/cart");
    } catch (error) {
      addToast(
        error.response?.data?.message || error.message || "Unable to add this product to your bag.",
        "error",
      );
    }
  };

  if (!product) {
    return <p className="mt-32 text-center">{error || "Loading product..."}</p>;
  }

  const category = product.category?.name || product.category || "Product";
  const catalogPath =
    product.gender?.toLowerCase() === "women" ||
    Number(product.category?.parent_id) === 5
      ? "/Women_product"
      : "/Men_product";
  const variants = product.variants || [];
  const colors = [
    ...new Map(
      variants
        .map((variant) => [variant.color?.id, variant.color])
        .filter(([, color]) => color),
    ).values(),
  ];
  const sizes = [
    ...new Map(
      variants
        .map((variant) => [variant.size?.id, variant.size])
        .filter(([, size]) => size),
    ).values(),
  ];
  const selectedVariant =
    variants.find(
      (variant) =>
        variant.size?.name === selectedSize &&
        variant.color?.name === selectedColor,
    ) ||
    variants.find((variant) => variant.color?.name === selectedColor) ||
    variants.find((variant) => variant.size?.name === selectedSize) ||
    variants[0];
  const selectColor = (colorName) => {
    const matchingVariant = variants.find(
      (variant) =>
        variant.color?.name === colorName &&
        variant.size?.name === selectedSize,
    ) || variants.find((variant) => variant.color?.name === colorName);
    setSelectedColor(matchingVariant?.color?.name || colorName);
    if (matchingVariant?.size?.name) setSelectedSize(matchingVariant.size.name);
    if (matchingVariant?.stock !== undefined)
      setQuantity((current) =>
        Math.min(current, Math.max(0, Number(matchingVariant.stock))),
      );
  };
  const selectSize = (sizeName) => {
    const matchingVariant = variants.find(
      (variant) =>
        variant.size?.name === sizeName &&
        variant.color?.name === selectedColor,
    ) || variants.find((variant) => variant.size?.name === sizeName);
    setSelectedSize(matchingVariant?.size?.name || sizeName);
    if (matchingVariant?.color?.name) setSelectedColor(matchingVariant.color.name);
    if (matchingVariant?.stock !== undefined)
      setQuantity((current) =>
        Math.min(current, Math.max(0, Number(matchingVariant.stock))),
      );
  };
  const price = Number(selectedVariant?.price ?? product.price ?? 0);
  const stock = Number(selectedVariant?.stock);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <main className="mx-auto mt-20 max-w-7xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-neutral-100">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-4/5 h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              {product.brand?.logo && (
                <img
                  src={product.brand.logo}
                  alt=""
                  className="h-6 w-12 object-contain"
                />
              )}
              {product.brand?.id ? (
                <Link
                  to={`${catalogPath}?brand=${encodeURIComponent(product.brand.id)}`}
                  className="hover:text-black hover:underline"
                >
                  {product.brand.name}
                </Link>
              ) : (
                <span>{product.brand?.name || "SHOP EDIT"}</span>
              )}
              <span className="text-neutral-300">/</span>
              <span>{category}</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-4 text-2xl font-bold">${price.toFixed(2)}</p>
            {product.code && (
              <p className="mt-2 text-xs uppercase tracking-[.2em] text-neutral-400">
                {product.code}
              </p>
            )}
            {product.description && (
              <p className="mt-5 max-w-xl leading-relaxed text-neutral-600">
                {product.description}
              </p>
            )}

            {colors.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 font-medium">
                  Color{" "}
                  <span className="text-neutral-400">{selectedColor}</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      title={color.name}
                      onClick={() => selectColor(color.name)}
                      className={`h-9 w-9 rounded-full border-2 p-1 ${selectedColor === color.name ? "border-black" : "border-transparent"}`}
                    >
                      <span
                        className="block h-full w-full rounded-full border border-black/15"
                        style={{ backgroundColor: color.hex_code || "#d4d4d4" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="mb-3 font-medium">Size</h2>
              <div className="flex gap-3">
                {(sizes.length
                  ? sizes.map((size) => size.name)
                  : ["S", "M", "L", "XL"]
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() => selectSize(size)}
                    disabled={Boolean(
                      variants.length &&
                      !variants.some((variant) => variant.size?.name === size),
                    )}
                    className={`border px-4 py-2 ${selectedSize === size ? "bg-black text-white" : ""} disabled:cursor-not-allowed disabled:opacity-30`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <h2 className="font-medium">Quantity</h2>
              <div className="flex items-center gap-4 border px-3 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <span>
                  {quantity}
                  {Number.isFinite(stock) && stock > 0 && `/${stock}`}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Number.isFinite(stock)
                        ? Math.min(stock, quantity + 1)
                        : quantity + 1,
                    )
                  }
                  disabled={Number.isFinite(stock) && (stock <= 0 || quantity >= stock)}
                  className="disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
              {Number.isFinite(stock) && (
                <span
                  className={`text-sm ${stock > 0 ? "text-neutral-500" : "text-red-500"}`}
                >
                  {stock > 0 ? `${stock} available` : "Out of stock"}
                </span>
              )}
            </div>

            <div className="mt-8 flex gap-2">
              <button
                onClick={addToCart}
                disabled={stock === 0}
                className="w-full bg-black py-3 text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                Add to bag
              </button>
              <button onClick={toggleWishlist} className="border px-4 text-2xl">
                {isWishlisted ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
              </button>
            </div>

            {selectedVariant?.sku && (
              <div className="mt-6 border-t border-black/10 pt-5 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>SKU</span>
                  <span>{selectedVariant.sku}</span>
                </div>
                {selectedVariant.size?.name && (
                  <div className="mt-2 flex justify-between">
                    <span>Selected size</span>
                    <span>{selectedVariant.size.name}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 space-y-3 text-neutral-600">
              <p className="flex items-center gap-2">
                <FaShippingFast /> Fast delivery (1-3 days)
              </p>
              <p className="flex items-center gap-2">
                <MdOutlinePayment /> Easy payment
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="group relative mt-10 inline-flex items-center gap-3 border border-black bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-black hover:text-neutral-100"
        >
          <span>← Continue shopping</span>
        </Link>

        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-black/10 pt-12">
            <div className="mb-8 flex items-end justify-between gap-4 px-5 md:px-0">
              <div>
                <p className="text-xs font-semibold tracking-[.25em] text-neutral-400">
                  COMPLETE THE EDIT
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  You may also like
                </h2>
              </div>
              <span className="hidden text-sm text-neutral-400 sm:block">
                Curated from this collection
              </span>
            </div>
            <ProductCard
              products={relatedProducts}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addRelatedToCart}
            />
          </section>
        )}
      </main>
    </>
  );
}

export default ProductDetail;
