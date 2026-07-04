import Link from "next/link";
import { List } from "lucide-react";

export default function WatchlistEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-radar-border px-6 py-16 text-center">
      <List className="h-10 w-10 text-slate-600" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-slate-300">ウォッチ中のモデルはありません</p>
      <p className="mt-2 max-w-sm text-xs text-slate-500">
        ダッシュボードや詳細画面からモデルを追加すると、発表・発売の2段階通知を受け取れます。
      </p>
      <Link
        href="/dashboard"
        className="btn-press mt-6 rounded-xl bg-radar-accent px-5 py-2.5 text-sm font-bold text-radar-bg hover:bg-radar-accent-hover"
      >
        新作を探す
      </Link>
    </div>
  );
}
