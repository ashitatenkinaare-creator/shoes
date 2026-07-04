"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import VaultCard from "@/components/landing/VaultCard";
import RestockCard from "@/components/landing/RestockCard";
import { VAULT_FILTER_TABS, VAULT_ITEMS } from "@/data/drops";
import type { BrandFilter, VaultItem } from "@/types/drop";

interface VaultGridProps {
  initialBrand?: BrandFilter;
}

const brandMap: Record<string, BrandFilter> = {
  ALL: "all",
  NIKE: "nike",
  JORDAN: "jordan",
  ADIDAS: "adidas",
  YEEZY: "yeezy",
  "NEW BALANCE": "new-balance",
};

export default function VaultGrid({ initialBrand = "all" }: VaultGridProps) {
  const [activeTab, setActiveTab] = useState(
    Object.entries(brandMap).find(([, v]) => v === initialBrand)?.[0] ?? "ALL",
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const brandKey = brandMap[activeTab] ?? "all";
    return VAULT_ITEMS.filter((item) => {
      const matchBrand = brandKey === "all" || item.brandKey === brandKey;
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [activeTab, search]);

  return (
    <section className="px-4 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase lg:text-4xl">
          The Vault
        </h1>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-drop-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 border-b border-slate-800 pb-4">
        {VAULT_FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${
              activeTab === tab ? "text-drop-orange" : "text-slate-500 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item: VaultItem) => (
          <VaultCard key={item.id} item={item} />
        ))}
        <RestockCard />
      </div>
    </section>
  );
}
