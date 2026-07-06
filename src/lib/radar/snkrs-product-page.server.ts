import {
  mapSnkrsProductDetailsToCatalogPatch,
  parseSnkrsProductPageFromHtml,
  parseSnkrsSlugFromLaunchUrl,
  type SnkrsProductDetails,
} from "@/lib/radar/snkrs-product-page";

const SNKRS_FETCH_HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; SneakerRadar/1.0)" };

/** SNKRS 個別発売ページから公式商品情報を取得 */
export async function fetchSnkrsProductDetails(
  launchUrl: string,
): Promise<SnkrsProductDetails | null> {
  const slug = parseSnkrsSlugFromLaunchUrl(launchUrl);
  if (!slug) return null;

  const response = await fetch(launchUrl, { headers: SNKRS_FETCH_HEADERS });
  if (!response.ok) return null;

  const html = await response.text();
  return parseSnkrsProductPageFromHtml(html, slug);
}

export type SnkrsProductDetailsCache = Map<string, SnkrsProductDetails | null>;

export function createSnkrsProductDetailsCache(): SnkrsProductDetailsCache {
  return new Map();
}

/** 同一 sync 内で SNKRS 商品ページを1回だけ取得 */
export async function getSnkrsProductDetailsCached(
  launchUrl: string,
  cache: SnkrsProductDetailsCache,
): Promise<SnkrsProductDetails | null> {
  if (cache.has(launchUrl)) {
    return cache.get(launchUrl) ?? null;
  }

  const details = await fetchSnkrsProductDetails(launchUrl);
  cache.set(launchUrl, details);
  return details;
}

export { mapSnkrsProductDetailsToCatalogPatch };
