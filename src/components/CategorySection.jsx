import { Link } from "react-router-dom";
const categories = [
  {
    name: "Shoes",
    sub: "Step into the season",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    link: "/#trendy-shoe",
  },
  {
    name: "Women",
    sub: "Modern essentials",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80",
    link: "/women_product",
  },
  {
    name: "Men",
    sub: "Everyday refinement",
    image:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1000&q=80",
    link: "/men_product",
  },
];
export function CategorySection() {
  return (
    <section className="py-16 md:py-24 px-5 md:px-10">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
            SHOP BY CATEGORY
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            Find your direction.
          </h2>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link
            key={c.name}
            to={c.link}
            className="group relative h-[360px] overflow-hidden rounded-[22px]"
          >
            <img
              src={c.image}
              className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs tracking-widest text-white/70">{c.sub}</p>
              <h3 className="text-2xl font-semibold mt-1">{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
