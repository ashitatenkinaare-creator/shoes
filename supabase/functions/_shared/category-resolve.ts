import type { SupabaseClient } from "@supabase/supabase-js";

/** マイグレーション seed と一致（未適用 DB でも同期時に自動 upsert） */
export const RADAR_CATEGORY_SEEDS: Record<
  string,
  { label: string; description: string; sort_order: number }
> = {
  sneakers: {
    label: "スニーカー",
    description: "フットウェア・スニーカー新作",
    sort_order: 1,
  },
  apparel: {
    label: "アパレル",
    description: "Gパン・Gジャン等のアパレル",
    sort_order: 2,
  },
  accessories: {
    label: "雑貨",
    description: "時計・バッグ等の雑貨",
    sort_order: 3,
  },
};

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

/** 同期用: slug が未登録なら seed から upsert して category_id を返す */
export async function ensureCategoryIdBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<string | null> {
  const normalized = slug.trim().toLowerCase();
  const existing = await resolveCategoryIdBySlug(supabase, normalized);
  if (existing) return existing;

  const seed = RADAR_CATEGORY_SEEDS[normalized];
  if (!seed) return null;

  const { data, error } = await supabase
    .from("radar_categories")
    .upsert(
      {
        slug: normalized,
        label: seed.label,
        description: seed.description,
        sort_order: seed.sort_order,
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return data.id;
}

export async function attachCategoryId<T extends { category_slug: string }>(
  supabase: SupabaseClient,
  row: T,
): Promise<(Omit<T, "category_slug"> & { category_id: string }) | null> {
  const categoryId = await ensureCategoryIdBySlug(supabase, row.category_slug);
  if (!categoryId) return null;

  const { category_slug, ...rest } = row;
  void category_slug;
  return { ...rest, category_id: categoryId };
}
