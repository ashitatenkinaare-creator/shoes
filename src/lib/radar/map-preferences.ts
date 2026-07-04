import type { UserPreferences } from "@/types/radar";
import type { UserPreferencesRow } from "@/types/radar-db";

export function rowToPreferences(row: UserPreferencesRow): UserPreferences {
  return {
    brands: row.brands,
    sizes: row.sizes,
    notifyOnAnnouncement: row.notify_on_announcement,
    notifyOnRelease: row.notify_on_release,
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
    notify_on_announcement: preferences.notifyOnAnnouncement,
    notify_on_release: preferences.notifyOnRelease,
  };
}
