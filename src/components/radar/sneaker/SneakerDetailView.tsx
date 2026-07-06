"use client";

import Link from "next/link";
import RadarProductImage from "@/components/radar/RadarProductImage";
import { resolveOfficialLink, isGenericBrandHubUrl } from "@/lib/radar/sneaker-links";
import { hasSnkrsProductLotteryUrl } from "@/lib/radar/catalog-dashboard-filter";
import { ArrowLeft, Bell, BellOff, ExternalLink, Megaphone, Ticket } from "lucide-react";
import { formatDateJa, formatYen, getPhaseLabel, getPhaseStyle } from "@/lib/radar/format";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { SneakerRadarDetail } from "@/types/radar";

interface SneakerDetailViewProps {
  sneaker: SneakerRadarDetail;
}

export default function SneakerDetailView({ sneaker }: SneakerDetailViewProps) {
  const { isWatched, toggle, ready } = useWatchlist();
  const watched = ready && isWatched(sneaker.id);
  const officialLink = resolveOfficialLink(
    {
      newsUrl: sneaker.newsUrl,
      lotteryUrl: sneaker.lotteryUrl,
      brand: sneaker.brand,
      modelName: sneaker.modelName,
    },
    { allowBrandFallback: false },
  );
  const hasProductLotteryPage =
    Boolean(sneaker.lotteryUrl) &&
    !isGenericBrandHubUrl(sneaker.lotteryUrl) &&
    hasSnkrsProductLotteryUrl(sneaker.lotteryUrl);

  return (
    <article>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-radar-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        ダッシュボードに戻る
      </Link>

      <div className="overflow-hidden rounded-2xl border border-radar-border bg-radar-surface">
        <div className="relative aspect-square w-full sm:aspect-[16/10]">
          <RadarProductImage
            src={sneaker.imageUrl}
            alt={sneaker.modelName}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 896px"
          />
          <span
            className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold ${getPhaseStyle(sneaker.phase)}`}
          >
            {getPhaseLabel(sneaker.phase)}
          </span>
        </div>

        <div className="p-5 lg:p-6">
          <p className="text-sm font-semibold text-radar-accent">{sneaker.brand}</p>
          <h1 className="mt-2 text-xl font-black leading-snug text-white sm:text-2xl">
            {sneaker.modelName}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{sneaker.description}</p>

          <p className="mt-5 text-2xl font-black text-white">{formatYen(sneaker.price)}</p>

          <dl className="mt-6 grid gap-3 border-t border-radar-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">発表日</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">
                {formatDateJa(sneaker.announceDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">発売日</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">
                {formatDateJa(sneaker.releaseDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">カラーウェイ</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">{sneaker.colorway}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">SKU</dt>
              <dd className="mt-0.5 text-sm font-medium text-white">{sneaker.sku}</dd>
            </div>
          </dl>

          <ul className="mt-5 flex flex-wrap gap-2">
            {sneaker.matchedReasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full bg-radar-muted px-2.5 py-1 text-[11px] text-slate-400"
              >
                {reason}
              </li>
            ))}
          </ul>

          <section className="mt-6 rounded-xl border border-radar-border bg-radar-muted/50 p-4">
            <h2 className="text-xs font-bold tracking-wide text-slate-400 uppercase">2段階通知</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 shrink-0 text-radar-accent" aria-hidden="true" />
                第1弾 — 公式発表（ニュースリリース解禁）
              </li>
              <li className="flex items-center gap-2">
                <Ticket className="h-4 w-4 shrink-0 text-radar-accent" aria-hidden="true" />
                第2弾 — 販売・抽選ページ開設（エントリー URL 公開）
              </li>
              {hasProductLotteryPage && (
                <li className="flex items-center gap-2 text-radar-accent">
                  <Ticket className="h-4 w-4 shrink-0" aria-hidden="true" />
                  抽選ページ公開済み — 下のボタンからエントリーできます
                </li>
              )}
            </ul>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void toggle(sneaker.id)}
              disabled={!ready}
              aria-pressed={watched}
              className={`btn-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 ${
                watched
                  ? "border-radar-accent bg-radar-accent/15 text-radar-accent"
                  : "border-radar-border bg-radar-surface text-slate-200 hover:border-radar-accent/50"
              }`}
            >
              {watched ? (
                <Bell className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BellOff className="h-4 w-4" aria-hidden="true" />
              )}
              {watched ? "ウォッチ中" : "ウォッチリストに追加"}
            </button>

            {officialLink ? (
              <a
                href={officialLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-radar-accent px-4 py-3 text-sm font-bold text-radar-bg transition-colors hover:bg-radar-accent-hover"
              >
                {officialLink.label}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-dashed border-radar-border px-4 py-3 text-center text-xs text-slate-500">
                公式ページ URL は未公開です。ウォッチリスト登録で通知を受け取れます。
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
