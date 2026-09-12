import { useEffect, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "NEW SEASON",
    title: "Everyday style, elevated.",
    text: "Clean silhouettes and effortless pieces made for your next chapter.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "WOMEN",
    title: "Make your look yours.",
    text: "Modern essentials designed to move with you.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "MEN",
    title: "Less noise. More style.",
    text: "Refined everyday pieces with a confident edge.",
  },
];
export default function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];
  return (
    <section className="relative mx-3 md:mx-8 overflow-hidden rounded-[28px] h-[540px] md:h-[650px] bg-neutral-200">
      <img
        src={s.image}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-7 md:px-16 flex items-center">
        <div className="max-w-xl text-white fade-up" key={i}>
          <p className="text-xs tracking-[.28em] font-semibold mb-5">
            {s.eyebrow}
          </p>
          <h1 className="text-5xl md:text-7xl leading-[.95] font-semibold tracking-[-.05em]">
            {s.title}
          </h1>
          <p className="mt-6 text-white/80 max-w-md leading-relaxed">
            {s.text}
          </p>
          <button
            onClick={() =>
              document
                .getElementById("trendy")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 inline-flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-full text-sm font-semibold hover:gap-5 transition-all"
          >
            Shop now <FiArrowRight />
          </button>
        </div>
      </div>
      <div className="absolute bottom-7 left-7 md:left-16 flex gap-2">
        {slides.map((_, x) => (
          <button
            key={x}
            onClick={() => setI(x)}
            className={`h-1.5 rounded-full transition-all ${i === x ? "w-10 bg-white" : "w-5 bg-white/40"}`}
          />
        ))}
      </div>
      <div className="absolute bottom-6 right-7 flex gap-2">
        <button
          onClick={() => setI((i - 1 + slides.length) % slides.length)}
          className="p-3 rounded-full bg-white/15 text-white backdrop-blur hover:bg-white hover:text-black transition"
        >
          <FiChevronLeft />
        </button>
        <button
          onClick={() => setI((i + 1) % slides.length)}
          className="p-3 rounded-full bg-white/15 text-white backdrop-blur hover:bg-white hover:text-black transition"
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}
