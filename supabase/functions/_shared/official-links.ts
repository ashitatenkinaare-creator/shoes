/** 2次流通サイト（StockX 等）— UI リンク先としては使用しない */
const SECONDARY_MARKET_HOSTS = [
  "stockx.com",
  "goat.com",
  "stadiumgoods.com",
  "flightclub.com",
  "grailed.com",
  "klekt.com",
  "alias.org",
  "ebay.com",
];

export type OfficialLink = {
  label: string;
  href: string;
};

/** NB 公式ストア（Mobify トップは sitePath エラーになるため Demandware 入口を使用） */
export const NEW_BALANCE_JP_OFFICIAL_STORE_URL =
  "https://shop.newbalance.jp/on/demandware.store/Sites-NBJP-Site/ja_JP/Home-Show";

/** 日本 Converse 公式（converse.com/jp は国選択ページのみ） */
export const CONVERSE_JP_OFFICIAL_STORE_URL = "https://converse.co.jp/";

/** DB に残っている旧 URL → ブラウザで開ける公式 URL */
const LEGACY_BRAND_HUB_VISIT_URL: Record<string, string> = {
  "https://shop.newbalance.jp": NEW_BALANCE_JP_OFFICIAL_STORE_URL,
  "https://newbalance.co.jp": NEW_BALANCE_JP_OFFICIAL_STORE_URL,
  "https://www.converse.com/jp": CONVERSE_JP_OFFICIAL_STORE_URL,
  "https://www.adidas.com/jp/yeezy": "https://www.adidas.com/jp",
};

/** ブランドの総合ページ（モデル固有の発表/抽選 URL ではない） */
const GENERIC_BRAND_HUB_PATHS = new Set([
  "https://www.nike.com/jp/launch",
  "https://www.adidas.com/jp",
  "https://www.adidas.com/jp/yeezy",
  "https://newbalance.co.jp",
  "https://shop.newbalance.jp",
  "https://www.converse.com/jp",
  "https://converse.co.jp",
  "https://jp.puma.com",
  "https://kith.com",
  "https://www.beams.co.jp",
  "https://www.brooksbros.co.jp",
]);

function normalizeOfficialUrl(url: string): string {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, "");
  return `${parsed.origin}${path}`.toLowerCase();
}

function isNewBalanceStoreHub(pathname: string): boolean {
  return (
    pathname.includes("/Sites-NBJP-Site/") ||
    pathname.endsWith("/Home-Show") ||
    pathname === "" ||
    pathname === "/"
  );
}

/** 旧・誤ったブランドハブ URL を、実際に開ける公式 URL に差し替える */
export function normalizeBrandHubUrlForVisit(url: string): string {
  try {
    const key = normalizeOfficialUrl(url);
    const mapped = LEGACY_BRAND_HUB_VISIT_URL[key];
    if (mapped) return mapped;

    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./, "").toLowerCase() === "shop.newbalance.jp") {
      if (isNewBalanceStoreHub(parsed.pathname)) {
        return NEW_BALANCE_JP_OFFICIAL_STORE_URL;
      }
    }

    return url;
  } catch {
    return url;
  }
}

