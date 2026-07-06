import { detectRareCollabFlags } from "./kicksdb-map";
import type { RadarSneakerUpsertRow } from "./kicksdb-types";
import {
  mapSnkrsProductDetailsToCatalogPatch,
  type SnkrsProductDetails,
} from "./snkrs-product-page";
import type { SnkrsLaunchEntry } from "./snkrs-calendar-sync";

export type SnkrsCatalogUpsertRow = RadarSneakerUpsertRow & { source: "snkrs" };

export function snkrsCatalogExternalId(slug: string): string {
  return `snkrs-${slug}`;
}

function inferBrand(entry: SnkrsLaunchEntry): string {
  const haystack = [entry.title, entry.subtitle, entry.seoTitle, entry.slug.replace(/-/g, " ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bjordan\b|\bair jordan\b/.test(haystack)) return "Jordan";
  return "Nike";
}

/** SNKRS マッチ時に既存行へマージする抽選 URL フィールドのみ */
export function mapSnkrsLotteryPatch(
  entry: SnkrsLaunchEntry,
  openedAt: string | Date = new Date(),
): Pick<RadarSneakerUpsertRow, "lottery_url" | "lottery_opened_at"> {
  return {
    lottery_url: entry.url,
    lottery_opened_at: typeof openedAt === "string" ? openedAt : openedAt.toISOString(),
  };
}

/**
 * SNKRS カレンダー1件 → radar_sneakers 行。
 * 個別発売ページから公式情報（画像・発売日・価格）が取れない場合は null（推定値で登録しない）。
 */
export function mapSnkrsEntryToCatalogRow(
  entry: SnkrsLaunchEntry,
  today = new Date(),
  openedAt?: string | Date,
  details?: SnkrsProductDetails | null,
): SnkrsCatalogUpsertRow | null {
  if (!details) return null;

  const brand = inferBrand(entry);
  const officialPatch = mapSnkrsProductDetailsToCatalogPatch(details, today);
  const { is_rare, is_collab } = detectRareCollabFlags(officialPatch.model_name, brand);

  return {
    source: "snkrs",
    external_id: snkrsCatalogExternalId(entry.slug),
    category_slug: "sneakers",
    brand,
    model_name: officialPatch.model_name,
    image_url: officialPatch.image_url,
    announce_date: officialPatch.announce_date,
    release_date: officialPatch.release_date,
    phase: officialPatch.phase,
    price: officialPatch.price,
    store_url: entry.url,
    news_url: null,
    lottery_url: entry.url,
    lottery_opened_at: mapSnkrsLotteryPatch(entry, openedAt ?? today).lottery_opened_at,
    description: officialPatch.description,
    colorway: officialPatch.colorway,
    sku: officialPatch.sku,
    is_rare,
    is_collab,
  };
}
