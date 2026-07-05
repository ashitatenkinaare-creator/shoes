import type { PostgrestError } from "@supabase/supabase-js";
import {
  isValidCategorySlug,
  normalizeCategorySlug,
  type RadarCategory,
  type RegisterRadarCategoryInput,
} from "@/lib/radar/categories";
import { registerInputToRow, rowToCategory } from "@/lib/radar/map-radar-category";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSupabase } from "@/lib/supabase/client";
import type { RadarCategoryRow, RadarDbResult } from "@/types/radar-db";

function formatError(error: PostgrestError, context: string): string {
  return `${context}: ${error.message}`;
}

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

export async function fetchActiveCategoriesClient(): Promise<RadarDbResult<RadarCategory[]>> {
  const { data, error } = await getSupabase()
    .from("radar_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { data: null, error: formatError(error, "カテゴリの取得に失敗しました") };
  }

  return { data: (data as RadarCategoryRow[]).map(rowToCategory), error: null };
}

/** Service Role / 管理スクリプト向け: カテゴリ新規登録 */
export async function registerRadarCategory(
  supabase: ReturnType<typeof getSupabase>,
  input: RegisterRadarCategoryInput,
): Promise<RadarDbResult<RadarCategory>> {
  const slug = normalizeCategorySlug(input.slug);
  if (!isValidCategorySlug(slug)) {
    return { data: null, error: "slug は小文字英数字とハイフンのみ使用できます" };
  }

  const row = registerInputToRow(input);
  const { data, error } = await supabase
    .from("radar_categories")
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: formatError(error, "カテゴリの登録に失敗しました") };
  }

  return { data: rowToCategory(data as RadarCategoryRow), error: null };
}

/** slug → category_id 解決（同期処理用） */
export async function resolveCategoryIdBySlug(
  supabase: ReturnType<typeof getSupabase>,
  slug: string,
): Promise<string | null> {
  const normalized = normalizeCategorySlug(slug);
  const { data, error } = await supabase
    .from("radar_categories")
    .select("id")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id;
}
