import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { Link, useLocation } from "react-router-dom";
import FilterBar from "../../components/FilterBar";
import ProductCard from "../../components/ProductCard";
import {
  getShopWishlist,
  toggleShopWishlist,
  addShopCart,
} from "../../api/shopService";

function MenProduct() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const queryCategory = new URLSearchParams(location.search).get("category");
    setCategory(queryCategory || "all");
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [data, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(data || []);
        const menCategory = (categoryData || []).find(
          (item) => item.name.toLowerCase() === "men",
        );
        setCategoryOptions(
          [
            menCategory?.name,
            ...(menCategory?.children || []).map((item) => item.name),
          ].filter(Boolean),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "all",
    ...new Set([
      ...categoryOptions,
      ...products.map((product) => product.category),
    ]),
  ];
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "all" ||
      product.category.toLowerCase() === category.toLowerCase();
    const query = search.trim().toLowerCase();
    const searchableText = [
      product.name,
      product.code,
      product.category,
      product.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesCategory && (!query || searchableText.includes(query));
  });

  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    getShopWishlist().then(setWishlist).catch(console.error);
  }, []);
  const toggleWishlist = async (product) => {
    const next = await toggleShopWishlist(
      product,
      wishlist.some((x) => x.id === product.id),
    );
    setWishlist(next || []);
    window.dispatchEvent(new Event("storage"));
  };
  const addToCart = async (product) => {
    await addShopCart(product);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="men_product mt-20">
      <div className="px-5 pb-8 pt-10 md:px-10">
        <p className="text-xs font-semibold tracking-[.25em] text-neutral-400">
          SHOP COLLECTION
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] md:text-6xl">
          Men
        </h1>
        <p className="mt-3 text-neutral-500">Everyday essentials, refined.</p>
      </div>
      <FilterBar
        categories={categories}
        setCategory={setCategory}
        category={category}
        search={search}
        setSearch={setSearch}
      />
      <div className="px-6 py-10 text-sm text-gray-500 md:px-10">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-black">Men</span>
        {category !== "all" && (
          <>
            <span className="mx-2">/</span>
            <span className="font-medium text-black">{category}</span>
          </>
        )}
      </div>
      {loading ? (
        <p className="px-5 text-center text-neutral-500">Loading products...</p>
      ) : filteredProducts.length ? (
        <ProductCard
          products={filteredProducts}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
        />
      ) : (
        <p className="px-5 py-16 text-center text-neutral-500">
          No products match your search.
        </p>
      )}
    </div>
  );
}
export default MenProduct;
