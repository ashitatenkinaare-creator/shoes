import { Plus } from "lucide-react";

/** カタログ末尾の装飾カード（操作不可） */
export default function RestockCard() {
  return (
    <div
      className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center"
      aria-hidden="true"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700">
        <Plus className="h-6 w-6 text-slate-600" />
      </div>
      <p className="mt-4 text-xs font-bold tracking-wider text-slate-600 uppercase">Coming soon</p>
    </div>
  );
}
