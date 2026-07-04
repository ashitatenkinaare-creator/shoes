"use client";

import type { FilterMode } from "@/types/sneaker";

interface FilterTabsProps {
  value: FilterMode;
  onChange: (mode: FilterMode) => void;
}

const tabs: { label: string; value: FilterMode }[] = [
  { label: "すべて", value: "all" },
  { label: "通知ONのみ", value: "notified" },
];

export default function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <div className="flex rounded-lg border border-border bg-surface-light p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`min-h-[44px] flex-1 rounded-md px-3 py-2.5 text-sm font-medium transition-colors md:min-h-0 md:py-2 ${
            value === tab.value
              ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
