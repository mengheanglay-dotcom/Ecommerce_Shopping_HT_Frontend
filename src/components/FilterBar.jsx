import { useState } from "react";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
export default function FilterBar({
  categories = [],
  setCategory,
  category,
  brands = [],
  brand = "",
  setBrand,
  search = "",
  setSearch,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-20 z-40 bg-[#fafafa]/95 backdrop-blur border-b border-black/5">
      <div className="px-5 md:px-10 py-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <FiSliders /> Filters
          </button>
          <label className="flex min-w-0 max-w-sm flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 focus-within:border-black">
            <FiSearch className="shrink-0 text-neutral-400" />
            <input
              value={search}
              onChange={(event) => setSearch?.(event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch?.("")}
                aria-label="Clear product search"
                className="shrink-0 text-neutral-400 hover:text-black"
              >
                <FiX />
              </button>
            )}
          </label>
          {brands.length > 0 && (
            <label className="hidden items-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm focus-within:border-black sm:flex">
              <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Brand
              </span>
              <select
                value={brand}
                onChange={(event) => setBrand?.(event.target.value)}
                className="max-w-32 bg-transparent text-sm outline-none"
                aria-label="Filter by brand"
              >
                <option value="">All brands</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="hidden max-w-[55%] gap-2 overflow-x-auto no-scrollbar md:flex">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${category === c ? "bg-black text-white" : "bg-white border border-black/10 hover:border-black"}`}
            >
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-neutral-400 sm:block">
          {search
            ? `Search: ${search}`
            : category === "all"
              ? "All products"
              : category}
        </span>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {brands.length > 0 && (
            <label className="flex shrink-0 items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">
              <span className="mr-2 text-neutral-400">Brand</span>
              <select
                value={brand}
                onChange={(event) => setBrand?.(event.target.value)}
                className="max-w-28 bg-transparent outline-none"
                aria-label="Filter by brand"
              >
                <option value="">All brands</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setOpen(false);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${category === c ? "bg-black text-white" : "bg-white border border-black/10"}`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
