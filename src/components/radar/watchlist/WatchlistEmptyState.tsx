import Link from "next/link";
import { LayoutList, Search } from "lucide-react";

export default function WatchlistEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-radar-border bg-radar-surface/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-radar-muted">
        <LayoutList className="h-7 w-7 text-slate-500" aria-hidden="true" />
      </div>
      <p className="mt-5 text-base font-semibold text-white">ウォッチ中のモデルはありません</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        ダッシュボードや詳細画面からモデルを追加すると、発表・発売の2段階通知を受け取れます。
      </p>
      <Link
        href="/dashboard"
        className="btn-press mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-radar-accent px-6 py-2.5 text-sm font-bold text-radar-bg transition-colors hover:bg-radar-accent-hover"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        新作を探す
      </Link>
    </div>
  );
}
