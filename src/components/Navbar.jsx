import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { getProducts } from "../api/productApi";
import { getShopCart, getShopWishlist } from "../api/shopService";
import { getStoredUser } from "../api/authApi";

const readStoredArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(getStoredUser());
  const results = products.filter(
    (p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(p.category || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const refresh = async () => {
    try {
      const [cart, wishlist] = await Promise.all([
        getShopCart(),
        getShopWishlist(),
      ]);
      setCounts({
        cart: (cart || []).reduce(
          (n, x) => n + Number(x.qty || x.quantity || 1),
          0,
        ),
        wishlist: (wishlist || []).length,
      });
    } catch (e) {
      console.error("Unable to refresh cart/wishlist counts", e);
    }
    setUser(getStoredUser());
  };
  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("authchange", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("authchange", refresh);
    };
  }, []);

  const close = () => setMenuOpen(false);
  const MenuLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={close}
      className="block px-3 py-2.5 rounded-xl hover:bg-neutral-100 transition"
    >
      {children}
    </Link>
  );

  return (
    <>
      <div className="h-20" />
      <header className="fixed top-0 left-0 right-0 z-[9999] border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto h-20 px-5 md:px-8 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-black tracking-[-0.08em]"
          >
            SHOP
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-widest">
            <Link to="/" className="hover:text-neutral-500 transition">
              HOME
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-neutral-500">
                MEN <FiChevronDown />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="w-[360px] p-6 rounded-2xl bg-white shadow-2xl border border-black/5 grid grid-cols-2 gap-5 normal-case tracking-normal text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
                      Clothing
                    </p>
                    <MenuLink to="/Men_product">All</MenuLink>
                    <MenuLink to="/Men_product?category=shirt">Shirts</MenuLink>
                    <MenuLink to="/Men_product?category=hoodie">
                      Hoodies
                    </MenuLink>
                    <MenuLink to="/Men_product?category=pant">Pants</MenuLink>
                    <MenuLink to="/Men_product?category=short">Shorts</MenuLink>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
                      Shoes
                    </p>
                    <MenuLink to="/Men_product?category=Sneakers">
                      Sneakers
                    </MenuLink>
                    <MenuLink to="/Men_product?category=Sandals">
                      Sandals
                    </MenuLink>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-neutral-500">
                WOMEN <FiChevronDown />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="w-[360px] p-6 rounded-2xl bg-white shadow-2xl border border-black/5 grid grid-cols-2 gap-5 normal-case tracking-normal text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
                      Clothing
                    </p>
                    <MenuLink to="/Women_product">All</MenuLink>
                    <MenuLink to="/Women_product?category=dresses">
                      Dresses
                    </MenuLink>
                    <MenuLink to="/Women_product?category=hoodies">
                      Hoodies
                    </MenuLink>
                    <MenuLink to="/Women_product?category=jeans">
                      Jeans
                    </MenuLink>
                    <MenuLink to="/Women_product?category=shorts">
                      Shorts
                    </MenuLink>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
                      Shoes
                    </p>
                    <MenuLink to="/Women_product?category=sneakers">
                      Sneakers
                    </MenuLink>
                    <MenuLink to="/Women_product?category=sandals">
                      Sandals
                    </MenuLink>
                    <MenuLink to="/Women_product?category=heels">
                      Heels
                    </MenuLink>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/wishlist" className="hover:text-neutral-500">
              WISHLIST
            </Link>
          </nav>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="relative">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2.5 rounded-full hover:bg-neutral-100"
              >
                <FiSearch size={19} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-14 w-[min(90vw,360px)] p-4 rounded-2xl bg-white shadow-2xl border border-black/5">
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3">
                    <FiSearch className="text-neutral-400" />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full py-3 outline-none text-sm"
                    />
                  </div>
                  {search && (
                    <div className="mt-3 max-h-72 overflow-auto space-y-1">
                      {results.slice(0, 7).map((p) => (
                        <Link
                          onClick={() => setSearchOpen(false)}
                          key={p.id}
                          to={`/product/${p.id}`}
                          className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50"
                        >
                          <img
                            src={p.image}
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                          />
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              ${p.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {results.length === 0 && (
                        <p className="text-sm text-neutral-500 p-2">
                          No products found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-neutral-100"
            >
              <FiHeart size={19} />
              {counts.wishlist > 0 && <Badge value={counts.wishlist} />}
            </Link>
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-neutral-100"
            >
              <FiShoppingBag size={19} />
              {counts.cart > 0 && <Badge value={counts.cart} />}
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              className="hidden md:flex p-2.5 rounded-full hover:bg-neutral-100"
              title={user ? user.name || "Profile" : "Login"}
            >
              <FiUser size={19} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-full hover:bg-neutral-100"
            >
              <FiMenu size={21} />
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/30 lg:hidden"
          onClick={close}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-black tracking-[-0.08em] text-2xl">
                SHOP
              </span>
              <button
                onClick={close}
                className="p-2 rounded-full bg-neutral-100"
              >
                <FiX />
              </button>
            </div>
            <div className="space-y-2 text-sm font-semibold">
              <MenuLink to="/">HOME</MenuLink>
              <MenuLink to="/Men_product">MEN</MenuLink>
              <MenuLink to="/Women_product">WOMEN</MenuLink>
              <MenuLink to="/wishlist">WISHLIST</MenuLink>
              <MenuLink to="/cart">CART</MenuLink>
              {user ? (
                <>
                  <MenuLink to="/profile">PROFILE</MenuLink>
                  <MenuLink to="/orders">ORDERS</MenuLink>
                </>
              ) : (
                <>
                  <MenuLink to="/login">LOGIN</MenuLink>
                  <MenuLink to="/register">REGISTER</MenuLink>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
function Badge({ value }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[9px] flex items-center justify-center">
      {value}
    </span>
  );
}
