import Link from "next/link";
import DropCard from "@/components/landing/DropCard";
import { SIDEBAR_BRANDS } from "@/data/drops";
import type { BrandFilter, DropItem } from "@/types/drop";

interface UpcomingDropsProps {
  items: DropItem[];
  activeBrand?: BrandFilter;
}

export default function UpcomingDrops({ items, activeBrand = "all" }: UpcomingDropsProps) {
  const brandLabel = SIDEBAR_BRANDS.find((brand) => brand.id === activeBrand)?.label;

  return (
    <section id="upcoming" className="px-4 py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          まもなく発売されるスニーカー
          {activeBrand !== "all" && brandLabel && (
            <span className="ml-2 text-drop-orange">· {brandLabel}</span>
          )}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-12 text-center text-sm text-slate-500">
          このブランドの発売予定はありません。左のサイドバーで別のブランドを選んでください。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <DropCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/vault"
          className="rounded-lg border border-slate-700 px-8 py-3 text-xs font-bold tracking-widest text-slate-300 uppercase transition-colors hover:border-slate-500 hover:text-white"
        >
          すべてのスニーカーを見る
        </Link>
      </div>
    </section>
  );
}
