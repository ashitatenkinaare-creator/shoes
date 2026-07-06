interface SneakerListEmptyProps {
  isRegisteredEmpty: boolean;
}

export default function SneakerListEmpty({ isRegisteredEmpty }: SneakerListEmptyProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-600 bg-surface p-8 text-center shadow-lg shadow-black/20 md:p-10">
      <p className="text-sm font-medium text-slate-300">
        {isRegisteredEmpty ? "スニーカーが登録されていません" : "該当するスニーカーがありません"}
      </p>
      {isRegisteredEmpty && (
        <p className="mt-2 text-sm text-slate-500">
          上のフォームから最初のスニーカーを登録してください
        </p>
      )}
    </div>
  );
}
