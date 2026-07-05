"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, Cloud, LayoutList } from "lucide-react";
import WatchlistCard from "@/components/radar/watchlist/WatchlistCard";
import WatchlistEmptyState from "@/components/radar/watchlist/WatchlistEmptyState";
import { formatDateJa } from "@/lib/radar/format";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useWatchlist } from "@/hooks/useWatchlist";

function sortByReleaseDate<T extends { releaseDate: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
  );
}

export default function WatchlistView() {
  const { user } = useAuthSession();
  const { items, ready, error, remove } = useWatchlist();

  const sortedItems = useMemo(() => sortByReleaseDate(items), [items]);
  const nextRelease = sortedItems[0];

  if (!ready) {
    return (
      <div className="rounded-2xl border border-radar-border bg-radar-surface px-4 py-12 text-center text-sm text-slate-500">
        読み込み中...
      </div>
    );
  }

  return (
    <>
      <header className="mb-6 rounded-2xl border border-radar-border bg-gradient-to-br from-radar-surface to-radar-muted p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LayoutList className="h-5 w-5 text-radar-accent" aria-hidden="true" />
              <h1 className="text-xl font-black text-white lg:text-2xl">ウォッチリスト</h1>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              登録したモデルの発売通知を管理します
            </p>
          </div>
          <span
            className="shrink-0 rounded-full bg-radar-accent/15 px-4 py-1.5 text-sm font-bold text-radar-accent"
            aria-live="polite"
          >
            {items.length}件
          </span>
        </div>

        {nextRelease && (
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-radar-accent" aria-hidden="true" />
            次の発売:{" "}
            <span className="font-medium text-slate-200">{nextRelease.modelName}</span>
            <span className="text-slate-500">（{formatDateJa(nextRelease.releaseDate)}）</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Cloud className="h-3.5 w-3.5 text-radar-accent" aria-hidden="true" />
            {user ? (
              <>Supabase に保存中（{user.email}）</>
            ) : (
              <>ブラウザに保存（ログインすると Supabase と同期）</>
            )}
          </span>
          {items.length > 0 && (
            <Link
              href="/dashboard"
              className="font-semibold text-radar-accent hover:underline"
            >
              新作を追加する
            </Link>
          )}
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      {sortedItems.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sortedItems.map((item) => (
            <li key={item.id}>
              <WatchlistCard item={item} onRemove={remove} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
