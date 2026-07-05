import type { SneakerRadarItem, UserPreferences } from "@/types/radar";
import {
  matchesAnyCollabBrand,
  matchesAnySilhouette,
} from "@/lib/radar/silhouette-keywords";

/** ユーザー条件でカタログを絞り込む */
export function filterSneakersByPreferences(
  items: SneakerRadarItem[],
  preferences: UserPreferences,
): SneakerRadarItem[] {
  return items.filter((item) => {
    if (preferences.brands.length > 0 && !preferences.brands.includes(item.brand)) {
      return false;
    }
    if (!matchesAnySilhouette(item.modelName, item.brand, preferences.silhouettes)) {
      return false;
    }
    if (!matchesAnyCollabBrand(item.modelName, item.brand, preferences.collabBrands)) {
      return false;
    }
    if (
      preferences.categories.length > 0 &&
      !preferences.categories.includes(item.categorySlug)
    ) {
      return false;
    }
    if (preferences.filterRare && !item.isRare) {
      return false;
    }
    if (preferences.filterCollab && !item.isCollab) {
      return false;
    }
    return true;
  });
}

export type SneakerCatalogFilters = Pick<UserPreferences, "filterRare" | "filterCollab">;
