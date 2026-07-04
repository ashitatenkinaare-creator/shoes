"use client";

import { BellOff } from "lucide-react";
import type { WatchlistRemoveHandler } from "@/types/radar";

interface WatchlistDeleteButtonProps {
  modelName: string;
  sneakerId: string;
  onRemove: WatchlistRemoveHandler;
  disabled?: boolean;
}

export default function WatchlistDeleteButton({
  modelName,
  sneakerId,
  onRemove,
  disabled = false,
}: WatchlistDeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void onRemove(sneakerId)}
      disabled={disabled}
      aria-label={`${modelName}をウォッチリストから外す`}
      className="btn-press shrink-0 rounded-full border border-radar-border bg-radar-muted p-2 text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
    >
      <BellOff className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
