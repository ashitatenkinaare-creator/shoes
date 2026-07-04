import { Plus } from "lucide-react";

export default function RestockCard() {
  return (
    <article className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition-colors hover:border-slate-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600">
        <Plus className="h-6 w-6 text-slate-500" />
      </div>
      <p className="mt-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
        Request a Restock
      </p>
    </article>
  );
}
