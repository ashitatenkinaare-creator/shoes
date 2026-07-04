"use client";

import { Cloud } from "lucide-react";
import WatchlistCard from "@/components/radar/watchlist/WatchlistCard";
import WatchlistEmptyState from "@/components/radar/watchlist/WatchlistEmptyState";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistView() {
  const { user } = useAuthSession();
  const { items, ready, error, remove } = useWatchlist();

  if (!ready) {
    return (
      <div className="rounded-2xl border border-radar-border bg-radar-surface px-4 py-12 text-center text-sm text-slate-500">
        読み込み中...
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white lg:text-2xl">ウォッチリスト</h1>
            <p className="mt-2 text-sm text-slate-400">
              登録したモデルの発売通知を管理します
            </p>
          </div>
          <span
            className="shrink-0 rounded-full bg-radar-accent/15 px-3 py-1 text-xs font-bold text-radar-accent"
            aria-live="polite"
          >
            {items.length}件
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Cloud className="h-3.5 w-3.5 text-radar-accent" aria-hidden="true" />
          {user ? (
            <>Supabase に保存中（{user.email}）</>
          ) : (
            <>ブラウザに保存（ログインすると Supabase と同期）</>
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

      {items.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <WatchlistCard item={item} onRemove={remove} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
