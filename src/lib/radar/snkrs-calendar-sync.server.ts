import type { SupabaseClient } from "@supabase/supabase-js";
import { attachCategoryId } from "@/lib/radar/category-sync";
import { syncNotificationsForUser } from "@/lib/radar/notifications-sync.server";
import {
  mapSnkrsEntryToCatalogRow,
  mapSnkrsLotteryPatch,
  snkrsCatalogExternalId,
} from "@/lib/radar/snkrs-catalog-map";
import {
  createSnkrsProductDetailsCache,
  getSnkrsProductDetailsCached,
  mapSnkrsProductDetailsToCatalogPatch,
} from "@/lib/radar/snkrs-product-page.server";
import { mergeSnkrsProductPatch } from "@/lib/radar/placeholder-image";
import { isGenericBrandHubUrl } from "@/lib/radar/sneaker-links";
import {
  matchSnkrsEntryToSneaker,
  parseSnkrsLaunchEntriesFromHtml,
  type SnkrsLaunchEntry,
} from "@/lib/radar/snkrs-calendar-sync";
import type { RadarDbResult } from "@/types/radar-db";

const SNKRS_CALENDAR_URL = "https://www.nike.com/jp/launch";

type SneakerRow = {
  id: string;
  brand: string;
  model_name: string;
  lottery_url: string | null;
  image_url: string | null;
  release_date: string;
  description: string | null;
};

export type SnkrsCalendarSyncResult = {
  entries: number;
  scanned: number;
  matched: number;
  updated: number;
  cleared: number;
  catalogUpserted: number;
  catalogSkipped: number;
  notifiedUsers: number;
};

function needsSnkrsLotteryUrl(lotteryUrl: string | null): boolean {
  return !lotteryUrl || isGenericBrandHubUrl(lotteryUrl);
}

function isSnkrsProductUrl(lotteryUrl: string | null): boolean {
  return !!lotteryUrl && lotteryUrl.includes("/launch/t/") && !isGenericBrandHubUrl(lotteryUrl);
}

/** SNKRS カレンダー HTML を取得してエントリ一覧を返す */
export async function fetchSnkrsLaunchEntries(): Promise<SnkrsLaunchEntry[]> {
  const response = await fetch(SNKRS_CALENDAR_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SneakerRadar/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`SNKRS カレンダー取得失敗: HTTP ${response.status}`);
  }

  const html = await response.text();
  return parseSnkrsLaunchEntriesFromHtml(html);
}

async function notifyWatchlistUsersForSneakers(
  supabase: SupabaseClient,
  sneakerIds: string[],
): Promise<number> {
  if (sneakerIds.length === 0) return 0;

  const { data: watchlistRows, error } = await supabase
    .from("watchlist")
    .select("user_id")
    .in("sneaker_id", sneakerIds);

  if (error) {
    throw new Error(`ウォッチリスト取得失敗: ${error.message}`);
  }

  const userIds = [...new Set((watchlistRows ?? []).map((row) => row.user_id as string))];
  let notifiedUsers = 0;

  for (const userId of userIds) {
    const notifyResult = await syncNotificationsForUser(supabase, userId);
    if (notifyResult.error) {
      throw new Error(`通知同期失敗 (${userId}): ${notifyResult.error}`);
    }
    if ((notifyResult.data ?? 0) > 0) {
      notifiedUsers += 1;
    }
  }

  return notifiedUsers;
}

