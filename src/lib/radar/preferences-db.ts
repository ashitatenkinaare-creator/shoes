import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { rowToPreferences, preferencesToRow } from "@/lib/radar/map-preferences";
import type { UserPreferences } from "@/types/radar";
import type { RadarDbResult, UserPreferencesRow } from "@/types/radar-db";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

export async function fetchUserPreferences(
  userId: string,
): Promise<RadarDbResult<UserPreferences | null>> {
  const { data, error } = await getSupabase()
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: formatError(error, "条件設定の取得に失敗しました"),
    };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: rowToPreferences(data as UserPreferencesRow), error: null };
}

export async function upsertUserPreferences(
  userId: string,
  preferences: UserPreferences,
): Promise<RadarDbResult<UserPreferences>> {
  const payload = preferencesToRow(userId, preferences);

  const { data, error } = await getSupabase()
    .from("user_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    return {
      data: null,
      error: formatError(error, "条件設定の保存に失敗しました"),
    };
  }

  return { data: rowToPreferences(data as UserPreferencesRow), error: null };
}
