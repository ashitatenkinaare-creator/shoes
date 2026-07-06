import { computeAnnounceDate, computePhase } from "./kicksdb-map";
import type { RadarSneakerUpsertRow } from "./kicksdb-types";

type CoverCard = {
  title?: string;
  subtitle?: string;
  portraitURL?: string;
  defaultURL?: string;
};

type ThreadItem = {
  title?: string;
  coverCard?: CoverCard;
  seo?: { slug?: string; title?: string };
};

type ProductItem = {
  styleColor?: string;
  currentPrice?: number;
  fullPrice?: number;
  commerceStartDate?: string;
  title?: string;
  subtitle?: string;
};

export type SnkrsProductDetails = {
  slug: string;
  modelName: string;
  colorway: string;
  price: number;
  sku: string;
  imageUrl: string;
  releaseDate: string;
  commerceStartDate: string | null;
  description: string;
};

function formatIsoDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
}

export function parseSnkrsSlugFromLaunchUrl(url: string): string | null {
  const match = url.match(/\/launch\/t\/([a-z0-9-]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function buildDescription(modelName: string, colorway: string, sku: string): string {
  const colorPart = colorway ? ` ${colorway}` : "";
  const skuPart = sku ? ` (${sku})` : "";
  return `${modelName}${colorPart}${skuPart}。Nike SNKRS 公式掲載モデル。`;
}

function resolveThread(
  threadItems: Record<string, ThreadItem>,
  expectedSlug?: string,
): { thread: ThreadItem; slug: string } | null {
  const normalizedExpected = expectedSlug?.trim().toLowerCase();

  if (normalizedExpected) {
    for (const thread of Object.values(threadItems)) {
      const slug = thread.seo?.slug?.trim().toLowerCase();
      if (slug === normalizedExpected) {
        return { thread, slug };
      }
    }
  }

  for (const thread of Object.values(threadItems)) {
    const slug = thread.seo?.slug?.trim();
    if (!slug) continue;
    return { thread, slug };
  }

  return null;
}

/** SNKRS 個別発売ページ HTML から公式商品情報を抽出 */
export function parseSnkrsProductPageFromHtml(
  html: string,
  expectedSlug?: string,
): SnkrsProductDetails | null {
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!nextDataMatch) return null;

  try {
    const json = JSON.parse(nextDataMatch[1]) as {
      props?: { pageProps?: { initialState?: string } };
    };
    const initialState = json.props?.pageProps?.initialState;
    if (typeof initialState !== "string") return null;

    const state = JSON.parse(initialState) as {
      product?: {
        threads?: { data?: { items?: Record<string, ThreadItem> } };
        products?: { data?: { items?: Record<string, ProductItem> } };
      };
    };

    const threadItems = state.product?.threads?.data?.items ?? {};
    const resolved = resolveThread(threadItems, expectedSlug);
    if (!resolved) return null;

    const { thread, slug } = resolved;
    const cover = thread.coverCard;
    const product = Object.values(state.product?.products?.data?.items ?? {})[0];

    const modelName = (thread.title ?? cover?.subtitle ?? "").replace(/\s+/g, " ").trim();
    const colorway = (cover?.title ?? "").replace(/\s+/g, " ").trim();
    const imageUrl = (cover?.portraitURL ?? cover?.defaultURL ?? "").trim();
    const price = product?.currentPrice ?? product?.fullPrice ?? 0;
    const sku = (product?.styleColor ?? "").trim();
    const commerceStartDate = product?.commerceStartDate ?? null;

    if (!modelName || !imageUrl || price <= 0 || !commerceStartDate) return null;

    const releaseDate = formatIsoDate(new Date(commerceStartDate));

    return {
      slug,
      modelName,
      colorway,
      price,
      sku,
      imageUrl,
      releaseDate,
      commerceStartDate,
      description: buildDescription(modelName, colorway, sku),
    };
  } catch {
    return null;
  }
}

/** SNKRS 公式商品情報 → カタログ更新パッチ（lottery 以外の詳細データ） */
export function mapSnkrsProductDetailsToCatalogPatch(
  details: SnkrsProductDetails,
  today = new Date(),
): Pick<
  RadarSneakerUpsertRow,
  | "model_name"
  | "image_url"
  | "price"
  | "colorway"
  | "sku"
  | "release_date"
  | "announce_date"
  | "phase"
  | "description"
> {
  return {
    model_name: details.modelName,
    image_url: details.imageUrl,
    price: details.price,
    colorway: details.colorway,
    sku: details.sku,
    release_date: details.releaseDate,
    announce_date: computeAnnounceDate(details.releaseDate, 7),
    phase: computePhase(details.releaseDate, today),
    description: details.description,
  };
}
