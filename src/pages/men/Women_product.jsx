import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getBrands } from "../../api/brandApi";
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
  const brandFromURL = query.get("brand") || "";

  const [category, setCategory] = useState(categoryFromURL);
  const [brand, setBrand] = useState(brandFromURL);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [womenCategoryIds, setWomenCategoryIds] = useState([]);
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
    setBrand(brandFromURL);
  }, [categoryFromURL, brandFromURL]);

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
        const womenCategory = (categoryData || []).find(
          (item) => item.name.toLowerCase() === "women",
        );
        const womenChildren = womenCategory?.children || [];
        setWomenCategoryIds(womenChildren.map((item) => Number(item.id)));
        setCategoryOptions(
          womenChildren.map((item) => item.name).filter(Boolean),
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
    const belongsToWomen =
      womenCategoryIds.includes(productCategoryId) ||
      (!womenCategoryIds.length &&
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
      belongsToWomen &&
      matchesCategory &&
      matchesBrand &&
      (!query || searchableText.includes(query))
    );
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
              `/Women_product${params.toString() ? `?${params}` : ""}`,
            );
          }}
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
          {brand && (
            <>
              <span>/</span>
              <span className="text-black font-medium">
                Brand{" "}
                <button
                  type="button"
                  onClick={() => {
                    setBrand("");
                    window.history.replaceState(
                      {},
                      "",
                      `/Women_product${category !== "all" ? `?category=${encodeURIComponent(category)}` : ""}`,
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
