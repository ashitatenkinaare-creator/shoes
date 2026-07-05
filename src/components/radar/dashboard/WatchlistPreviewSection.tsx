"use client";

import Link from "next/link";
import RadarProductImage from "@/components/radar/RadarProductImage";
import { ChevronRight } from "lucide-react";
import { formatDateJa, getPhaseLabel, getPhaseStyle } from "@/lib/radar/format";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistPreviewSection() {
  const { items, ready } = useWatchlist();

  return (
    <section aria-labelledby="watchlist-preview-heading" className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="watchlist-preview-heading" className="text-lg font-bold text-white">
          ウォッチリスト
        </h2>
        <Link
          href="/watchlist"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-radar-accent hover:underline"
        >
          すべて見る
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {!ready ? (
        <p className="rounded-2xl border border-radar-border px-4 py-6 text-center text-sm text-slate-500">
          読み込み中...
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-radar-border px-4 py-8 text-center text-sm text-slate-500">
          まだウォッチ中のモデルはありません
        </p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <li key={item.id} className="w-40 shrink-0">
              <Link
                href={`/sneaker/${item.id}`}
                className="block overflow-hidden rounded-xl border border-radar-border bg-radar-surface transition-colors hover:border-radar-accent/40"
              >
                <div className="relative aspect-square">
                  <RadarProductImage
                    src={item.imageUrl}
                    alt={item.modelName}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <span
                    className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${getPhaseStyle(item.phase)}`}
                  >
                    {getPhaseLabel(item.phase)}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[10px] font-semibold text-radar-accent">
                    {item.brand}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-white">
                    {item.modelName}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    発売 {formatDateJa(item.releaseDate)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
