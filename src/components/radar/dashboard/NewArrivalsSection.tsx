import SneakerPickCard from "@/components/radar/dashboard/SneakerPickCard";
import type { SneakerRadarItem } from "@/types/radar";

interface NewArrivalsSectionProps {
  items: SneakerRadarItem[];
}

export default function NewArrivalsSection({ items }: NewArrivalsSectionProps) {
  return (
    <section aria-labelledby="new-arrivals-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="new-arrivals-heading" className="text-lg font-bold text-white">
            公式掲載・新作ピックアップ
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            各ブランド公式情報付きの直近発売予定を表示（Nike SNKRS / New Balance 等）
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-radar-accent/15 px-3 py-1 text-xs font-bold text-radar-accent">
          {items.length}件
        </span>
      </div>

      <ul className="space-y-4">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-radar-border px-4 py-10 text-center text-sm text-slate-500">
            公式情報付きの新作はまだありません。カタログ同期後に再度ご確認ください。
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <SneakerPickCard item={item} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
