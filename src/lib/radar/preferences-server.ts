import { rowToPreferences } from "@/lib/radar/map-preferences";
import { createServerSupabase } from "@/lib/supabase/server";
import type { UserPreferences } from "@/types/radar";
import type { UserPreferencesRow } from "@/types/radar-db";

export async function fetchServerUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
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
