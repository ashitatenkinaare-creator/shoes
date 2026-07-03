import type { Sneaker } from "../types/sneaker";
import SneakerCard from "./SneakerCard";

interface ReleaseCalendarProps {
  sneakers: Sneaker[];
  loading: boolean;
  onNotifyToggle: (id: string, isNotified: boolean) => Promise<string | null>;
  onDelete: (id: string) => Promise<string | null>;
}

export default function ReleaseCalendar({
  sneakers,
  loading,
  onNotifyToggle,
  onDelete,
}: ReleaseCalendarProps) {
  return (
    <section id="calendar" className="flex-1">
      <div className="mb-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          発売日カレンダー
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          データベースの発売日順に表示しています（{sneakers.length}件）
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border-dark bg-surface p-12 text-center">
          <p className="text-zinc-400">読み込み中...</p>
        </div>
      ) : sneakers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-dark bg-surface p-12 text-center">
          <p className="text-zinc-400">
            登録されたスニーカーがありません。フォームから追加してください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sneakers.map((sneaker) => (
            <SneakerCard
              key={sneaker.id}
              sneaker={sneaker}
              onNotifyToggle={onNotifyToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
