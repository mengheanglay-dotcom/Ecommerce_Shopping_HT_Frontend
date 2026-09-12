import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiSend } from "react-icons/fi";
export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white mt-20">
      <div className="px-5 md:px-10 py-14 md:py-20 max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-black tracking-[-.08em]">
              SHOP
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mt-5">
              A modern front-end shopping experience for discovering everyday
              fashion, footwear and essentials.
            </p>
          </div>
          <div>
            <h3 className="text-xs tracking-widest text-white/40 font-semibold mb-4">
              SHOP
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <Link className="block hover:text-white" to="/Men_product">
                Men
              </Link>
              <Link className="block hover:text-white" to="/Women_product">
                Women
              </Link>
              <Link className="block hover:text-white" to="/wishlist">
                Wishlist
              </Link>
              <Link className="block hover:text-white" to="/cart">
                Cart
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-widest text-white/40 font-semibold mb-4">
              CONNECT
            </h3>
            <div className="flex gap-3">
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FiInstagram />
              </span>
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FiFacebook />
              </span>
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FiSend />
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 text-xs text-white/35">
          © {new Date().getFullYear()} SHOP. Front-end demo.
        </div>
      </div>
    </footer>
  );
}
