"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, BellOff, ChevronRight } from "lucide-react";
import {
  formatDateJa,
  formatYen,
  getPhaseLabel,
  getPhaseStyle,
} from "@/lib/radar/format";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { SneakerRadarItem } from "@/types/radar";

interface SneakerPickCardProps {
  item: SneakerRadarItem;
}

export default function SneakerPickCard({ item }: SneakerPickCardProps) {
  const { isWatched, toggle, ready } = useWatchlist();
  const watched = ready && isWatched(item.id);

  return (
    <article className="overflow-hidden rounded-2xl border border-radar-border bg-radar-surface transition-colors hover:border-radar-accent/40">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/sneaker/${item.id}`}
          className="relative aspect-square w-full shrink-0 sm:w-36 md:w-40"
        >
          <Image
            src={item.imageUrl}
            alt={item.modelName}
            fill
            className="object-cover"
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

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-radar-accent">{item.brand}</p>
              <Link href={`/sneaker/${item.id}`}>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white hover:text-radar-accent">
                  {item.modelName}
                </h3>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => void toggle(item.id)}
              disabled={!ready}
              aria-pressed={watched}
              aria-label={watched ? "ウォッチリストから外す" : "ウォッチリストに追加"}
              className={`btn-press shrink-0 rounded-full p-2 transition-colors disabled:opacity-50 ${
                watched
                  ? "bg-radar-accent/20 text-radar-accent"
                  : "bg-radar-muted text-slate-400 hover:text-white"
              }`}
            >
              {watched ? (
                <Bell className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BellOff className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
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

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.matchedReasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full bg-radar-muted px-2 py-0.5 text-[10px] text-slate-400"
              >
                {reason}
              </li>
            ))}
          </ul>

          <Link
            href={`/sneaker/${item.id}`}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-radar-accent hover:underline"
          >
            詳細を見る
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
