import type { Brand } from "../types/sneaker";
import { BRANDS } from "../data/sneakers";

interface BrandFilterProps {
  selectedBrand: Brand | null;
  onBrandChange: (brand: Brand | null) => void;
}

export default function BrandFilter({
  selectedBrand,
  onBrandChange,
}: BrandFilterProps) {
  return (
    <aside
      id="brands"
      className="rounded-2xl border border-border-dark bg-surface p-5 shadow-lg shadow-black/40 lg:sticky lg:top-36"
    >
      <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-neon">
        Brand Filter
      </h2>
      <p className="mb-5 text-sm text-zinc-400">ブランドで絞り込み</p>

      <div className="flex flex-wrap gap-2 lg:flex-col">
        <button
          type="button"
          onClick={() => onBrandChange(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedBrand === null
              ? "bg-neon text-black shadow-md shadow-neon/20"
              : "border border-border-dark bg-surface-light text-zinc-300 hover:border-neon/50 hover:text-white"
          }`}
        >
          すべて
        </button>
        {BRANDS.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => onBrandChange(brand)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedBrand === brand
                ? "bg-neon text-black shadow-md shadow-neon/20"
                : "border border-border-dark bg-surface-light text-zinc-300 hover:border-neon/50 hover:text-white"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </aside>
  );
}
