"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import VaultCard from "@/components/landing/VaultCard";
import RestockCard from "@/components/landing/RestockCard";
import { VAULT_FILTER_OPTIONS, VAULT_ITEMS } from "@/data/drops";
import type { BrandFilter, VaultItem } from "@/types/drop";

interface VaultGridProps {
  initialBrand?: BrandFilter;
}

export default function VaultGrid({ initialBrand = "all" }: VaultGridProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const activeTab =
    VAULT_FILTER_OPTIONS.find((option) => option.brandKey === initialBrand)?.key ?? "ALL";

  const filtered = useMemo(() => {
    const brandKey =
      VAULT_FILTER_OPTIONS.find((option) => option.key === activeTab)?.brandKey ?? "all";
    return VAULT_ITEMS.filter((item) => {
      const matchBrand = brandKey === "all" || item.brandKey === brandKey;
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [activeTab, search]);

  const handleTabChange = (tabKey: string) => {
    const brandKey =
      VAULT_FILTER_OPTIONS.find((option) => option.key === tabKey)?.brandKey ?? "all";
    router.push(brandKey === "all" ? "/vault" : `/vault?brand=${brandKey}`);
  };

  return (
    <section className="px-4 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase lg:text-4xl">
          スニーカーカタログ
        </h1>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="カタログを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-drop-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 border-b border-slate-800 pb-4">
        {VAULT_FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleTabChange(option.key)}
            className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${
              activeTab === option.key ? "text-drop-orange" : "text-slate-500 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-12 text-center text-sm text-slate-500">
          該当するスニーカーがありません。別のブランドを選ぶか、検索キーワードを変更してください。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item: VaultItem) => (
            <VaultCard key={item.id} item={item} />
          ))}
          <RestockCard />
        </div>
      )}
    </section>
  );
}
