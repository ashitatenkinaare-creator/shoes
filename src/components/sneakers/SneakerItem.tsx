"use client";

import NotifySwitch from "@/components/sneakers/NotifySwitch";
import { formatDate } from "@/lib/formatters";
import type { Sneaker } from "@/types/sneaker";

interface SneakerItemProps {
  sneaker: Sneaker;
  onToggleNotify: (sneaker: Sneaker) => void;
  onDelete: (sneaker: Sneaker) => void;
}

export default function SneakerItem({
  sneaker,
  onToggleNotify,
  onDelete,
}: SneakerItemProps) {
  const notifyLabel = sneaker.isNotified ? "ON" : "OFF";

  return (
    <li className="rounded-2xl border border-border bg-surface p-3 shadow-lg shadow-black/20 transition-colors hover:border-indigo-500/30 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100 md:hidden">
            {sneaker.modelName}
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-400 md:hidden">
            {sneaker.brand}
          </p>

          <p className="hidden truncate font-semibold text-slate-100 md:block">
            {sneaker.modelName}
            <span className="font-normal text-slate-400"> · {sneaker.brand}</span>
          </p>

          <p className="mt-1 hidden text-sm text-slate-500 md:block">
            発売日: {formatDate(sneaker.releaseDate)}
          </p>
          <p className="mt-0.5 hidden text-xs text-slate-600 md:block">
            登録日: {formatDate(sneaker.createdAt)}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 md:shrink-0 md:border-0 md:pt-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                sneaker.isNotified ? "text-neon" : "text-slate-500"
              }`}
            >
              <span className="md:hidden">通知 {notifyLabel}</span>
              <span className="hidden md:inline">{notifyLabel}</span>
            </span>
            <NotifySwitch
              checked={sneaker.isNotified}
              onChange={() => onToggleNotify(sneaker)}
              label={`${sneaker.modelName}の通知設定`}
            />
          </div>

          <button
            type="button"
            onClick={() => onDelete(sneaker)}
            className="min-h-[44px] rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 md:min-h-0 md:px-3 md:py-1.5 md:text-xs"
          >
            削除
          </button>
        </div>
      </div>
    </li>
  );
}
