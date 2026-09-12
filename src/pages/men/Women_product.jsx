import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import FilterBar from "../../components/FilterBar";
import ProductCard from "../../components/ProductCard";
import {
  getShopWishlist,
  toggleShopWishlist,
  addShopCart,
} from "../../api/shopService";

function Women_product() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const categoryFromURL = query.get("category") || "all";

  const [category, setCategory] = useState(categoryFromURL);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    getShopWishlist().then(setWishlist).catch(console.error);
  }, []);

  const toggleWishlist = async (product) => {
    const next = await toggleShopWishlist(
      product,
      wishlist.some((item) => item.id === product.id),
    );
    setWishlist(next || []);
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = async (product) => {
    await addShopCart(product);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    setCategory(categoryFromURL);
  }, [categoryFromURL]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [data, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(data || []);
        const womenCategory = (categoryData || []).find(
          (item) => item.name.toLowerCase() === "women",
        );
        setCategoryOptions(
          [
            womenCategory?.name,
            ...(womenCategory?.children || []).map((item) => item.name),
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
    ...new Set([...categoryOptions, ...products.map((p) => p.category)]),
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

  return (
    <div className="women_product">
      <div className="px-5 md:px-10 pt-10 pb-8">
        <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
          SHOP COLLECTION
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-[-.05em] mt-2">
          Women
        </h1>
        <p className="text-neutral-500 mt-3">Modern pieces for every moment.</p>
      </div>
      <div className="">
        <FilterBar
          categories={categories}
          setCategory={setCategory}
          category={category}
          search={search}
          setSearch={setSearch}
        />
      </div>

      <div className="py-12.5 px-6 md:px-10" id="trendy">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-black transition">
            Home
          </a>
          <span>/</span>
          <span className="text-black font-medium">Women</span>
          {category !== "all" && (
            <>
              <span>/</span>
              <span className="text-black font-medium">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </>
          )}
        </div>
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

export default Women_product;
