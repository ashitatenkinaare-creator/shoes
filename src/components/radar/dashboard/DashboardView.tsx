"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Radar, Settings } from "lucide-react";
import NewArrivalsSection from "@/components/radar/dashboard/NewArrivalsSection";
import NotificationPanel from "@/components/radar/dashboard/NotificationPanel";
import WatchlistPreviewSection from "@/components/radar/dashboard/WatchlistPreviewSection";
import { MOCK_PREFERENCES } from "@/data/radar-mock";
import { useAuthSession } from "@/hooks/useAuthSession";
import { filterSneakersByPreferences } from "@/lib/radar/filter-sneakers";
import { loadLocalPreferences } from "@/lib/radar/preferences";
import { fetchNotifications } from "@/lib/radar/notifications-db";
import type { SneakerRadarItem, UserPreferences } from "@/types/radar";

interface DashboardViewProps {
  items: SneakerRadarItem[];
  initialPreferences?: UserPreferences | null;
}

export default function DashboardView({ items, initialPreferences = null }: DashboardViewProps) {
  const { user, loading: authLoading } = useAuthSession();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const preferences = useMemo((): UserPreferences => {
    if (user && initialPreferences) return initialPreferences;
    if (!user && !authLoading) return loadLocalPreferences();
    return initialPreferences ?? MOCK_PREFERENCES;
  }, [user, initialPreferences, authLoading]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadUnread = async () => {
      const { data } = await fetchNotifications(user.id);
      if (cancelled) return;
      setUnreadCount((data ?? []).filter((n) => !n.readAt).length);
    };

    void loadUnread();

    return () => {
      cancelled = true;
    };
  }, [user, notifyOpen]);

  const displayUnreadCount = user ? unreadCount : 0;

  const displayItems = useMemo(
    () => filterSneakersByPreferences(items, preferences),
    [items, preferences],
  );

  const activeFilters: string[] = [];
  if (preferences.silhouettes.length > 0) {
    activeFilters.push(`シルエット: ${preferences.silhouettes.join(", ")}`);
  }
  if (preferences.collabBrands.length > 0) {
    activeFilters.push(`コラボ: ${preferences.collabBrands.join(", ")}`);
  }
  if (preferences.categories.length > 0) {
    activeFilters.push(`カテゴリ: ${preferences.categories.join(", ")}`);
  }
  if (preferences.filterRare) activeFilters.push("レア");
  if (preferences.filterCollab) activeFilters.push("コラボモデル");

  return (
    <>
      <header className="mb-8 lg:hidden">
        <div className="flex items-center gap-2">
          <Radar className="h-6 w-6 text-radar-accent" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-black text-white">Sneaker Radar</h1>
            <p className="text-xs text-slate-500">新作を逃さないパートナー</p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-radar-border bg-gradient-to-br from-radar-surface to-radar-muted p-5">
        <p className="text-sm text-slate-400">公式掲載・新作ピックアップ</p>
        <p className="mt-1 text-2xl font-black text-white">
          {displayItems.length}
          <span className="ml-1 text-base font-bold text-slate-400">件の新作</span>
        </p>
        {activeFilters.length > 0 && (
          <p className="mt-2 text-xs text-radar-accent">
            フィルタ: {activeFilters.join(" / ")} のみ表示中
          </p>
        )}
        {items.length > 0 && displayItems.length === 0 && (
          <p className="mt-2 text-xs text-amber-400/90">
            カタログに {items.length} 件の新作がありますが、現在の通知条件に一致するものがありません。
            <Link href="/settings" className="ml-1 underline hover:text-amber-300">
              条件を見直す
            </Link>
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          ログイン後、条件設定とウォッチリストに基づき2段階通知を配信します
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/settings"
            className="btn-press inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-radar-accent px-4 py-2.5 text-sm font-bold text-radar-bg transition-colors hover:bg-radar-accent-hover"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            通知・条件を設定
          </Link>
          <button
            type="button"
            onClick={() => setNotifyOpen(true)}
            className="btn-press relative inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-radar-border bg-radar-surface px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-radar-accent/50"
          >
            <Bell className="h-4 w-4 text-radar-accent" aria-hidden="true" />
            通知を確認
            {displayUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-radar-accent px-1 text-[10px] font-bold text-radar-bg">
                {displayUnreadCount}
              </span>
            )}
          </button>
        </div>
      </section>

      <div className="mt-8">
        <NewArrivalsSection items={displayItems} />
      </div>

      <WatchlistPreviewSection />

      <NotificationPanel open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </>
  );
}
