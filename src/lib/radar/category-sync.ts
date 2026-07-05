import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveCategoryIdBySlug } from "@/lib/radar/categories-db";

export async function attachCategoryId<T extends { category_slug: string }>(
  supabase: SupabaseClient,
  row: T,
): Promise<(Omit<T, "category_slug"> & { category_id: string }) | null> {
  const categoryId = await resolveCategoryIdBySlug(supabase, row.category_slug);
  if (!categoryId) return null;

  const { category_slug: _slug, ...rest } = row;
  return { ...rest, category_id: categoryId };
}
