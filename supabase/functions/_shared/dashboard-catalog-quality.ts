import {
  isRadarPlaceholderImage,
  isSnkrsOfficialProductDescription,
  isSnkrsProductLotteryUrl,
} from "./catalog-quality";
import { isSecondaryMarketUrl, isGenericBrandHubUrl, normalizeCatalogBrand } from "./official-links";
import { hasTrustworthyReleaseDate } from "./release-date";

export type DashboardCatalogRow = {
  id?: string;
  source: string;
  external_id?: string | null;
  brand?: string;
  release_date: string;
  description: string;
  image_url: string | null;
  lottery_url: string | null;
};

export type DashboardQualityFailure =
  | "e2e_fixture"
  | "missing_source_url"
  | "invalid_source_url"
  | "secondary_market_url"
  | "placeholder_image"
  | "untrusted_release_date";

/** 発売元 / 発表元としてユーザーが辿れる外部 URL か */
export function hasValidDashboardSourceUrl(
  row: Pick<DashboardCatalogRow, "source" | "lottery_url" | "brand">,
): boolean {
  const url = row.lottery_url?.trim();
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  if (isSecondaryMarketUrl(url)) return false;

  if (row.source === "snkrs") {
    return isSnkrsProductLotteryUrl(url);
  }

  if (row.source === "kicksdb") {
    const brand = normalizeCatalogBrand(row.brand ?? "");
    // Nike/Jordan は SNKRS 個別ページが無い KicksDB 行を掲載しない（トップ URL のみでは新作扱いにしない）
    if ((brand === "Nike" || brand === "Jordan") && isGenericBrandHubUrl(url)) {
      return false;
    }
  }

  return true;
}

/** 商品固有の正しい画像 URL か（Unsplash プレースホルダー不可） */
export function hasValidDashboardProductImage(
  imageUrl: string | null | undefined,
): boolean {
  return !isRadarPlaceholderImage(imageUrl);
}

function isE2eExternalId(externalId: string | null | undefined): boolean {
  if (!externalId) return false;
  return externalId.toLowerCase().startsWith("e2e-");
}

/** ダッシュボード品質チェック失敗理由（最初の1件） */
export function getDashboardQualityFailure(
  row: DashboardCatalogRow,
  today = new Date(),
): DashboardQualityFailure | null {
  if (isE2eExternalId(row.external_id)) return "e2e_fixture";
  if (!row.lottery_url?.trim()) return "missing_source_url";
  if (!hasValidDashboardSourceUrl(row)) {
    if (isSecondaryMarketUrl(row.lottery_url)) return "secondary_market_url";
    return "invalid_source_url";
  }
  if (!hasValidDashboardProductImage(row.image_url)) return "placeholder_image";
  if (!hasTrustworthyReleaseDate(row, today)) return "untrusted_release_date";
  return null;
}

/** ダッシュボード掲載の3品質基準（発売日・画像・ソースURL）をすべて満たすか */
export function meetsDashboardCatalogQuality(row: DashboardCatalogRow, today = new Date()): boolean {
  return getDashboardQualityFailure(row, today) === null;
}

/** SNKRS 公式個別ページ由来の行か（説明文マーカーで判定） */
export function isSnkrsOfficialCatalogRow(row: Pick<DashboardCatalogRow, "source" | "description">): boolean {
  return row.source === "snkrs" && isSnkrsOfficialProductDescription(row.description);
}
