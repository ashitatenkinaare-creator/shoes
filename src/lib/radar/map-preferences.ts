import type { UserPreferences } from "@/types/radar";
import type { UserPreferencesRow } from "@/types/radar-db";

export function rowToPreferences(row: UserPreferencesRow): UserPreferences {
  return {
    brands: row.brands,
    sizes: row.sizes,
    silhouettes: row.silhouettes ?? [],
    collabBrands: row.collab_brands ?? [],
    categories: row.categories ?? [],
    notifyOnAnnouncement: row.notify_on_announcement,
    notifyOnRelease: row.notify_on_release,
    filterRare: row.filter_rare ?? false,
    filterCollab: row.filter_collab ?? false,
  };
}

export function preferencesToRow(
  userId: string,
  preferences: UserPreferences,
): Omit<UserPreferencesRow, "created_at" | "updated_at"> {
  return {
    user_id: userId,
    brands: preferences.brands,
    sizes: preferences.sizes,
    silhouettes: preferences.silhouettes,
    collab_brands: preferences.collabBrands,
    categories: preferences.categories,
    notify_on_announcement: preferences.notifyOnAnnouncement,
    notify_on_release: preferences.notifyOnRelease,
    filter_rare: preferences.filterRare,
    filter_collab: preferences.filterCollab,
  };
}
