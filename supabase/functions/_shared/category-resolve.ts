import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveCategoryIdBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<string | null> {
  const normalized = slug.trim().toLowerCase();
  const { data, error } = await supabase
    .from("radar_categories")
    .select("id")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id;
}

export async function attachCategoryId<T extends { category_slug: string }>(
  supabase: SupabaseClient,
  row: T,
): Promise<(Omit<T, "category_slug"> & { category_id: string }) | null> {
  const categoryId = await resolveCategoryIdBySlug(supabase, row.category_slug);
  if (!categoryId) return null;

  const { category_slug: _slug, ...rest } = row;
  return { ...rest, category_id: categoryId };
}
