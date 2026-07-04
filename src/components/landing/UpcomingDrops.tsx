import Link from "next/link";
import DropCard from "@/components/landing/DropCard";
import type { DropItem } from "@/types/drop";

interface UpcomingDropsProps {
  items: DropItem[];
}

const sortOptions = ["LATEST", "PRICE", "BRAND"];

export default function UpcomingDrops({ items }: UpcomingDropsProps) {
  return (
    <section id="upcoming" className="px-4 py-8 lg:px-10 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          Upcoming Drops
        </h2>
        <div className="flex gap-4 text-[10px] font-bold tracking-wider uppercase">
          {sortOptions.map((option, i) => (
            <button
              key={option}
              type="button"
              className={`transition-colors ${
                i === 0 ? "text-drop-orange" : "text-slate-500 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <DropCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/vault"
          className="rounded-lg border border-slate-700 px-8 py-3 text-xs font-bold tracking-widest text-slate-300 uppercase transition-colors hover:border-slate-500 hover:text-white"
        >
          View All Releases
        </Link>
      </div>
    </section>
  );
}