/** モデル固有 URL ではなくブランド総合ページか（例: nike.com/jp/launch トップ） */
export function isGenericBrandHubUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const visitUrl = normalizeBrandHubUrlForVisit(url);
    if (GENERIC_BRAND_HUB_PATHS.has(normalizeOfficialUrl(visitUrl))) {
      return true;
    }
    if (GENERIC_BRAND_HUB_PATHS.has(normalizeOfficialUrl(url))) {
      return true;
    }

    const parsed = new URL(visitUrl);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "converse.co.jp" && (parsed.pathname === "/" || parsed.pathname === "")) {
      return true;
    }
    if (host === "shop.newbalance.jp" && isNewBalanceStoreHub(parsed.pathname)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function sanitizeProductOfficialUrl(url: string | null | undefined): string | null {
  const cleaned = sanitizeOfficialUrl(url);
  if (!cleaned || isGenericBrandHubUrl(cleaned)) return null;
  return cleaned;
}

export function isSecondaryMarketUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return SECONDARY_MARKET_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

/** ブランド / コラボ名から公式ニュース・特設ページ URL を推定（KicksDB 同期の MVP 用） */
export function resolveBrandOfficialNewsUrl(brand: string, modelName: string): string | null {
  const haystack = `${brand} ${modelName}`.toLowerCase();

  if (/\bkith\b/.test(haystack)) return "https://kith.com/";
  if (/\bbeams\b/.test(haystack)) return "https://www.beams.co.jp/";
  if (/brooks brothers/.test(haystack)) return "https://www.brooksbros.co.jp/";

  const brandKey = brand.trim().toLowerCase();
  const brandLaunchPages: Record<string, string> = {
    nike: "https://www.nike.com/jp/launch",
    jordan: "https://www.nike.com/jp/launch",
    adidas: "https://www.adidas.com/jp",
    "new balance": NEW_BALANCE_JP_OFFICIAL_STORE_URL,
    converse: CONVERSE_JP_OFFICIAL_STORE_URL,
    puma: "https://jp.puma.com",
    yeezy: "https://www.adidas.com/jp",
  };

  return brandLaunchPages[brandKey] ?? null;
}

const CATALOG_BRAND_LABELS: Record<string, string> = {
  adidas: "Adidas",
  nike: "Nike",
  jordan: "Jordan",
  "new balance": "New Balance",
  asics: "Asics",
  puma: "Puma",
  converse: "Converse",
  yeezy: "Yeezy",
};

/** KicksDB / UI で共通利用するブランド表記 */
export function normalizeCatalogBrand(brand: string): string {
  const key = brand.trim().toLowerCase();
  return CATALOG_BRAND_LABELS[key] ?? brand.trim();
}

/** ダッシュボード掲載用: ブランド公式ハブ URL（個別抽選ページが無い場合のフォールバック） */
export function resolveBrandOfficialLotteryUrl(brand: string, modelName: string): string | null {
  return resolveBrandOfficialNewsUrl(brand, modelName);
}

function sanitizeOfficialUrl(url: string | null | undefined): string | null {
  if (!url || isSecondaryMarketUrl(url)) return null;
  return url;
}

/** 公式リンク（news / lottery / ブランド公式）の表示ラベルと URL を解決。2次流通サイトには誘導しない */
export function resolveOfficialLink(
  sneaker: {
    newsUrl?: string | null;
    lotteryUrl?: string | null;
    brand?: string;
    modelName?: string;
  },
  options?: { allowBrandFallback?: boolean },
): OfficialLink | null {
  const allowBrandFallback = options?.allowBrandFallback ?? true;
  const lotteryUrl = sanitizeProductOfficialUrl(sneaker.lotteryUrl);
  if (lotteryUrl) {
    return {
      label: "公式抽選・販売ページへ",
      href: normalizeBrandHubUrlForVisit(lotteryUrl),
    };
  }

  const genericLotteryUrl = sanitizeOfficialUrl(sneaker.lotteryUrl);
  if (genericLotteryUrl && isGenericBrandHubUrl(genericLotteryUrl)) {
    return {
      label: "ブランド公式サイトへ",
      href: normalizeBrandHubUrlForVisit(genericLotteryUrl),
    };
  }

  const newsUrl = sanitizeProductOfficialUrl(sneaker.newsUrl);
  if (newsUrl) {
    return {
      label: "公式発表を見る",
      href: normalizeBrandHubUrlForVisit(newsUrl),
    };
  }

  const genericNewsUrl = sanitizeOfficialUrl(sneaker.newsUrl);
  if (genericNewsUrl && isGenericBrandHubUrl(genericNewsUrl)) {
    return {
      label: "ブランド公式サイトへ",
      href: normalizeBrandHubUrlForVisit(genericNewsUrl),
    };
  }

  if (
    allowBrandFallback &&
    !sneaker.newsUrl?.trim() &&
    !sneaker.lotteryUrl?.trim() &&
    sneaker.brand &&
    sneaker.modelName
  ) {
    const brandOfficial = resolveBrandOfficialNewsUrl(sneaker.brand, sneaker.modelName);
    if (brandOfficial) {
      return {
        label: "ブランド公式サイトへ",
        href: normalizeBrandHubUrlForVisit(brandOfficial),
      };
    }
  }

  return null;
}
