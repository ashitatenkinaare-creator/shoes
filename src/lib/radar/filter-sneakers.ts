import type { SneakerRadarItem, UserPreferences } from "@/types/radar";

/** ユーザー条件（レア / コラボ / ブランド）でカタログを絞り込む */
export function filterSneakersByPreferences(
  items: SneakerRadarItem[],
  preferences: UserPreferences,
): SneakerRadarItem[] {
  return items.filter((item) => {
    if (preferences.brands.length > 0 && !preferences.brands.includes(item.brand)) {
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
