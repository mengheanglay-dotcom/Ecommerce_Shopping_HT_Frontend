import { useEffect, useState } from "react";
import { getBrands } from "../api/brandApi";
import { getProducts } from "../api/productApi";
import { useLocation, Link } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import { CategorySection } from "../components/CategorySection";
import ProductCard from "../components/ProductCard";
import { Men_Product } from "../data/men_product";
import { Women_Product } from "../data/women_product";
import {
  getShopWishlist,
  toggleShopWishlist,
  addShopCart,
} from "../api/shopService";
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";

export default function Home() {
  const location = useLocation(),
    all = [...Men_Product, ...Women_Product];
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    getShopWishlist().then(setWishlist).catch(console.error);
  }, []);
  const [products, setProducts] = useState([]),
    [shoes, setShoes] = useState([]);
  const [apiBrands, setApiBrands] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const toggleWishlist = async (p) => {
    const next = await toggleShopWishlist(
      p,
      wishlist.some((x) => x.id === p.id),
    );
    setWishlist(next || []);
    window.dispatchEvent(new Event("storage"));
  };
  const addToCart = async (p) => {
    await addShopCart(p);
    window.dispatchEvent(new Event("storage"));
  };
  useEffect(() => {
    setProducts([...all].sort(() => Math.random() - 0.5).slice(0, 8));
    setShoes(
      all
        .filter((p) => /shoe|sneaker|heel|sandal/i.test(p.category))
        .sort(() => Math.random() - 0.5)
        .slice(0, 8),
    );
  }, []);
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [brands, fetchedProducts] = await Promise.all([
          getBrands(),
          getProducts(),
        ]);
        setApiBrands(brands || []);
        setApiProducts(fetchedProducts || []);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setApiLoading(false);
      }
    };

    fetchHomeData();
  }, []);
  useEffect(() => {
    if (location.hash)
      document
        .querySelector(location.hash)
        ?.scrollIntoView({ behavior: "smooth" });
  }, [location]);
  return (
    <main>
      <HeroCarousel />
      <CategorySection />
      {!apiLoading && apiBrands.length > 0 && (
        <section className="border-y border-black/5 bg-white px-5 py-10 md:px-10 md:py-14">
          <SectionTitle
            eyebrow="OUR BRANDS"
            title="Shop your favorite brands"
            link="/Men_product"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {apiBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/Men_product?brand=${encodeURIComponent(brand.id)}`}
                className="flex h-36 items-center justify-center rounded-2xl border border-black/10 bg-neutral-50 p-5"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
      {!apiLoading && apiProducts.length > 0 && (
        <section className="py-10 md:py-16">
          <SectionTitle
            eyebrow="FROM OUR CATALOG"
            title="Latest products"
            link="/Men_product"
          />
          <ProductCard
            products={apiProducts}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />
        </section>
      )}
      {/* <section id="trendy" className="py-10 md:py-16">
        <SectionTitle
          eyebrow="JUST IN"
          title="Trendy products"
          link="/Men_product"
        />
        <ProductCard
          products={products}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
        />
      </section>
      <section id="trendy-shoe" className="py-10 md:py-16 bg-white">
        <SectionTitle
          eyebrow="STEP INTO STYLE"
          title="Trending shoes"
          link="/Men_product?category=Sneakers"
        />
        <ProductCard
          products={shoes}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          layout="horizontal"
        />
      </section> */}
      <section className="px-5 md:px-10 py-16">
        <div className="rounded-[28px] bg-neutral-900 p-8 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs tracking-[.25em] text-white/50 font-semibold">
              SHOP WITH CONFIDENCE
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3 text-white ">
              Good style. Simple experience.
            </h2>
          </div>
          <Link
            to="/Men_product"
            className="inline-flex items-center gap-3 bg-white px-6 py-3.5 rounded-full font-semibold text-sm w-fit"
          >
            Explore collection <FiArrowRight />
          </Link>
        </div>
      </section>
      <section className="border-y border-black/5 bg-white px-5 md:px-10 py-8 grid md:grid-cols-3 gap-6">
        {[
          [FiTruck, "Fast delivery", "Get your order moving quickly."],
          [FiShield, "Secure checkout", "A clean and simple shopping flow."],
          [
            FiRefreshCw,
            "Easy returns",
            "Shop with confidence and flexibility.",
          ],
        ].map(([Icon, t, d]) => (
          <div key={t} className="flex gap-4 items-center">
            <span className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center">
              <Icon />
            </span>
            <div>
              <h3 className="font-semibold text-sm">{t}</h3>
              <p className="text-xs text-neutral-500 mt-1">{d}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title, link }) {
  return (
    <div className="px-5 md:px-10 mb-8 flex items-end justify-between">
      <div>
        <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-.04em] mt-2 capitalize">
          {title}
        </h2>
      </div>
      <Link
        to={link}
        className="hidden sm:flex items-center gap-2 text-sm font-semibold border-b border-black pb-1"
      >
        View all <FiArrowRight />
      </Link>
    </div>
  );
}
