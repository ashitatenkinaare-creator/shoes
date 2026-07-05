import silhouetteKeywords from "../../../config/silhouette-keywords.json";

export type SilhouetteKeywordsConfig = {
  silhouettes: Record<string, string[]>;
};

export const silhouetteKeywordsConfig = silhouetteKeywords as SilhouetteKeywordsConfig;

/** 設定 UI 用のシルエット名一覧 */
export const AVAILABLE_SILHOUETTES = Object.keys(silhouetteKeywordsConfig.silhouettes);

/** 設定 UI 用（KITH / BEAMS / Brooks Brothers 等） */
export const AVAILABLE_COLLAB_BRANDS = ["KITH", "BEAMS", "Brooks Brothers"] as const;

function normalizeHaystack(modelName: string, brand = ""): string {
  return `${brand} ${modelName}`.trim().toLowerCase();
}

export function matchesSilhouette(
  modelName: string,
  brand: string,
  silhouetteName: string,
): boolean {
  const keywords = silhouetteKeywordsConfig.silhouettes[silhouetteName];
  if (!keywords?.length) return false;

  const haystack = normalizeHaystack(modelName, brand);
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function matchesAnySilhouette(
  modelName: string,
  brand: string,
  silhouettes: string[],
): boolean {
  if (silhouettes.length === 0) return true;
  return silhouettes.some((name) => matchesSilhouette(modelName, brand, name));
}

export function matchesCollabBrand(modelName: string, brand: string, collabBrand: string): boolean {
  const haystack = normalizeHaystack(modelName, brand);
  return haystack.includes(collabBrand.toLowerCase());
}

export function matchesAnyCollabBrand(
  modelName: string,
  brand: string,
  collabBrands: string[],
): boolean {
  if (collabBrands.length === 0) return true;
  return collabBrands.some((name) => matchesCollabBrand(modelName, brand, name));
}