/** SNKRS カレンダー掲載のうち KicksDB 未登録分のみ insert。既存行は SNKRS 公式詳細 + lottery を更新 */
async function upsertSnkrsCatalogEntries(
  supabase: SupabaseClient,
  entries: SnkrsLaunchEntry[],
  openedAt: string,
  detailsCache: ReturnType<typeof createSnkrsProductDetailsCache>,
): Promise<{ upserted: number; skipped: number; error: string | null }> {
  if (entries.length === 0) {
    return { upserted: 0, skipped: 0, error: null };
  }

  const entryUrls = entries.map((entry) => entry.url);
  const { data: existingRows, error: selectError } = await supabase
    .from("radar_sneakers")
    .select("id, source, lottery_url, image_url, release_date, description")
    .in("lottery_url", entryUrls);

  if (selectError) {
    return { upserted: 0, skipped: 0, error: `参照失敗: ${selectError.message}` };
  }

  const rowsByLotteryUrl = new Map<
    string,
    { id: string; source: string; image_url: string | null; release_date: string; description: string | null }[]
  >();
  for (const row of existingRows ?? []) {
    const lotteryUrl = row.lottery_url as string | null;
    if (!lotteryUrl) continue;
    const bucket = rowsByLotteryUrl.get(lotteryUrl) ?? [];
    bucket.push({
      id: row.id as string,
      source: row.source as string,
      image_url: row.image_url as string | null,
      release_date: row.release_date as string,
      description: row.description as string | null,
    });
    rowsByLotteryUrl.set(lotteryUrl, bucket);
  }

  let upserted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const existing = rowsByLotteryUrl.get(entry.url) ?? [];
    const kicksdbRow = existing.find((row) => row.source === "kicksdb");

    if (kicksdbRow) {
      skipped += 1;
      continue;
    }

    const details = await getSnkrsProductDetailsCached(entry.url, detailsCache);
    const lotteryPatch = mapSnkrsLotteryPatch(entry, openedAt);
    const productPatch = details ? mapSnkrsProductDetailsToCatalogPatch(details) : {};
    const snkrsRow = existing.find((row) => row.source === "snkrs");

    if (snkrsRow) {
      const patch = mergeSnkrsProductPatch(snkrsRow, { ...lotteryPatch, ...productPatch });
      const { error } = await supabase.from("radar_sneakers").update(patch).eq("id", snkrsRow.id);

      if (error) {
        return {
          upserted,
          skipped,
          error: `SNKRS 詳細更新失敗 (${snkrsRow.id}): ${error.message}`,
        };
      }

      upserted += 1;
      continue;
    }

    const externalId = snkrsCatalogExternalId(entry.slug);
    const { data: existingSnkrsByExternalId, error: externalSelectError } = await supabase
      .from("radar_sneakers")
      .select("id")
      .eq("source", "snkrs")
      .eq("external_id", externalId)
      .maybeSingle();

    if (externalSelectError) {
      return {
        upserted,
        skipped,
        error: `参照失敗 (${externalId}): ${externalSelectError.message}`,
      };
    }

    if (existingSnkrsByExternalId?.id) {
      const patch = mergeSnkrsProductPatch(
        { image_url: null, release_date: "", description: null },
        { ...lotteryPatch, ...productPatch },
      );
      const { error } = await supabase
        .from("radar_sneakers")
        .update(patch)
        .eq("id", existingSnkrsByExternalId.id);

      if (error) {
        return {
          upserted,
          skipped,
          error: `SNKRS 詳細更新失敗 (${existingSnkrsByExternalId.id}): ${error.message}`,
        };
      }

      upserted += 1;
      continue;
    }

    const row = mapSnkrsEntryToCatalogRow(entry, new Date(), openedAt, details);
    if (!row) {
      skipped += 1;
      continue;
    }

    const dbRow = await attachCategoryId(supabase, row);
    if (!dbRow) {
      return { upserted, skipped, error: `カテゴリ解決失敗: ${row.external_id}` };
    }

    const { error } = await supabase.from("radar_sneakers").insert(dbRow);

    if (error) {
      return {
        upserted,
        skipped,
        error: `カタログ insert 失敗 (${row.external_id}): ${error.message}`,
      };
    }

    upserted += 1;
  }

  return { upserted, skipped, error: null };
}

