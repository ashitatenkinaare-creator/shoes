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
            条件にマッチした新作
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            設定したブランド・サイズから自動ピックアップ
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-radar-accent/15 px-3 py-1 text-xs font-bold text-radar-accent">
          {items.length}件
        </span>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <SneakerPickCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
