import type { SupabaseClient } from "@supabase/supabase-js";
import { preferencesToRow, rowToPreferences } from "@/lib/radar/map-preferences";
import { createServerSupabase } from "@/lib/supabase/server";
import type { UserPreferences } from "@/types/radar";
import type { UserPreferencesRow } from "@/types/radar-db";

export async function fetchServerUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return rowToPreferences(data as UserPreferencesRow);
}

/** サーバー側セッション（Cookie JWT）で user_preferences を保存 */
export async function upsertServerUserPreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: UserPreferences,
): Promise<{ data: UserPreferences | null; error: string | null }> {
  const payload = preferencesToRow(userId, preferences);

  const { data: existing, error: selectError } = await supabase
    .from("user_preferences")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return { data: null, error: selectError.message };
  }

  const writeQuery = existing
    ? supabase.from("user_preferences").update(payload).eq("user_id", userId)
    : supabase.from("user_preferences").insert(payload);

  const { data, error } = await writeQuery.select("*").single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "条件設定の保存に失敗しました" };
  }

  return { data: rowToPreferences(data as UserPreferencesRow), error: null };
}

export async function getAuthenticatedServerUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: error?.message ?? "Unauthorized" };
  }

  return { supabase, user, error: null };
}
