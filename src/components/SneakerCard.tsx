import { useState } from "react";
import type { Sneaker } from "../types/sneaker";
import { formatPrice, formatReleaseDate, PLACEHOLDER_IMAGE } from "../data/sneakers";

interface SneakerCardProps {
  sneaker: Sneaker;
  onNotifyToggle: (id: string, isNotified: boolean) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
}

export default function SneakerCard({
  sneaker,
  onNotifyToggle,
  onDelete,
}: SneakerCardProps) {
  const [loadingNotify, setLoadingNotify] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleNotifyToggle = async () => {
    setActionError(null);
    setLoadingNotify(true);
    const error = await onNotifyToggle(sneaker.id, !sneaker.isNotified);
    setLoadingNotify(false);
    if (error) setActionError(error);
  };

  const handleDelete = async () => {
    if (!window.confirm(`「${sneaker.modelName}」を削除しますか？`)) return;

    setActionError(null);
    setLoadingDelete(true);
    const error = await onDelete(sneaker.id);
    setLoadingDelete(false);
    if (error) setActionError(error);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border-dark bg-surface-light shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-neon/30 hover:shadow-xl hover:shadow-neon/5">
      <div className="relative overflow-hidden bg-zinc-900">
        <img
          src={sneaker.imageUrl || PLACEHOLDER_IMAGE}
          alt={sneaker.modelName}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-neon backdrop-blur-sm">
          {sneaker.brand}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">
          {sneaker.modelName}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          発売日：{formatReleaseDate(sneaker.releaseDate)}
        </p>
        <p className="mt-1 text-lg font-black text-white">
          {formatPrice(sneaker.price)}
          <span className="ml-1 text-xs font-normal text-zinc-500">（税込）</span>
        </p>

        {actionError && (
          <p className="mt-3 text-xs text-red-400">{actionError}</p>
        )}

        <button
          type="button"
          onClick={handleNotifyToggle}
          disabled={loadingNotify || loadingDelete}
          className={`mt-4 w-full rounded-full py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            sneaker.isNotified
              ? "border border-neon bg-neon/10 text-neon"
              : "bg-neon text-black hover:bg-neon-hover"
          }`}
        >
          {loadingNotify
            ? "更新中..."
            : sneaker.isNotified
              ? "通知設定済み ✓"
              : "通知設定"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loadingNotify || loadingDelete}
          className="mt-2 w-full rounded-full border border-red-500/30 py-2.5 text-sm font-bold text-red-400 transition-colors hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingDelete ? "削除中..." : "削除"}
        </button>
      </div>
    </article>
  );
}
