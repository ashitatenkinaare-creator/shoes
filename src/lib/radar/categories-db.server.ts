import type { PostgrestError } from "@supabase/supabase-js";
import { rowToCategory } from "@/lib/radar/map-radar-category";
import { createServerSupabase } from "@/lib/supabase/server";
import type { RadarCategory } from "@/lib/radar/categories";
import type { RadarCategoryRow, RadarDbResult } from "@/types/radar-db";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

/** Server Component / Route Handler 専用 */
export async function fetchActiveCategories(): Promise<RadarDbResult<RadarCategory[]>> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("radar_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { data: null, error: formatError(error, "カテゴリの取得に失敗しました") };
  }

  return { data: (data as RadarCategoryRow[]).map(rowToCategory), error: null };
}
