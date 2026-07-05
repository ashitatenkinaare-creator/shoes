"use client";

import Link from "next/link";
import RadarProductImage from "@/components/radar/RadarProductImage";
import { ChevronRight, ExternalLink } from "lucide-react";
import WatchlistDeleteButton from "@/components/radar/watchlist/WatchlistDeleteButton";
import {
  formatDateJa,
  formatYen,
  getPhaseLabel,
  getPhaseStyle,
} from "@/lib/radar/format";
import type { SneakerRadarItem, WatchlistRemoveHandler } from "@/types/radar";

interface WatchlistCardProps {
  item: SneakerRadarItem;
  onRemove: WatchlistRemoveHandler;
}

export default function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-radar-border bg-radar-surface transition-colors hover:border-radar-accent/40">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/sneaker/${item.id}`}
          className="relative aspect-square w-full shrink-0 sm:w-36 md:w-40"
        >
          <RadarProductImage
            src={item.imageUrl}
            alt={item.modelName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 160px"
          />
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getPhaseStyle(item.phase)}`}
          >
            {getPhaseLabel(item.phase)}
          </span>
          {(item.isRare || item.isCollab) && (
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {item.isRare && (
                <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
                  レア
                </span>
              )}
              {item.isCollab && (
                <span className="rounded-full bg-violet-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  コラボ
                </span>
              )}
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold text-radar-accent">{item.brand}</p>
                <span className="rounded-full bg-radar-muted px-2 py-0.5 text-[10px] text-slate-400">
                  {item.categoryLabel}
                </span>
              </div>
              <Link href={`/sneaker/${item.id}`}>
                <h2 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-radar-accent">
                  {item.modelName}
                </h2>
              </Link>
            </div>
            <WatchlistDeleteButton
              modelName={item.modelName}
              sneakerId={item.id}
              onRemove={onRemove}
            />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-radar-muted/50 p-3 text-xs">
            <div>
              <dt className="text-slate-500">発表日</dt>
              <dd className="mt-0.5 font-medium text-slate-200">{formatDateJa(item.announceDate)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">発売日</dt>
              <dd className="mt-0.5 font-semibold text-white">{formatDateJa(item.releaseDate)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-lg font-black text-white">{formatYen(item.price)}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href={`/sneaker/${item.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-radar-border px-3 py-1.5 text-xs font-semibold text-radar-accent transition-colors hover:border-radar-accent/50 hover:bg-radar-accent/10"
              >
                詳細
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <a
                href={item.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-radar-border px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                ストア
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
