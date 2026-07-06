import type { SupabaseClient } from "@supabase/supabase-js";
import { isGenericBrandHubUrl } from "@/lib/radar/sneaker-links";
import { matchOfficialUrlsFromSources, pickRegistryLotteryUrl } from "@/lib/radar/official-url-sync";
import type { RadarDbResult } from "@/types/radar-db";

type SneakerRow = {
  id: string;
  brand: string;
  model_name: string;
  news_url: string | null;
  lottery_url: string | null;
  store_url: string;
};

function pickProductOfficialUrl(current: string | null, candidate: string | null): string | null {
  if (current && !isGenericBrandHubUrl(current)) return current;
  if (candidate && !isGenericBrandHubUrl(candidate)) return candidate;
  return null;
}

function normalizeStoredUrl(current: string | null): string | null {
  if (current && isGenericBrandHubUrl(current)) return null;
  return current;
}

/** 登録済み radar_lottery_sources からカタログの公式 URL を更新 */
export async function syncOfficialUrlsForCatalog(
  supabase: SupabaseClient,
): Promise<RadarDbResult<number>> {
  const { data: sources, error: sourceError } = await supabase
    .from("radar_lottery_sources")
    .select("slug, label, brand_pattern, model_pattern, news_url, lottery_url, priority, is_active")
    .eq("is_active", true);

  if (sourceError) {
    return { data: null, error: `公式ソース取得失敗: ${sourceError.message}` };
  }

  const { data: sneakers, error: sneakerError } = await supabase
    .from("radar_sneakers")
    .select("id, brand, model_name, news_url, lottery_url, store_url");

  if (sneakerError) {
    return { data: null, error: `カタログ取得失敗: ${sneakerError.message}` };
  }

  let updated = 0;

  for (const sneaker of (sneakers ?? []) as SneakerRow[]) {
    const match = matchOfficialUrlsFromSources(sneaker.brand, sneaker.model_name, sources ?? []);

    const preserveSnkrsProductUrl = sneaker.lottery_url?.includes("/launch/t/") ?? false;

    const patch = {
      news_url: match.source_slug
        ? pickProductOfficialUrl(normalizeStoredUrl(sneaker.news_url), match.news_url)
        : normalizeStoredUrl(sneaker.news_url),
      lottery_url: preserveSnkrsProductUrl
        ? sneaker.lottery_url
        : match.source_slug
          ? pickRegistryLotteryUrl(sneaker.lottery_url, match.lottery_url)
          : sneaker.lottery_url,
      store_url: sneaker.store_url,
    };

    if (
      patch.news_url === sneaker.news_url &&
      patch.lottery_url === sneaker.lottery_url &&
      patch.store_url === sneaker.store_url
    ) {
      continue;
    }

    const { error } = await supabase.from("radar_sneakers").update(patch).eq("id", sneaker.id);

    if (error) {
      return { data: null, error: `更新失敗 (${sneaker.id}): ${error.message}` };
    }

    updated += 1;
  }

  return { data: updated, error: null };
}
