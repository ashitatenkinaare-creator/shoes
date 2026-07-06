import { isGenericBrandHubUrl } from "./official-links";

export type LotterySourceRow = {
  slug: string;
  label: string;
  brand_pattern: string;
  model_pattern: string;
  news_url: string | null;
  lottery_url: string | null;
  priority: number;
  is_active: boolean;
};

export type OfficialUrlMatch = {
  news_url: string | null;
  lottery_url: string | null;
  source_slug: string | null;
};

/** レジストリ同期用: 個別 URL を優先しつつブランド総合ページも lottery_url に保存 */
export function pickRegistryLotteryUrl(
  current: string | null,
  candidate: string | null,
): string | null {
  if (current && !isGenericBrandHubUrl(current)) return current;
  if (candidate?.trim()) return candidate.trim();
  if (current?.trim()) return current.trim();
  return null;
}

function compilePattern(pattern: string): RegExp {
  return new RegExp(pattern, "i");
}

/** 登録ソースからブランド/モデルに最適な公式 URL を解決（優先度降順） */
export function matchOfficialUrlsFromSources(
  brand: string,
  modelName: string,
  sources: LotterySourceRow[],
): OfficialUrlMatch {
  const sorted = [...sources]
    .filter((source) => source.is_active)
    .sort((a, b) => b.priority - a.priority);

  for (const source of sorted) {
    const brandRe = compilePattern(source.brand_pattern);
    const modelRe = compilePattern(source.model_pattern);
    if (!brandRe.test(brand.trim()) || !modelRe.test(modelName.trim())) continue;

    return {
      news_url: source.news_url,
      lottery_url: source.lottery_url,
      source_slug: source.slug,
    };
  }

  return { news_url: null, lottery_url: null, source_slug: null };
}
