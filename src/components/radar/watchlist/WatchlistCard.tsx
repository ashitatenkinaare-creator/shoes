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
    <article className="overflow-hidden rounded-2xl border border-radar-border bg-radar-surface">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/sneaker/${item.id}`}
          className="relative aspect-square w-full shrink-0 sm:w-32 md:w-36"
        >
          <RadarProductImage
            src={item.imageUrl}
            alt={item.modelName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 144px"
          />
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getPhaseStyle(item.phase)}`}
          >
            {getPhaseLabel(item.phase)}
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-radar-accent">{item.brand}</p>
              <Link href={`/sneaker/${item.id}`}>
                <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white hover:text-radar-accent">
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

          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-500">発表日</dt>
              <dd className="font-medium text-slate-200">{formatDateJa(item.announceDate)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">発売日</dt>
              <dd className="font-medium text-slate-200">{formatDateJa(item.releaseDate)}</dd>
            </div>
          </dl>

          <p className="mt-2 text-sm font-bold text-white">{formatYen(item.price)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/sneaker/${item.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-radar-accent hover:underline"
            >
              詳細
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <a
              href={item.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
            >
              ストア
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
