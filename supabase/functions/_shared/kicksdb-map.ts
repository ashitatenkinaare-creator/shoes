import type {
  KicksDbStockxProduct,
  RadarSneakerUpsertRow,
  SyncRadarOptions,
} from "./kicksdb-types";
import {
  COLLAB_PATTERNS,
  RARE_PATTERNS,
  RARE_QUOTED_COLORWAY_ENABLED,
} from "./rare-collab-keywords";
import {
  normalizeCatalogBrand,
  resolveBrandOfficialNewsUrl,
  resolveBrandOfficialLotteryUrl,
} from "./official-links";
import {
  isUpcomingReleaseDate,
  resolveVerifiedReleaseDate,
} from "./release-date";

const DEFAULT_USD_JPY = 150;
const DEFAULT_ANNOUNCE_OFFSET_DAYS = 14;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop";

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computePhase(
  releaseDate: string,
  today = new Date(),
): "announced" | "upcoming" | "today" {
  const todayStr = formatIsoDate(today);
  if (releaseDate === todayStr) return "today";

  const release = new Date(`${releaseDate}T00:00:00`);
  const diffMs = release.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 0 && diffDays <= 7) return "upcoming";
  return "announced";
}

export function computeAnnounceDate(
  releaseDate: string,
  offsetDays = DEFAULT_ANNOUNCE_OFFSET_DAYS,
): string {
  const release = new Date(`${releaseDate}T00:00:00`);
  release.setDate(release.getDate() - offsetDays);
  return formatIsoDate(release);
}

function resolveRetailUsd(product: KicksDbStockxProduct): number | null {
  if (typeof product.retail_price === "number" && product.retail_price > 0) {
    return product.retail_price;
  }

  const descMatch = product.description?.match(/retailed for \$(\d+(?:\.\d+)?)/i);
  if (descMatch?.[1]) {
    const parsed = Number.parseFloat(descMatch[1]);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  const traitRetail = product.traits?.retail_price ?? product.traits?.Retail_Price;
  if (typeof traitRetail === "number" && traitRetail > 0) return traitRetail;
  if (typeof traitRetail === "string") {
    const parsed = Number.parseFloat(traitRetail.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  return null;
}

function resolvePriceJpy(product: KicksDbStockxProduct, usdJpy: number): number {
  const retailUsd = resolveRetailUsd(product);
  if (retailUsd) return Math.round(retailUsd * usdJpy);
  if (typeof product.min_price === "number" && product.min_price > 0) {
    return Math.round(product.min_price * usdJpy);
  }
  return 18000;
}

function resolveImageUrl(product: KicksDbStockxProduct): string {
  return product.image ?? product.thumb_url ?? PLACEHOLDER_IMAGE;
}

function resolveModelName(product: KicksDbStockxProduct): string {
  return (product.title ?? product.name ?? product.slug ?? "Unknown Sneaker").trim();
}

/** モデル名・ブランドからレア / コラボフラグを推定 */
export function detectRareCollabFlags(
  modelName: string,
  brand = "",
): { is_rare: boolean; is_collab: boolean } {
  const haystack = `${brand} ${modelName}`.trim();
  const hasQuotedColorway =
    RARE_QUOTED_COLORWAY_ENABLED && (/'[^']+'/.test(modelName) || /"[^"]+"/.test(modelName));
  const is_rare = RARE_PATTERNS.some((pattern) => pattern.test(haystack)) || hasQuotedColorway;
  const is_collab = COLLAB_PATTERNS.some((pattern) => pattern.test(haystack));
  return { is_rare, is_collab };
}

export function mapKicksDbProductToRow(
  product: KicksDbStockxProduct,
  options: Pick<SyncRadarOptions, "usdJpy" | "announceOffsetDays"> = {},
): RadarSneakerUpsertRow | null {
  const slug = product.slug?.trim();
  if (!slug) return null;

  const verified = resolveVerifiedReleaseDate(product);
  if (!verified || !isUpcomingReleaseDate(verified.date)) return null;

  const releaseDate = verified.date;
  const brand = normalizeCatalogBrand(product.brand ?? "Unknown");
  const modelName = resolveModelName(product);
  const usdJpy = options.usdJpy ?? DEFAULT_USD_JPY;
  const announceOffset = options.announceOffsetDays ?? DEFAULT_ANNOUNCE_OFFSET_DAYS;
  const { is_rare, is_collab } = detectRareCollabFlags(modelName, brand);
  const newsUrl = resolveBrandOfficialNewsUrl(brand, modelName);
  const lotteryUrl = resolveBrandOfficialLotteryUrl(brand, modelName);

  return {
    source: "kicksdb",
    external_id: slug,
    category_slug: "sneakers",
    brand,
    model_name: modelName,
    image_url: resolveImageUrl(product),
    announce_date: computeAnnounceDate(releaseDate, announceOffset),
    release_date: releaseDate,
    phase: computePhase(releaseDate),
    price: resolvePriceJpy(product, usdJpy),
    store_url: newsUrl ?? "https://www.nike.com/jp/launch",
    news_url: null,
    lottery_url: lotteryUrl,
    description:
      product.description?.trim() ??
      `${brand} ${modelName}。KicksDB / StockX カタログから同期された新作情報です。`,
    colorway: (product.colorway ?? "").trim(),
    sku: (product.sku ?? "").trim(),
    is_rare,
    is_collab,
  };
}
