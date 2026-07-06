import { meetsDashboardCatalogQuality } from "@/lib/radar/dashboard-catalog-quality";
import { isRadarPlaceholderImage } from "@/lib/radar/placeholder-image";
import { parseSnkrsSlugFromLotteryUrl } from "@/lib/radar/placeholder-image";
import { isGenericBrandHubUrl } from "@/lib/radar/sneaker-links";
import type { RadarSneakerRow } from "@/types/radar-db";

/** E2E / テスト用 external_id（例: e2e-nike-rare） */
export function isE2eExternalId(externalId: string | null | undefined): boolean {
  if (!externalId) return false;
  return externalId.toLowerCase().startsWith("e2e-");
}

/** SNKRS 個別発売ページ URL（/launch/t/...）が付与済みか */
export function hasSnkrsProductLotteryUrl(lotteryUrl: string | null | undefined): boolean {
  if (!lotteryUrl || isGenericBrandHubUrl(lotteryUrl)) return false;
  return lotteryUrl.includes("/launch/t/");
}

/** @deprecated meetsDashboardCatalogQuality 内で lottery_url を検証 */
export function hasDashboardLotteryUrl(lotteryUrl: string | null | undefined): boolean {
  return !!lotteryUrl?.trim();
}

function dashboardRowRank(row: RadarSneakerRow): number {
  if (row.source === "kicksdb") return 0;
  if (row.source === "snkrs") return 1;
  return 2;
}

function dashboardImageRank(row: RadarSneakerRow): number {
  return isRadarPlaceholderImage(row.image_url) ? 1 : 0;
}

function dashboardProductKey(row: RadarSneakerRow): string {
  const snkrsSlug = parseSnkrsSlugFromLotteryUrl(row.lottery_url);
  if (snkrsSlug) return `snkrs:${snkrsSlug}`;
  if (hasSnkrsProductLotteryUrl(row.lottery_url)) {
    return row.lottery_url!;
  }
  return row.id;
}

/** ダッシュボード用: 発売日・画像・ソースURL の3基準を満たす行のみ */
export function filterDashboardCatalogRows(rows: RadarSneakerRow[]): RadarSneakerRow[] {
  const eligible = rows
    .filter((row) => meetsDashboardCatalogQuality(row))
    .sort((a, b) => {
      const sourceDiff = dashboardRowRank(a) - dashboardRowRank(b);
      if (sourceDiff !== 0) return sourceDiff;

      const imageDiff = dashboardImageRank(a) - dashboardImageRank(b);
      if (imageDiff !== 0) return imageDiff;

      return a.release_date.localeCompare(b.release_date);
    });

  const seenKeys = new Set<string>();
  return eligible.filter((row) => {
    const key = dashboardProductKey(row);
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}
