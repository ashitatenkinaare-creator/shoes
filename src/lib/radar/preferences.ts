import type { UserPreferences } from "@/types/radar";
import { MOCK_PREFERENCES, PREFERENCES_STORAGE_KEY } from "@/data/radar-mock";
import { fetchUserPreferences, upsertUserPreferences } from "@/lib/radar/preferences-db";

export function loadLocalPreferences(): UserPreferences {
  if (typeof window === "undefined") return MOCK_PREFERENCES;

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return MOCK_PREFERENCES;
    return { ...MOCK_PREFERENCES, ...JSON.parse(raw) } as UserPreferences;
  } catch {
    return MOCK_PREFERENCES;
  }
}

export function saveLocalPreferences(preferences: UserPreferences): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export async function loadPreferencesForUser(
  userId: string,
): Promise<{ preferences: UserPreferences; source: "remote" | "default" }> {
  const { data, error } = await fetchUserPreferences(userId);

  if (error) throw new Error(error);
  if (data) return { preferences: data, source: "remote" };

  return { preferences: MOCK_PREFERENCES, source: "default" };
}

export async function savePreferencesForUser(
  userId: string,
  preferences: UserPreferences,
): Promise<UserPreferences> {
  const { data, error } = await upsertUserPreferences(userId, preferences);
  if (error) throw new Error(error);
  if (!data) throw new Error("条件設定の保存に失敗しました");
  return data;
}

/** @deprecated loadLocalPreferences を使用 */
export const loadPreferences = loadLocalPreferences;

/** @deprecated saveLocalPreferences を使用 */
export const savePreferences = saveLocalPreferences;
