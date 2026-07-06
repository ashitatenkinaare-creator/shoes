import { hasSnkrsProductLotteryUrl } from "@/lib/radar/catalog-dashboard-filter";
import { DEFAULT_SNEAKERS_CATEGORY_SLUG } from "@/lib/radar/categories";
import { resolveRadarImageUrl } from "@/lib/radar/placeholder-image";
import { isSnkrsEligibleBrand } from "@/lib/radar/snkrs-calendar-sync";
import type { SneakerRadarDetail, SneakerRadarItem } from "@/types/radar";
import type { RadarSneakerRow } from "@/types/radar-db";

export function toDbSneakerId(appId: string): string {
  return appId;
}

export function toAppSneakerId(dbId: string): string {
  return dbId;
}

function appendOfficialListingBadge(
  brand: string,
  lotteryUrl: string | null,
  matchedReasons: string[],
): void {
  if (!lotteryUrl?.trim()) return;

  if (hasSnkrsProductLotteryUrl(lotteryUrl) && isSnkrsEligibleBrand(brand)) {
    matchedReasons.push("SNKRS公式掲載");
    return;
  }

  matchedReasons.push("公式情報あり");
}

export function rowToSneakerItem(row: RadarSneakerRow): SneakerRadarItem {
  const matchedReasons = [`ブランド: ${row.brand}`];
  appendOfficialListingBadge(row.brand, row.lottery_url, matchedReasons);
  if (row.is_rare) matchedReasons.push("レア");
  if (row.is_collab) matchedReasons.push("コラボ");

  const categorySlug = row.radar_categories?.slug ?? DEFAULT_SNEAKERS_CATEGORY_SLUG;
  const categoryLabel = row.radar_categories?.label ?? "スニーカー";

  return {
    id: toAppSneakerId(row.id),
    categorySlug,
    categoryLabel,
    brand: row.brand,
    modelName: row.model_name,
    imageUrl: resolveRadarImageUrl(row.image_url),
    announceDate: row.announce_date,
    releaseDate: row.release_date,
    phase: row.phase,
    price: row.price,
    storeUrl: row.store_url,
    newsUrl: row.news_url ?? null,
    lotteryUrl: row.lottery_url ?? null,
    lotteryOpenedAt: row.lottery_opened_at ?? null,
    isRare: row.is_rare ?? false,
    isCollab: row.is_collab ?? false,
    matchedReasons,
  };
}

export function rowToSneakerDetail(row: RadarSneakerRow): SneakerRadarDetail {
  return {
    ...rowToSneakerItem(row),
    description: row.description,
    colorway: row.colorway,
    sku: row.sku,
  };
}
