import Link from "next/link";

export default function SneakerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-black text-radar-accent/30">404</p>
      <h1 className="mt-4 text-lg font-bold text-white">スニーカーが見つかりません</h1>
      <p className="mt-2 text-sm text-slate-500">
        指定された ID のモデルは存在しないか、削除されています。
      </p>
      <Link
        href="/dashboard"
        className="btn-press mt-8 rounded-xl bg-radar-accent px-6 py-3 text-sm font-bold text-radar-bg hover:bg-radar-accent-hover"
      >
        ダッシュボードへ戻る
      </Link>
    </div>
  );
}
