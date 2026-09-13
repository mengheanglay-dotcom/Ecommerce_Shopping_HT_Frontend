import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getBrands } from "../../api/brandApi";
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
  const [brands, setBrands] = useState([]);
  const [menCategoryIds, setMenCategoryIds] = useState([]);
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const queryCategory = new URLSearchParams(location.search).get("category");
    const queryBrand = new URLSearchParams(location.search).get("brand");
    setCategory(queryCategory || "all");
    setBrand(queryBrand || "");
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [data, categoryData, brandData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
        ]);
        setProducts(data || []);
        setBrands(Array.isArray(brandData) ? brandData : []);
        const menCategory = (categoryData || []).find(
          (item) => item.name.toLowerCase() === "men",
        );
        const menChildren = menCategory?.children || [];
        setMenCategoryIds(menChildren.map((item) => Number(item.id)));
        setCategoryOptions(
          menChildren.map((item) => item.name).filter(Boolean),
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
    ...new Set(categoryOptions),
  ];
  const filteredProducts = products.filter((product) => {
    const productCategoryId = Number(
      product.category_id || product.category?.id,
    );
    const belongsToMen =
      menCategoryIds.includes(productCategoryId) ||
      (!menCategoryIds.length &&
        categoryOptions.some(
          (name) =>
            String(product.category?.name || product.category || "")
              .toLowerCase() === name.toLowerCase(),
        ));
    const matchesCategory =
      category === "all" ||
      product.category.toLowerCase() === category.toLowerCase();
    const matchesBrand =
      !brand ||
      String(product.brand_id || product.brand?.id) === brand ||
      String(product.brand?.name || "").toLowerCase() === brand.toLowerCase();
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
    return (
      belongsToMen &&
      matchesCategory &&
      matchesBrand &&
      (!query || searchableText.includes(query))
    );
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
        brands={brands}
        brand={brand}
        setBrand={(value) => {
          setBrand(value);
          const params = new URLSearchParams(location.search);
          if (value) params.set("brand", value);
          else params.delete("brand");
          window.history.replaceState(
            {},
            "",
            `/Men_product${params.toString() ? `?${params}` : ""}`,
          );
        }}
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
        {brand && (
          <>
            <span className="mx-2">/</span>
            <span className="font-medium text-black">
              Brand{" "}
              <button
                type="button"
                onClick={() => {
                  setBrand("");
                  window.history.replaceState(
                    {},
                    "",
                    `/Men_product${category !== "all" ? `?category=${encodeURIComponent(category)}` : ""}`,
                  );
                }}
                className="ml-1 text-xs text-neutral-500 underline"
              >
                Clear
              </button>
            </span>
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
