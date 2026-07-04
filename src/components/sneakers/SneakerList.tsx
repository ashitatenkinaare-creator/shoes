"use client";

import SneakerItem from "@/components/sneakers/SneakerItem";
import SneakerListEmpty from "@/components/sneakers/SneakerListEmpty";
import type { Sneaker } from "@/types/sneaker";

interface SneakerListProps {
  sneakers: Sneaker[];
  loading: boolean;
  isRegisteredEmpty: boolean;
  onToggleNotify: (sneaker: Sneaker) => void;
  onDelete: (sneaker: Sneaker) => void;
}

export default function SneakerList({
  sneakers,
  loading,
  isRegisteredEmpty,
  onToggleNotify,
  onDelete,
}: SneakerListProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-lg shadow-black/20 md:p-8">
        <p className="text-sm text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (sneakers.length === 0) {
    return <SneakerListEmpty isRegisteredEmpty={isRegisteredEmpty} />;
  }

  return (
    <ul className="space-y-3">
      {sneakers.map((sneaker) => (
        <SneakerItem
          key={sneaker.id}
          sneaker={sneaker}
          onToggleNotify={onToggleNotify}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