/** SNKRS カレンダーと DB モデル名を照合し、lottery_url を自動付与して通知を送る */
export async function syncSnkrsCalendarUrls(
  supabase: SupabaseClient,
  entries?: SnkrsLaunchEntry[],
): Promise<RadarDbResult<SnkrsCalendarSyncResult>> {
  let calendarEntries = entries;

  try {
    calendarEntries ??= await fetchSnkrsLaunchEntries();
  } catch (error) {
    const message = error instanceof Error ? error.message : "SNKRS カレンダー取得失敗";
    return { data: null, error: message };
  }

  const { data: sneakers, error: sneakerError } = await supabase
    .from("radar_sneakers")
    .select("id, brand, model_name, lottery_url, image_url, release_date, description");

  if (sneakerError) {
    return { data: null, error: `カタログ取得失敗: ${sneakerError.message}` };
  }

  const rows = (sneakers ?? []) as SneakerRow[];
  const candidates = rows.filter((row) => needsSnkrsLotteryUrl(row.lottery_url));

  let matched = 0;
  let updated = 0;
  let cleared = 0;
  const updatedSneakerIds: string[] = [];
  const openedAt = new Date().toISOString();
  const detailsCache = createSnkrsProductDetailsCache();

  async function buildSnkrsMatchPatch(
    entry: SnkrsLaunchEntry,
    existing?: { image_url: string | null; release_date: string; description: string | null },
  ) {
    const details = await getSnkrsProductDetailsCached(entry.url, detailsCache);
    const patch = {
      ...mapSnkrsLotteryPatch(entry, openedAt),
      ...(details ? mapSnkrsProductDetailsToCatalogPatch(details) : {}),
    };
    return existing ? mergeSnkrsProductPatch(existing, patch) : patch;
  }

  for (const sneaker of rows) {
    if (!isSnkrsProductUrl(sneaker.lottery_url)) continue;

    const entry = matchSnkrsEntryToSneaker(sneaker.model_name, sneaker.brand, calendarEntries);
    if (entry?.url === sneaker.lottery_url) continue;

    const { error } = await supabase
      .from("radar_sneakers")
      .update({
        lottery_url: null,
        lottery_opened_at: null,
      })
      .eq("id", sneaker.id);

    if (error) {
      return { data: null, error: `誤URL除去失敗 (${sneaker.id}): ${error.message}` };
    }

    cleared += 1;
  }

  for (const sneaker of candidates) {
    const entry = matchSnkrsEntryToSneaker(sneaker.model_name, sneaker.brand, calendarEntries);
    if (!entry) continue;

    matched += 1;

    if (sneaker.lottery_url === entry.url) continue;

    const patch = await buildSnkrsMatchPatch(entry);
    const { error } = await supabase.from("radar_sneakers").update(patch).eq("id", sneaker.id);

    if (error) {
      return { data: null, error: `更新失敗 (${sneaker.id}): ${error.message}` };
    }

    updated += 1;
    updatedSneakerIds.push(sneaker.id);
  }

  for (const sneaker of rows) {
    if (!isSnkrsProductUrl(sneaker.lottery_url)) continue;

    const entry = calendarEntries.find((item) => item.url === sneaker.lottery_url);
    if (!entry) continue;

    const patch = await buildSnkrsMatchPatch(entry, sneaker);
    const { error } = await supabase.from("radar_sneakers").update(patch).eq("id", sneaker.id);

    if (error) {
      return { data: null, error: `SNKRS 詳細更新失敗 (${sneaker.id}): ${error.message}` };
    }
  }

  const catalogResult = await upsertSnkrsCatalogEntries(
    supabase,
    calendarEntries,
    openedAt,
    detailsCache,
  );
  if (catalogResult.error) {
    return { data: null, error: catalogResult.error };
  }

  try {
    const notifiedUsers = await notifyWatchlistUsersForSneakers(supabase, updatedSneakerIds);
    return {
      data: {
        entries: calendarEntries.length,
        scanned: candidates.length,
        matched,
        updated,
        cleared,
        catalogUpserted: catalogResult.upserted,
        catalogSkipped: catalogResult.skipped,
        notifiedUsers,
      },
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "通知同期失敗";
    return { data: null, error: message };
  }
}
